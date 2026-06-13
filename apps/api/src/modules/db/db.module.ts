import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { envSchema } from 'src/common/schema/env.schema';
import { KYSELY_INSTANCE } from 'src/constants';
import { z } from 'zod';

@Global()
@Module({
  exports: [KYSELY_INSTANCE],
  providers: [
    {
      provide: KYSELY_INSTANCE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<z.infer<typeof envSchema>>) =>
        new Kysely<any>({
          dialect: new PostgresDialect({
            pool: new Pool({
              connectionString: configService.get('DATABASE_URL'),
            }),
          }),
        }),
    },
  ],
})
export class DbModule {}
