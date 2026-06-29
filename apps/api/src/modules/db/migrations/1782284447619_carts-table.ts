import { sql, type Kysely } from 'kysely';
import { baseTable, executeWithTriggers, triggers } from 'src/utils/db/misc';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations

  await executeWithTriggers({
    db,
    queries: [
      baseTable('carts')
        .addColumn('userId', 'text', (col) =>
          col.notNull().references('users.id').onDelete('cascade'),
        )
        .addColumn('storeId', 'text', (col) =>
          col.references('stores.id').notNull(),
        )
        .addColumn('checkedOutAt', 'timestamptz')
        .on(db),
      db.schema
        .alterTable('carts')
        .addUniqueConstraint(
          'one_active_cart_per_user',
          ['checkedOutAt', 'userId'],
          (col) => col.nullsNotDistinct(),
        ),
      baseTable('cart_items')
        .addColumn('cartId', 'text', (col) =>
          col.notNull().references('carts.id'),
        )
        .addColumn('variantId', 'text', (col) =>
          col.notNull().references('product_variants.id'),
        )
        .addColumn('unitPrice', 'bigint', (col) => col.notNull())
        .addColumn('quantity', 'integer', (col) => col.defaultTo(1).notNull())
        .on(db)
        .addCheckConstraint('check_quantity', sql`"quantity" > 0`),
      db.schema
        .alterTable('cart_items')
        .addUniqueConstraint('one_variant_per_cart', ['variantId', 'cartId']),
      db.schema
        .createIndex('cart_items_cart_id_idx')
        .on('cart_items')
        .column('cartId'),
    ],
    triggers,
  });
}
