import { sql, type Kysely } from 'kysely';
import { baseTable, executeWithTriggers } from 'src/utils/db/misc';
import { setUpdatedAt } from 'src/utils/db/sql/set-updated-at-trigger';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations

  // total = subtotal - discountAmount      what the buyer pays
  // sellerNet = total - platformFee         what the seller gets
  // platformFee = total * feePercentage     	Sellstack's cut

  await executeWithTriggers({
    db,
    queries: [
      db.schema
        .createType('OrderStatus')
        .asEnum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
      baseTable('orders')
        .addColumn('buyerId', 'text', (col) =>
          col.notNull().references('users.id'),
        )
        .addColumn('cartId', 'text', (col) => col.references('carts.id'))
        .addColumn('reference', 'text', (col) => col.notNull())
        .addColumn('status', sql`"OrderStatus"`, (col) =>
          col.notNull().defaultTo('PENDING'),
        )
        .addColumn('paidAt', 'timestamptz')
        .on(db),
      db.schema.createIndex('reference_idx').on('orders').column('reference'),
      baseTable('order_items')
        .addColumn('orderId', 'text', (col) =>
          col.references('orders.id').notNull(),
        )
        .addColumn('name', 'text')
        .addColumn('type', sql`"ProductType"`, (col) => col.notNull())
        .addColumn('quantity', 'integer', (col) => col.defaultTo(1).notNull())
        .addColumn('longDescription', 'text', (col) => col.notNull())
        .addColumn('shortDescription', 'text', (col) => col.notNull())
        .addColumn('currency', sql`"Currency"`, (col) => col.notNull())
        .addColumn('unitPrice', 'bigint', (col) => col.notNull())
        .addColumn('total', 'bigint', (col) => col.notNull())
        .addColumn('platformFee', 'bigint', (col) => col.notNull())
        .addColumn('s3_key', 'text')
        .addColumn('variantId', 'text', (col) =>
          col.references('product_variants.id'),
        )
        .on(db),
    ],
    triggers: [setUpdatedAt],
  });
}
