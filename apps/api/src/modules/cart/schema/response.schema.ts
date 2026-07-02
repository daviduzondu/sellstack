import { Type } from '@sinclair/typebox';
import * as TypeboxSchema from 'src/modules/db/generated/typebox';

export const AddToCartResponseSchema = Type.Object({
  cart: Type.Pick(TypeboxSchema.Carts, ['id', 'storeId']),
  cartItem: Type.Pick(TypeboxSchema.CartItems, [
    'id',
    'cartId',
    'unitPrice',
    'variantId',
    'quantity',
  ]),
});

export const GetActiveCartResponseSchema = Type.Object({
  cart: Type.Pick(TypeboxSchema.Carts, [
    'id',
    'storeId',
    'userId',
  ] as (keyof typeof TypeboxSchema.Carts.properties)[]),
  items: Type.Array(
    Type.Pick(TypeboxSchema.CartItems, [
      'id',
      'cartId',
      'unitPrice',
      'variantId',
      'quantity',
    ]),
  ),
});

export const RemoveCartItemResponseSchema = Type.Object({
  success: Type.Literal(true),
});
