import * as TypeboxSchema from 'src/modules/db/generated/typebox';
import { Type } from '@sinclair/typebox';

export const GetStoreResponseSchema = Type.Intersect([
  Type.Pick(TypeboxSchema.Stores, ['description', 'id', 'name', 'slug']),
  Type.Object({ ownerId: Type.String({ format: 'uuid' }) }),
]);

export const CreateStoreResponseSchema = Type.Object({
  name: Type.String(),
  ownerId: Type.String({ format: 'uuid' }),
});

export const ListProductsInStoreResponseSchema = Type.Object({
  storeId: Type.String({ format: 'uuid' }),
  products: Type.Array(
    Type.Omit(TypeboxSchema.Products, ['deletedAt', 'storeId']),
  ),
});

export const AddSettlementAccountResponseSchema = Type.Intersect([
  Type.Object({ success: Type.Literal(true) }),
  Type.Pick(TypeboxSchema.StoreSettlementAccounts, [
    'accountNumber',
    'accountName',
    'bank',
  ]),
]);
