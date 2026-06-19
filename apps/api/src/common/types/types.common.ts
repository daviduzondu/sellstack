import { Static, TSchema } from '@sinclair/typebox';
import { Auth } from 'better-auth';
import { Kysely } from 'kysely';
import { envSchema } from 'src/common/schema/env.schema';
import { DB } from 'src/modules/db/generated/types';
import z from 'zod';

export type Database = Kysely<DB>;
export type BetterAuthSession = Auth['$Infer']['Session'];
export type Env = z.infer<typeof envSchema>;

export type ServiceResponse<T extends TSchema> = Static<T>;
export type AwaitedReturnType<T extends (...args: any[]) => any> = Awaited<
  ReturnType<T>
>;
export type SelectFromResponseSchema<
  T extends TSchema,
  K extends {
    [P in keyof ServiceResponse<T>]: ServiceResponse<T>[P] extends unknown[]
      ? P
      : never;
  }[keyof ServiceResponse<T>],
> = Array<KeyOfOneOf<ServiceResponse<T>[K]>>;

export type KeyOfOneOf<T> = T extends (infer U)[] ? keyof U : never;
