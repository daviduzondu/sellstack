import type { Kysely } from 'kysely';
import { executeWithTriggers, triggers } from 'src/utils/db/misc';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await executeWithTriggers({
    db,
    queries: [
      db.schema
        .alterTable('product_variants')
        .alterColumn('price', (col) => col.setDataType('bigint'))
        .alterColumn('minPrice', (col) => col.setDataType('bigint')),
    ],
    triggers,
  });
}
