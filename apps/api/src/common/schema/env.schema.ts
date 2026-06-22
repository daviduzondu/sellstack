import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(1711),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string(),
  BACKEND_URL: z.url(),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  S3_ENDPOINT: z.string(),
  ACCESS_KEY: z.string(),
  SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  AWS_REGION: z.string(),
  JWT_SECRET: z.string(),
});
