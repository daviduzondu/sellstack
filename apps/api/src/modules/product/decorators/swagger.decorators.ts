import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { STORE_NOT_FOUND } from 'src/common/constants/error-messages.constants';
import {
  CommonApiBadRequestResponse,
  CommonApiUnauthorizedResponse,
} from 'src/common/decorators/api-responses';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateNewProductResponseSchema } from 'src/modules/product/dto/response.schema';
import { EditProductResponseSchema } from 'src/modules/product/dto/response.schema';

export const CreateNewProductApiResponses = () =>
  applyDecorators(
    ApiOkResponse({ schema: CreateNewProductResponseSchema }),
    CommonApiUnauthorizedResponse,
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(STORE_NOT_FOUND) }),
    CommonApiBadRequestResponse,
  );

export const GetProductDetailsApiResponses = () =>
  applyDecorators(
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(STORE_NOT_FOUND) }),
  );

export const EditProductApiResponses = () =>
  applyDecorators(
    CommonApiUnauthorizedResponse,
    ApiOkResponse({
      schema: EditProductResponseSchema,
    }),
  );
