import { Type } from '@sinclair/typebox';

export const GenerateUploadKeyResponseSchema = Type.Object({
  token: Type.String({ examples: ['json-web-token'] }),
});
