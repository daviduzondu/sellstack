import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { STORE_NOT_FOUND } from 'src/common/constants/error-messages.constants';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateNewProductResponseDto } from 'src/modules/product/dto/response/create-product.response';

export const CreateNewProductApiResponses = () =>
  applyDecorators(
    ApiOkResponse({ type: CreateNewProductResponseDto }),
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(STORE_NOT_FOUND) }),
    ApiBadRequestResponse({
      description: 'Validation failed',
      schema: {
        example: {
          statusCode: 400,
          message: ['name must be a string'],
          error: 'Bad Request',
        },
      },
    }),
  );
