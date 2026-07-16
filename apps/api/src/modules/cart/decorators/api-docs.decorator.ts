import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CART_ITEM_NOT_FOUND,
  CART_NOT_FOUND,
  PRODUCT_ALREADY_EXISTS_IN_CART,
  PRODUCT_OR_VARIANT_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import {
  CommonApiBadRequestResponse,
  CommonApiUnauthorizedResponse,
} from 'src/common/decorators/api-responses.decorator';
import { NotFoundError } from 'src/common/errors/not-found.error';
import {
  AddToCartResponseSchema,
  GetActiveCartResponseSchema,
  RemoveCartItemResponseSchema,
} from 'src/modules/cart/schema/response.schema';

export const AddToCartApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Add item to cart' }),
    ApiOkResponse({ schema: AddToCartResponseSchema as object }),
    CommonApiUnauthorizedResponse,
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(PRODUCT_OR_VARIANT_NOT_FOUND),
    }),
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(CART_NOT_FOUND),
    }),
  );

export const GetActiveCartApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Get active cart' }),
    ApiOkResponse({ schema: GetActiveCartResponseSchema as object }),
    CommonApiUnauthorizedResponse,
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(CART_NOT_FOUND),
    }),
  );

export const RemoveCartItemApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Remove item from cart' }),
    ApiOkResponse({ schema: RemoveCartItemResponseSchema as object }),
    CommonApiUnauthorizedResponse,
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(CART_ITEM_NOT_FOUND),
    }),
  );
