import { Injectable } from '@nestjs/common';
import {
  PRODUCT_ALREADY_EXISTS_IN_CART,
  PRODUCT_OR_VARIANT_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { Db } from 'src/common/decorators/db.decorator';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import type { Database } from 'src/common/types/types.common';
import { ProductService } from 'src/modules/product/product.service';
import { StoreService } from 'src/modules/store/store.service';

@Injectable()
export class CartService {
  constructor(
    @Db() private readonly db: Database,
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  checkoutCart() {}

  async addProductToCart({
    variantId,
    userId,
    cartId,
    quantity = 1,
  }: {
    variantId: string;
    userId: string;
    cartId?: string;
    quantity: number;
  }) {
    const store =
      await this.storeService.getStoreInfoFromProductVariant(variantId);
    const product = await this.productService.getVariantInfo(variantId);
    if (!store || !product)
      throw new NotFoundError(PRODUCT_OR_VARIANT_NOT_FOUND);

    await this.db.transaction().execute(async (trx) => {
      const newCart = cartId
        ? await trx
            .selectFrom('carts')
            .where('userId', '=', userId)
            .where('checkedOutAt', 'is', null)
            .select(['storeId', 'userId', 'id'])
            .executeTakeFirstOrThrow()
        : await trx
            .insertInto('carts')
            .values({
              storeId: store.id,
              userId,
            })
            .returning(['storeId', 'userId', 'id'])
            .executeTakeFirstOrThrow();

      const cartItem = await trx
        .insertInto('cart_items')
        .values({
          cartId: newCart.id,
          unitPrice: product.price,
          variantId,
          quantity,
        })
        .onConflict((oc) => oc.columns(['variantId', 'cartId']).doNothing())
        .returning(['id', 'cartId', 'unitPrice', 'variantId', 'quantity'])
        .executeTakeFirst();

      if (!cartItem) throw new BadRequestError(PRODUCT_ALREADY_EXISTS_IN_CART);

      return { cart: newCart, cartItem };
    });
  }

  async removeItemFromCart({ cartItemId }: { cartItemId: string }) {}
}
