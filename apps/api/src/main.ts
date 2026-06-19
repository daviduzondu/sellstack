import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { apiReference } from '@scalar/nestjs-api-reference';
import { envSchema } from 'src/common/schema/env.schema';
import { z } from 'zod';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpStatus, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const authService: AuthService<
    Auth<{ plugins: [ReturnType<typeof openAPI>] }>
  > = app.get(AuthService);
  const configService = app.get(ConfigService<z.infer<typeof envSchema>>);
  const betterAuthOpenAPISchema =
    (await authService.api.generateOpenAPISchema()) as OpenAPIObject;
  betterAuthOpenAPISchema.paths = Object.fromEntries(
    Object.entries(betterAuthOpenAPISchema.paths)
      .map(([k, v]) => {
        const path = (!k.startsWith('/api/auth') ? '/api/auth' : '') + k;
        const updatedV = Object.fromEntries(
          Object.entries(v).map(([method, operation]) =>
            path.includes('get') && method.toUpperCase() === 'POST'
              ? [method, undefined]
              : [method, { ...operation, tags: ['Auth'] }],
          ),
        );
        return [path, updatedV];
      })
      .filter(
        ([p]) =>
          (p as string).includes('email') ||
          (p as string).includes('session') ||
          (p as string).includes('sign-out'),
      ),
  ) as Record<string, any>;

  const config = new DocumentBuilder()
    .setTitle('Sellstack API Documentation')
    .setVersion('1.0')
    .addTag('Auth', 'All Better Auth related endpoints')
    .addServer(`${configService.get('BACKEND_URL')}`)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  const mergedDocument = _.merge(
    documentFactory(),
    Object.assign(betterAuthOpenAPISchema, {
      info: undefined,
      openapi: undefined,
      tags: undefined,
      servers: undefined,
    } as Partial<OpenAPIObject>),
  );

  app
    .getHttpAdapter()
    .getInstance()
    .get('/api/docs/json', (_req, res) => {
      res.status(HttpStatus.OK).json(mergedDocument);
    });

  app.use(
    '/api/docs',
    apiReference({
      content: mergedDocument,
      hideModels: true,
      theme: 'default',
      defaultOpenAllTags: true,
      expandAllSchemaProperties: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
