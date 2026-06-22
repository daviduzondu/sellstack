import { HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Type } from '@sinclair/typebox';

export const CommonApiUnauthorizedResponse = ApiUnauthorizedResponse({
  schema: Type.Object({
    code: Type.Literal('UNAUTHORIZED'),
    message: Type.Literal('Unauthorized'),
  }),
});

export const CommonApiBadRequestResponse = ApiBadRequestResponse({
  description: 'Validation failed',
  schema: Type.Object({
    statusCode: Type.Number({ examples: [HttpStatus['BAD_REQUEST']] }),
    message: Type.Array(Type.String({ examples: ['name must be a string'] })),
    error: Type.Literal('Bad Request'),
  }) as Record<any, any>,
});
