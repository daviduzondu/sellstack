import type { Kysely } from 'kysely';
import { executeWithTriggers } from 'src/utils/db/misc';
import { setUpdatedAt } from 'src/utils/db/sql/set-updated-at-trigger';

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
        .addColumn('isDefault', 'boolean', (col) =>
          col.notNull().defaultTo(true),
        ),
      db.schema
        .alterTable('product_variants')
        .addUniqueConstraint('one_default_variant_per_product', [
          'isDefault',
          'productId',
        ]),
    ],
    triggers: [setUpdatedAt],
  });
}
