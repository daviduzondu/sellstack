import { ConflictException, Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db.decorator';
import { UserService } from 'src/modules/user/user.service';
import PG from 'pg';
import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  FAILED_TO_RESOLVE_ACCOUNT,
  SETTLEMENT_ACCOUNT_ALREADY_EXISTS,
  STORE_ALREADY_EXISTS,
  STORE_NOT_FOUND,
  USER_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { Currency, Productstatus } from 'src/modules/db/generated/types';
import { ListProductsInStoreResponseSchema } from 'src/modules/store/schema/response.schema';
import {
  type Database,
  SelectFromResponseSchema,
  ServiceResponse,
} from 'src/common/types/types.common';
import { PaystackService } from 'src/modules/paystack/paystack.service';
import { BadGatewayError } from 'src/common/errors/bad-gateway.error';
import { ConflictError } from 'src/common/errors/conflict.error';

@Injectable()
export class StoreService {
  constructor(
    @Db() private db: Database,
    private userService: UserService,
    private paystackService: PaystackService,
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

  async getSettlementAccount(storeId: string){
    return this.db.selectFrom("store_settlement_accounts").where('storeId', '=',storeId).select(['accountName', 'accountNumber', 'bank', 'isVerified', 'id', 'paystackSubAccountCode']).executeTakeFirst()
  }

  async addSettlementAccount({accountNumber, storeId, bankCode}:{accountNumber: number, storeId: string, bankCode: string}) {
    const store = await this.getStoreInfoFromStoreId(storeId);
    const {data: createSubaccountResponse, error: createSubaccountError} =   await this.paystackService.api.POST('/subaccount', {
      body: {
        account_number: String(accountNumber),
        business_name: store!.name,
        percentage_charge: 70,
        settlement_bank: bankCode,
        metadata: JSON.stringify({
          storeId,
        }),
      },
    });

    if (createSubaccountError) throw new BadGatewayError(FAILED_TO_RESOLVE_ACCOUNT);

    const queryResult = await this.db.insertInto("store_settlement_accounts").values({
      paystackBankCode: bankCode,
      accountName: createSubaccountResponse!.data.account_name!,
      accountNumber: String(accountNumber),
      bank: createSubaccountResponse!.data.settlement_bank,
      paystackSubAccountCode: createSubaccountResponse!.data.subaccount_code,
      currency: Currency.NGN,
      storeId,
      isVerified: createSubaccountResponse!.data.is_verified
    }).onConflict(oc=> oc.column("accountNumber").doNothing()).returning(['accountNumber', 'accountName', 'bank']).executeTakeFirst();

    if (!queryResult) throw new ConflictError(SETTLEMENT_ACCOUNT_ALREADY_EXISTS);

    return {
      success: true,
      accountNumber, 
      bank: createSubaccountResponse!.data.settlement_bank,
      accountName: createSubaccountResponse!.data.account_name!,
    }
  }
}
