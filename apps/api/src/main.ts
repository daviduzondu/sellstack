import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { envSchema } from 'src/common/schema/env.schema';
import { z } from 'zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const authService: AuthService<
    Auth<{ plugins: [ReturnType<typeof openAPI>] }>
  > = app.get(AuthService);
  const configService = app.get(ConfigService<z.infer<typeof envSchema>>);
  const betterAuthOpenAPISchema =
    (await authService.api.generateOpenAPISchema()) as OpenAPIObject;
  betterAuthOpenAPISchema.paths = Object.fromEntries(
    Object.entries(betterAuthOpenAPISchema.paths)
      .map(([k, v]) => {
        const path = (!k.startsWith('/api/auth') ? '/auth' : '') + k;
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
    .addServer(`${configService.get('BACKEND_URL')}/api`)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: '/api/docs/json',
    patchDocumentOnRequest(_req, _res, document) {
      const mergedDocument = _.merge(
        document,
        Object.assign(betterAuthOpenAPISchema, {
          info: undefined,
          openapi: undefined,
          tags: undefined,
          servers: undefined,
        } as Partial<OpenAPIObject>),
      );
      return mergedDocument;
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
