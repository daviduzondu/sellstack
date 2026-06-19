import { Static, TSchema } from '@sinclair/typebox';
import { Auth } from 'better-auth';

export type ServiceResponse<T extends TSchema> = Static<T>;
export type BetterAuthSession = Auth['$Infer']['Session'];
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
