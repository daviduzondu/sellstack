import { Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db.decorator';
import type { Database } from 'src/common/types/types.common';
import { OrderItems, Orderstatus } from 'src/modules/db/generated/types';
import { CartService } from 'src/modules/cart/cart.service';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import {
  ALREADY_MADE_PAYMENT,
  CART_NOT_FOUND,
  EMPTY_CART,
  FAILED_TO_RETRIEVE_SETTLEMENT_ACCOUNT,
  FAILED_TO_VERIFY_TRANSACTION,
  PAYSTACK_GATEWAY_ERROR,
} from 'src/common/constants/error-messages.constants';
import { Insertable } from 'kysely';
import { dinero, allocate, add, Dinero } from 'dinero.js';
import { NGN } from 'dinero.js';
import { PaystackService } from 'src/modules/paystack/paystack.service';
import { UserService } from 'src/modules/user/user.service';
import { BadGatewayError } from 'src/common/errors/bad-gateway.error';
import { stringify } from 'safe-stable-stringify';
import { createHash } from 'crypto';
import { PartialDeep } from 'type-fest';
import { ConflictError } from 'src/common/errors/conflict.error';
import { LedgerService } from 'src/modules/ledger/ledger.service';
import { StoreService } from 'src/modules/store/store.service';

@Injectable()
export class OrdersService {
  constructor(
    @Db() private readonly db: Database,
    private readonly cartService: CartService,
    private readonly paystackService: PaystackService,
    private readonly userService: UserService,
    private readonly ledgerService: LedgerService,
    private readonly storeService: StoreService
  ) {}

  private getIdempotencyKey(data: object) {
    return createHash('sha256').update(stringify(data)).digest('hex');
  }

  private calculateOrderShares(
    activeCart: Awaited<ReturnType<typeof this.cartService.getActiveCart>>,
  ) {
    let totalDineroPlatformShare = dinero({ amount: 0, currency: NGN });
    let totalDineroSellerShare = dinero({ amount: 0, currency: NGN });
    let itemShares: Record<
      string,
      {
        dineroPlatformShare: Dinero<number, 'NGN'>;
        dineroSellerShare: Dinero<number, 'NGN'>;
        dineroPrice: Dinero<number, 'NGN'>;
      }
    > = {};
    for (const item of activeCart.items) {
      const dineroPrice = dinero({
        amount: Number(item.price),
        currency: NGN,
      });
      const [dineroPlatformShare, dineroSellerShare] = allocate(
        dineroPrice,
        [30, 70],
      );
      totalDineroPlatformShare = add(
        totalDineroPlatformShare,
        dineroPlatformShare,
      );
      totalDineroSellerShare = add(totalDineroSellerShare, dineroSellerShare);
      itemShares = {
        ...itemShares,
        [item.id]: {
          dineroPlatformShare,
          dineroSellerShare,
          dineroPrice,
        },
      };
    }

    return { totalDineroPlatformShare, totalDineroSellerShare, itemShares };
  }

  async checkoutOrder(userId: string) {
    const trx = await this.db.startTransaction().execute();
    const cart = await this.cartService.getActiveCart(userId);
    const user = await this.userService.getUserById(userId);
    if (!cart) throw new BadRequestError(CART_NOT_FOUND);
    if (cart.items.length === 0) throw new BadRequestError(EMPTY_CART);
    const settlementAccount = await this.storeService.getSettlementAccount(cart.items[0].storeId);
    if (!settlementAccount) throw new BadRequestError(FAILED_TO_RETRIEVE_SETTLEMENT_ACCOUNT);
    const idempotencyKey = this.getIdempotencyKey({
      cart: {
        id: cart.cart.id,
        storeId: cart.cart.storeId,
        userId: cart.cart.userId,
      },
      items: cart.items.map((item) => ({
        cartId: item.cartId,
        price: item.price,
        quantity: item.quantity,
        id: item.id,
      })),
    } as PartialDeep<typeof cart>);

    const existingOrder = await this.db
      .selectFrom('orders')
      .where('reference', '=', idempotencyKey)
      .forUpdate()
      .select(['id', 'reference', 'status', 'authorizationUrl'])
      .executeTakeFirst();

    if (existingOrder?.status === Orderstatus.PAID)
      throw new ConflictError(ALREADY_MADE_PAYMENT);

    try {
      if (existingOrder) {
        const { data, error } = await this.paystackService.api.GET(
          '/transaction/verify/{reference}',
          {
            params: {
              path: {
                reference: idempotencyKey,
              },
            },
          },
        );
        if (error || !data)
          throw new BadGatewayError(FAILED_TO_VERIFY_TRANSACTION);

        if (data.data.log?.success) {
          await this.db
            .updateTable('orders')
            .set({
              status: Orderstatus.PAID,
              paidAt: data.data.paid_at,
            })
            .where('id', '=', existingOrder.id)
            .where('reference', '=', idempotencyKey)
            .execute();
          await this.cartService.markActiveCartAsCompleted(userId);
          await this.ledgerService.recordSale({
            amount:
              this.calculateOrderShares(cart).totalDineroSellerShare.toJSON()
                .amount,
            orderId: existingOrder.id,
            reason: `Payment for new order`,
            reference: existingOrder.reference,
          });
          throw new ConflictError(ALREADY_MADE_PAYMENT);
        }

        return {
          authorizationUrl: existingOrder.authorizationUrl,
        };
      }

      // let totalDineroPlatformShare = dinero({ amount: 0, currency: NGN });
      // let totalDineroSellerShare = dinero({ amount: 0, currency: NGN });
      const orderItems: Insertable<OrderItems>[] = [];
      const newOrder = await trx
        .insertInto('orders')
        .values({
          status: Orderstatus.PENDING,
          buyerId: userId,
          reference: idempotencyKey,
          cartId: cart.cart.id,
        })
        .onConflict((oc) =>
          oc.column('reference').doUpdateSet({
            status: Orderstatus.PENDING,
            buyerId: userId,
            reference: idempotencyKey,
            cartId: cart.cart.id,
          }),
        )
        .returning(['status', 'buyerId', 'reference', 'cartId', 'id'])
        .executeTakeFirstOrThrow();

      for (const item of cart.items) {
        const orderItemShare =
          this.calculateOrderShares(cart).itemShares[item.id];
        orderItems.push({
          name: item.name,
          currency: item.currency,
          longDescription: item.longDescription!,
          orderId: newOrder.id,
          unitPrice: orderItemShare.dineroPrice.toJSON().amount,
          platformFee: orderItemShare.dineroPlatformShare.toJSON().amount,
          sellerShare: orderItemShare.dineroSellerShare.toJSON().amount,
          shortDescription: item.shortDescription!,
          total: orderItemShare.dineroPrice.toJSON().amount,
          type: item.type,
        });
      }

      if (!existingOrder)
        await trx
          .insertInto('order_items')
          .values(orderItems)
          .executeTakeFirstOrThrow();

      const { data: result, error } = await this.paystackService.api.POST(
        '/transaction/initialize',
        {
          body: {
            amount: cart.items
              .map((item) =>
                dinero({ amount: Number(item.price), currency: NGN }),
              )
              .reduce((p, c) => add(p, c))
              .toJSON().amount,
            email: user!.email,
            currency: 'NGN', // TODO: Improve implementation in prod.
            bearer: 'account',
            subaccount: settlementAccount.paystackSubAccountCode,
            reference: idempotencyKey,
            transaction_charge: this.calculateOrderShares(cart)
              .totalDineroPlatformShare.toJSON()
              .amount.toString(),
          },
        },
      );

      if (error || !result) {
        throw new BadGatewayError(PAYSTACK_GATEWAY_ERROR);
      }

      await trx
        .updateTable('orders')
        .where('id', '=', newOrder.id)
        .set({
          authorizationUrl: result.data.authorization_url,
        })
        .execute();

      await trx.commit().execute();
      return {
        authorizationUrl: result.data.authorization_url,
      };
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }
}
