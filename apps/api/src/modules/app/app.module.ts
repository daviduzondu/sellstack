import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from 'src/common/schema/env.schema';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth, z } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { DbModule } from 'src/modules/db/db.module';
import { KYSELY_INSTANCE } from 'src/common/constants/token.constants';
import { Kysely } from 'kysely';
import { ProductModule } from 'src/modules/product/product.module';
import { StoreModule } from 'src/modules/store/store.module';
import { UserModule } from 'src/modules/user/user.module';
import { StorageModule } from 'src/modules/storage/storage.module';

@Module({
  imports: [
    ProductModule,
    DbModule,
    StoreModule,
    UserModule,
    StorageModule,
    AuthModule.forRootAsync({
      inject: [KYSELY_INSTANCE, ConfigService],
      useFactory: (
        db: Kysely<any>,
        configService: ConfigService<z.infer<typeof envSchema>>,
      ) => ({
        auth: betterAuth({
          baseURL: configService.get('BACKEND_URL'),
          user: { modelName: 'users' },
          verification: { modelName: 'verifications' },
          session: { modelName: 'sessions' },
          account: { modelName: 'accounts' },
          appName: 'Sellstack',
          database: {
            db,
            type: 'postgres',
          },
          emailAndPassword: {
            enabled: true,
          },
          advanced: {
            database: {
              generateId: false,
            },
            disableOriginCheck: configService.get('NODE_ENV') === 'development',
          },
          plugins: [openAPI({ path: '' })],
          // trustedOrigins: [
          //   configService.get(''),
          //   configService.get('BACKEND_URL'),
          // ],
        }),
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);
        if (!parsed.success) {
          throw new Error('\nValidation Error: ' + String(parsed.error));
        }

        return parsed.data;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
