import { Injectable } from '@nestjs/common';
import { STORE_NOT_FOUND } from 'src/common/constants/error-messages.constants';
import { Db } from 'src/common/decorators/db.decorator';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { type Database, ServiceResponse } from 'src/common/types/types.common';
import { Producttype } from 'src/modules/db/generated/types';
import {
  CreateNewProductRequestDto,
  EditProductRequestDto,
} from 'src/modules/product/dto/request.dto';
import { EditProductResponseSchema } from 'src/modules/product/schema/response.schema';
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

  async editProductInfo(
    payload: EditProductRequestDto,
    productId: string,
  ): Promise<ServiceResponse<typeof EditProductResponseSchema>> {
    await this.db
      .updateTable('products')
      .set({
        ...payload,
      })
      .where('id', '=', productId)
      .returning(['id'])
      .executeTakeFirstOrThrow();

    return {
      success: true,
    };
  }

  async publishProduct() {}

  async unpublishProduct() {}
}
