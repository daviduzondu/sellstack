import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { PRODUCT_OR_VARIANT_NOT_FOUND } from 'src/common/constants/error-messages.constants';
import {
  CommonApiBadRequestResponse,
  CommonApiUnauthorizedResponse,
} from 'src/common/decorators/api-responses.decorator';
import { GenerateUploadKeyResponseSchema } from 'src/modules/storage/schema/response.schema';

export const GenerateUploadTokenApiResponses = () =>
  applyDecorators(
    ApiOkResponse({ schema: GenerateUploadKeyResponseSchema }),
    CommonApiUnauthorizedResponse,
    CommonApiBadRequestResponse,
    ApiNotFoundResponse({
      schema: NotFoundError.getSchema(PRODUCT_OR_VARIANT_NOT_FOUND),
    }),
  );

export const HandleTusUploadApiDocs = () =>
  applyDecorators(
    ApiOperation({
      description:
        '⚠️ TUS-related endpoint. Ideally, you interact with this endpoint with a client like Uppy. \n\n See https://uppy.io/docs/tus/ and https://tus.io/protocols/resumable-upload',
      externalDocs: {
        description: 'TUS implementation guide (with Uppy)',
        url: 'https://uppy.io/docs/tus/',
      },
    }),
    ApiHeader({ name: 'x-upload-token', required: true }),
    ApiHeader({
      name: 'Upload-Metadata',
      description:
        'Key-value pairs, comma-separated, values Base64-encoded (TUS protocol). Uppy defaults: `filename`, `filetype`, `name`, `relativePath`.',
      required: false,
    }),
  );
