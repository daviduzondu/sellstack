import { Type } from '@sinclair/typebox';

export const CreateNewProductResponseSchema = Type.Object({
  name: Type.String(),
  productId: Type.String({ format: 'uuid' }),
  variantId: Type.String({ format: 'uuid' }),
});
