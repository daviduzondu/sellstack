import { Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db';
import { ConfigService } from '@nestjs/config';
import type { Database, Env } from 'src/common/types/types.common';
import { S3Store } from '@tus/s3-store';
import { Server } from '@tus/server';

@Injectable()
export class StorageService {
  private s3Store: S3Store;
  public tus: Server;
  constructor(
    @Db() private readonly db: Database,
    private configService: ConfigService<Env>,
  ) {
    this.s3Store = new S3Store({
      partSize: 10 * 1024 * 1024,
      minPartSize: 10 * 1024 * 1024,
      s3ClientConfig: {
        bucket: this.configService.getOrThrow('S3_BUCKET'),
        region: this.configService.getOrThrow('AWS_REGION'),
        endpoint: this.configService.getOrThrow('S3_ENDPOINT'),
        credentials: {
          accessKeyId: this.configService.getOrThrow('ACCESS_KEY'),
          secretAccessKey: this.configService.getOrThrow('SECRET_KEY'),
        },
      },
    });

    this.tus = new Server({
      path: '/api/storage/uploads',
      datastore: this.s3Store,
      respectForwardedHeaders: true,
      namingFunction(_req, metadata) {
        return `${crypto.randomUUID()}${metadata ? '-' + metadata['filename'] : ''}`;
      },
      onUploadCreate: async (_req, upload) => {
        const meta = upload.metadata as Record<string, string> | undefined;
        if (meta?.['filetype']) {
          (upload.metadata as Record<string, string>).contentType =
            meta['filetype'];
        }
        return new Promise((res) => res({ metadata: upload.metadata }));
      },
    });
  }
}
