import { Static, TSchema } from '@sinclair/typebox';
import { Auth } from 'better-auth';
export type ServiceResponse<T extends TSchema> = Static<T>;
export type BetterAuthSession = Auth['$Infer']['Session'];
