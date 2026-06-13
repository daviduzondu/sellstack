import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(1711),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string(),
  BACKEND_URL: z.url(),
});
