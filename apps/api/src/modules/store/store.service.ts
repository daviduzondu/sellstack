import { ConflictException, Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db.decorator';
import { UserService } from 'src/modules/user/user.service';
import PG from 'pg';
import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  STORE_ALREADY_EXISTS,
  STORE_NOT_FOUND,
  USER_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { Productstatus } from 'src/modules/db/generated/types';
import { ListProductsInStoreResponseSchema } from 'src/modules/store/schema/response.schema';
import {
  type Database,
  SelectFromResponseSchema,
  ServiceResponse,
} from 'src/common/types/types.common';

@Injectable()
export class StoreService {
  constructor(
    @Db() private db: Database,
    private userService: UserService,
  ) {}

  async getStoreInfoFromUserId(userId: string) {
    const store = await this.db
      .selectFrom('stores')
      .where('userId', '=', userId)
      .select(['id', 'name', 'slug', 'description', 'userId as ownerId'])
      .executeTakeFirst();
    return store;
  }

  async getStoreInfoFromProductVariant(variantId: string) {
    return await this.db
      .selectFrom('products')
      .innerJoin(
        'product_variants',
        'product_variants.productId',
        'products.id',
      )
      .where('product_variants.id', '=', variantId)
      .select('products.storeId as id')
      .executeTakeFirst();
  }

  async getStoreInfoFromStoreId(storeId: string) {
    const store = await this.db
      .selectFrom('stores')
      .where('id', '=', storeId)
      .select(['id', 'name', 'slug', 'description', 'userId as ownerId'])
      .executeTakeFirst();
    return store;
  }

  async createNewStore(userId: string, name: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundError(USER_NOT_FOUND);
    const result = await this.db
      .insertInto('stores')
      .values({
        slug: crypto.randomUUID(),
        name,
        userId: user.id,
      })
      .returning(['userId as ownerId', 'name'])
      .executeTakeFirstOrThrow()
      .catch((error) => {
        if (error instanceof PG.DatabaseError) {
          if (error.code === PG_UNIQUE_VIOLATION) {
            if (error.constraint === 'one_store_per_user')
              throw new ConflictException({
                message: STORE_ALREADY_EXISTS,
              });
          }
        }
        throw error;
      });

    return {
      name: result.name,
      ownerId: result.ownerId,
    };
  }

  async getStoreProducts(
    storeId: string,
    includeDrafts = false,
  ): Promise<ServiceResponse<typeof ListProductsInStoreResponseSchema>> {
    const store = await this.getStoreInfoFromStoreId(storeId);
    if (!store) throw new NotFoundError(STORE_NOT_FOUND);

    const result = await this.db
      .selectFrom('products')
      .where('storeId', '=', storeId)
      .$if(includeDrafts, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb('status', '=', Productstatus.PUBLISHED),
            eb('status', '=', Productstatus.DRAFT),
          ]),
        ),
      )
      .$if(!includeDrafts, (qb) =>
        qb.where('status', '=', Productstatus.PUBLISHED),
      )
      .select([
        'id',
        'name',
        'longDescription',
        'shortDescription',
        'currency',
        'status',
        'createdAt',
        'updatedAt',
        'userId',
        'type',
      ] satisfies SelectFromResponseSchema<
        typeof ListProductsInStoreResponseSchema,
        'products'
      >)
      .where('deletedAt', 'is', null)
      .execute();

    return {
      storeId,
      products: result,
    };
  }
}
