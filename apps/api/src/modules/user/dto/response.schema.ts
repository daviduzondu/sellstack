import { Type } from '@sinclair/typebox';

export const UserNotFoundResponseSchema = Type.Object({
  message: Type.Literal('User not found'),
});
