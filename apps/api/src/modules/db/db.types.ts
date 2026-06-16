import { Kysely } from 'kysely';
import { DB } from 'src/modules/db/generated/types';

export type Database = Kysely<DB>;
