import { sql, type Kysely } from 'kysely';
import { executeWithTriggers, triggers } from 'src/utils/db/misc';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await executeWithTriggers({
    db,
    triggers,
    queries: [
      db.schema
        .alterTable('cart_items')
        .addColumn('currency', sql`"Currency"`, (col) => col.notNull()),
    ],
  });
}
