import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import {
  CART_ITEM_NOT_FOUND,
  CART_NOT_FOUND,
  FAILED_TO_CREATE_CART,
  PRODUCT_ALREADY_EXISTS_IN_CART,
  PRODUCT_OR_VARIANT_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { Db } from 'src/common/decorators/db.decorator';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { InternalServerError } from 'src/common/errors/internal-server.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import type { Database, ServiceResponse } from 'src/common/types/types.common';
import { AddToCartResponseSchema } from 'src/modules/cart/schema/response.schema';
import { Currency } from 'src/modules/db/generated/types';
import { ProductService } from 'src/modules/product/product.service';
import { StoreService } from 'src/modules/store/store.service';

@Injectable()
export class CartService {
  constructor(
    @Db() private readonly db: Database,
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  async getActiveCart(userId: string) {
    const cart = await this.db
      .selectFrom('carts')
      .where('userId', '=', userId)
      .where('checkedOutAt', 'is', null)
      .select(['storeId', 'userId', 'id', 'updatedAt'])
      .executeTakeFirst();

    if (!cart) throw new NotFoundError(CART_NOT_FOUND);

    const items = await this.db
      .selectFrom('cart_items')
      .innerJoin(
        'product_variants',
        'product_variants.id',
        'cart_items.variantId',
      )
      .innerJoin('products', 'products.id', 'product_variants.productId')
      .where('cartId', '=', cart.id)
      .select([
        'products.storeId as storeId',
        'cart_items.id as id',
        'cartId',
        'variantId',
        'quantity',
        'products.name as name',
        'products.type as type',
        'products.currency as currency',
        'products.longDescription',
        'products.shortDescription',
        'product_variants.price as price',
      ])
      .execute();

    return { cart, items };
  }

  async markActiveCartAsCompleted(userId: string) {
    const activeCart = await this.getActiveCart(userId);
    const result = await this.db
      .updateTable('carts')
      .set({
        checkedOutAt: sql`now()`,
      })
      .where('carts.id', '=', activeCart.cart.id)
      .returning(['carts.id'])
      .executeTakeFirst();
    if (result) return { success: true };
  }

  async addProductToCart({
    variantId,
    userId,
    quantity = 1,
  }: {
    variantId: string;
    userId: string;
    cartId?: string;
    quantity: number;
  }): Promise<ServiceResponse<typeof AddToCartResponseSchema>> {
    const store =
      await this.storeService.getStoreInfoFromProductVariant(variantId);
    const product = await this.productService.getVariantInfo(variantId);
    if (!store || !product)
      throw new NotFoundError(PRODUCT_OR_VARIANT_NOT_FOUND);

    const result = await this.db.transaction().execute(async (trx) => {
      const newCart =
        (await trx
          .selectFrom('carts')
          .where('userId', '=', userId)
          .where('checkedOutAt', 'is', null)
          .select(['storeId', 'id'])
          .executeTakeFirst()) ||
        (await trx
          .insertInto('carts')
          .values({
            storeId: store.id,
            userId,
          })
          .returning(['storeId', 'id'])
          .executeTakeFirstOrThrow(
            () => new InternalServerError(FAILED_TO_CREATE_CART),
          ));

      const cartItem = await trx
        .insertInto('cart_items')
        .values({
          cartId: newCart.id,
          unitPrice: product.price,
          variantId,
          quantity,
          currency: Currency.NGN,
        })
        .onConflict((oc) => oc.columns(['variantId', 'cartId']).doNothing())
        .returning(['id', 'cartId', 'unitPrice', 'variantId', 'quantity'])
        .executeTakeFirst();

      if (!cartItem) throw new BadRequestError(PRODUCT_ALREADY_EXISTS_IN_CART);

      return { cart: newCart, cartItem };
    });
    return result;
  }

  async removeItemFromCart({
    cartItemId,
    userId,
  }: {
    cartItemId: string;
    userId: string;
  }) {
    const cartItem = await this.db
      .selectFrom('cart_items')
      .innerJoin('carts', 'carts.id', 'cart_items.cartId')
      .where('cart_items.id', '=', cartItemId)
      .where('carts.userId', '=', userId)
      .select('cart_items.id')
      .executeTakeFirst();

    if (!cartItem) throw new NotFoundError(CART_ITEM_NOT_FOUND);

    await this.db
      .deleteFrom('cart_items')
      .where('id', '=', cartItemId)
      .execute();

    return { success: true };
  }
}
