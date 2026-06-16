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
} from 'src/common/constants/error-messages.constants';
import { ConflictError } from 'src/common/errors/conflict.error';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateStoreResponseDto } from 'src/modules/store/dto/response/create-store.response';

export const CreateStoreApiResponses = () =>
  applyDecorators(
    ApiOperation({ description: 'Create Store' }),
    ApiOkResponse({ type: CreateStoreResponseDto }),
    ApiNotFoundResponse({ schema: NotFoundError.getSchema(USER_NOT_FOUND) }),
    ApiConflictResponse({
      schema: ConflictError.getSchema(STORE_ALREADY_EXISTS),
    }),
  );
