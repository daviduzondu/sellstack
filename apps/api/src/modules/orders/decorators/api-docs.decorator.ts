import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  ALREADY_MADE_PAYMENT,
  CART_NOT_FOUND,
  FAILED_TO_RETRIEVE_SETTLEMENT_ACCOUNT,
} from 'src/common/constants/error-messages.constants';
import {
  CommonApiBadRequestResponse,
  CommonApiUnauthorizedResponse,
} from 'src/common/decorators/api-responses.decorator';
import { ConflictError } from 'src/common/errors/conflict.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CheckoutResponseSchema } from 'src/modules/orders/schema/response.schema';

export const CheckoutApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Checkout active cart and create order' }),
    ApiOkResponse({ schema: CheckoutResponseSchema as object }),
    CommonApiUnauthorizedResponse,
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(CART_NOT_FOUND) }),
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(FAILED_TO_RETRIEVE_SETTLEMENT_ACCOUNT),
    }),
    ApiConflictResponse({
      schema: ConflictError.getSchema(ALREADY_MADE_PAYMENT),
    }),
  );
