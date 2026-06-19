import { Injectable } from '@nestjs/common';
import { STORE_NOT_FOUND } from 'src/common/constants/error-messages.constants';
import { Db } from 'src/common/decorators/db';
import { NotFoundError } from 'src/common/errors/not-found.error';
import type { Database } from 'src/modules/db/db.types';
import { Producttype } from 'src/modules/db/generated/types';
import { CreateNewProductRequestDto } from 'src/modules/product/dto/request.dto';
import { StoreService } from 'src/modules/store/store.service';

@Injectable()
export class ProductService {
  constructor(
    @Db() private db: Database,
    private storeService: StoreService,
  ) {}

  async createNewProduct(payload: CreateNewProductRequestDto, userId: string) {
    const store = await this.storeService.getStoreInfoFromUserId(userId);
    if (!store) throw new NotFoundError(STORE_NOT_FOUND);

    const result = await this.db.transaction().execute(async (trx) => {
      const newProduct = await trx
        .insertInto('products')
        .values({
          type: payload.type,
          userId,
          storeId: store.id,
          name: payload.name,
          shortDescription: payload.shortDescription,
          longDescription: payload.longDescription,
        })
        .returning(['name', 'id'])
        .executeTakeFirstOrThrow();

      const newDefaultProductVariant = await trx
        .insertInto('product_variants')
        .values({
          name: payload.name,
          isDefault: true,
          price: payload.price,
          productId: newProduct.id,
          shortDescription: payload.shortDescription,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      if (payload.type === Producttype.EBOOK) {
        await trx
          .insertInto('ebooks')
          .values({
            variantId: newDefaultProductVariant.id,
          })
          .returning(['id'])
          .executeTakeFirstOrThrow();
      }
      return { newProduct, newDefaultProductVariant };
    });

    return {
      name: result.newProduct.name,
      productId: result.newProduct.id,
      variantId: result.newDefaultProductVariant.id,
    };
  }
}
