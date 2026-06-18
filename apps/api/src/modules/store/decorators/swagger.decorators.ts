import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  USER_NOT_FOUND,
  STORE_ALREADY_EXISTS,
  STORE_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import {
  CommonApiBadRequestResponse,
  CommonApiUnauthorizedResponse,
} from 'src/common/decorators/api-responses';
import { ConflictError } from 'src/common/errors/conflict.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  CreateStoreResponseSchema,
  ListProductsInStoreResponseSchema,
} from 'src/modules/store/dto/response.schema';

export const CreateStoreApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Create Store' }),
    ApiOkResponse({ schema: CreateStoreResponseSchema }),
    CommonApiUnauthorizedResponse,
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(USER_NOT_FOUND) }),
    ApiConflictResponse({
      schema: ConflictError.getSchema(STORE_ALREADY_EXISTS),
    }),
  );

export const ListStoreProductsApiResponses = () =>
  applyDecorators(
    ApiOkResponse({
      schema: ListProductsInStoreResponseSchema,
      description: 'Products found',
    }),
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(STORE_NOT_FOUND) }),
  );
