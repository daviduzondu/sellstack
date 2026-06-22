import { Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db.decorator';
import { ConfigService } from '@nestjs/config';
import { S3Store } from '@tus/s3-store';
import { Server } from '@tus/server';
import {
  GenerateUploadKeyRequestDto,
  UploadType,
} from 'src/modules/storage/dto/request.dto';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { Producttype } from 'src/modules/db/generated/types';
import { JwtService } from '@nestjs/jwt';
import type {
  Database,
  Env,
  ServiceResponse,
} from 'src/common/types/types.common';
import { UploadTokenJWTPayload, TusMetadata } from './types/storage.types';
import {
  FAILED_TO_UPLOAD,
  INTERNAL_SERVER_ERROR,
  INVALID_UPLOAD_TOKEN,
  PRODUCT_OR_VARIANT_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { GenerateUploadKeyResponseSchema } from 'src/modules/storage/schema/response.schema';
import { UnsupportedMediaTypeError } from 'src/common/errors/unsupported-media-type.error';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { DatabaseError } from 'pg';
import { InternalServerError } from 'src/common/errors/internal-server.error';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Store: S3Store;
  public tus: Server;
  public s3client: S3Client;
  constructor(
    @Db() private readonly db: Database,
    private configService: ConfigService<Env>,
    private jwtService: JwtService,
  ) {
    const credentials = {
      accessKeyId: this.configService.getOrThrow<string>('ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow<string>('SECRET_KEY'),
    };
    this.s3client = new S3Client({
      region: configService.getOrThrow('AWS_REGION'),
      endpoint: this.configService.getOrThrow('S3_ENDPOINT'),
      credentials,
    });
    this.s3Store = new S3Store({
      partSize: 10 * 1024 * 1024,
      minPartSize: 10 * 1024 * 1024,
      s3ClientConfig: {
        bucket: this.configService.getOrThrow('S3_BUCKET'),
        region: this.configService.getOrThrow('AWS_REGION'),
        endpoint: this.configService.getOrThrow('S3_ENDPOINT'),
        credentials,
      },
    });

    this.tus = new Server({
      path: '/api/storage/uploads',
      datastore: this.s3Store,
      respectForwardedHeaders: true,
      maxSize: (req) => {
        const decodedUploadToken =
          this.jwtService.verify<UploadTokenJWTPayload>(
            req.headers.get('x-upload-token') as string,
          );

        return Number(decodedUploadToken.maxFileSize);
      },
      namingFunction(_req, metadata) {
        const meta = metadata as TusMetadata | undefined;
        return `${crypto.randomUUID()}${meta?.filename ? '-' + meta.filename : ''}`;
      },
      onResponseError(_req, err) {
        if (err instanceof DatabaseError) {
          throw new InternalServerError(INTERNAL_SERVER_ERROR);
        }
        throw new BadRequestError((err as Error).message ?? FAILED_TO_UPLOAD);
      },
      onUploadFinish: async (req, upload) => {
        let decodedUploadToken: UploadTokenJWTPayload;
        try {
          decodedUploadToken = this.jwtService.verify<UploadTokenJWTPayload>(
            req.headers.get('x-upload-token') as string,
          );
        } catch {
          throw new UnauthorizedError(INVALID_UPLOAD_TOKEN);
        }
        if (decodedUploadToken.uploadType === UploadType.PRODUCT) {
          await db
            .insertInto('product_files')
            .values({
              fileName: (upload.metadata as TusMetadata).filename!,
              fileSizeBytes: upload.size!,
              s3_key: upload.id,
              mimeType: upload.storage!.type,
              variantId: decodedUploadToken.variantId!,
            })
            .execute()
            .catch(async (error) => {
              const deleteFileCommand = new DeleteObjectCommand({
                Bucket: this.configService.getOrThrow('S3_BUCKET'),
                Key: upload.id,
              });
              const deleteSidecarFileGeneratedByTusCommand =
                new DeleteObjectCommand({
                  Bucket: this.configService.getOrThrow('S3_BUCKET'),
                  Key: upload.id + '.info',
                });
              await Promise.all([
                this.s3client.send(deleteFileCommand),
                this.s3client.send(deleteSidecarFileGeneratedByTusCommand),
              ]);
              throw error;
            });
        }

        return {};
      },
      onUploadCreate: (req, upload) => {
        const meta = upload.metadata as TusMetadata | undefined;

        let decodedUploadToken: UploadTokenJWTPayload | undefined;
        try {
          decodedUploadToken = this.jwtService.verify<UploadTokenJWTPayload>(
            req.headers.get('x-upload-token') as string,
          );
        } catch {
          throw new UnauthorizedError(INVALID_UPLOAD_TOKEN);
        }

        if (meta?.filetype) {
          (upload.metadata as TusMetadata).contentType = meta.filetype;
        }

        if (decodedUploadToken) {
          if (
            decodedUploadToken.allowedMimeTypes?.length &&
            meta?.filetype &&
            !decodedUploadToken.allowedMimeTypes.includes(meta.filetype)
          ) {
            throw new UnsupportedMediaTypeError(
              `Unsupported file type "${meta.filetype}". Allowed: ${decodedUploadToken.allowedMimeTypes.join(', ')}`,
            );
          }
        }

        return new Promise((res) => res({ metadata: upload.metadata }));
      },
    });
  }

  async generateUploadToken(
    dto: GenerateUploadKeyRequestDto,
    userId: string,
  ): Promise<ServiceResponse<typeof GenerateUploadKeyResponseSchema>> {
    const payload = {} as UploadTokenJWTPayload;
    const variant = await (async () =>
      dto.uploadType === UploadType.PRODUCT
        ? await this.db
            .selectFrom('product_variants')
            .innerJoin('products', 'products.id', 'product_variants.productId')
            .where('product_variants.id', '=', dto.variantId!)
            .where('products.userId', '=', userId)
            .select([
              'products.type as type',
              'product_variants.id as variantId',
              'productId',
            ])
            .executeTakeFirstOrThrow(() => {
              return new NotFoundError(PRODUCT_OR_VARIANT_NOT_FOUND);
            })
        : undefined)();

    if (variant) {
      if (variant.type === Producttype.EBOOK) {
        payload['allowedMimeTypes'] = ['application/pdf'];
        payload['maxFileSize'] = 300 * 1024 * 1024;
        payload['variantId'] = dto.variantId;
        payload['productId'] = variant.productId;
        payload['uploadType'] = dto.uploadType;
      }
    }
    const token = this.jwtService.sign(payload);
    return {
      token,
    };
  }
}
