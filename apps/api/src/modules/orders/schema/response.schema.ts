import { Type } from '@sinclair/typebox';

export const CheckoutResponseSchema = Type.Object({
  authorizationUrl: Type.String(),
});
