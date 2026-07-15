import { sql, type Kysely } from 'kysely';
import { baseTable, executeWithTriggers } from 'src/utils/db/misc';
import { setUpdatedAt } from 'src/utils/db/sql/set-updated-at-trigger';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations

  await executeWithTriggers({
    db,
    queries: [
      baseTable('store_settlement_accounts')
        .addColumn('paystackSubAccountCode', 'text', (col) =>
          col.notNull().unique(),
        )
        .addColumn('accountNumber', 'text', (col) => col.notNull().unique())
        .addColumn('accountName', 'text', (col) => col.notNull())
        .addColumn('currency', sql`"Currency"`)
        .addColumn('bank', 'text', (col) => col.notNull())
        .addColumn('storeId', 'text', (col) =>
          col.notNull().references('stores.id').unique().onDelete('cascade'),
        )
        .addColumn('isVerified', 'boolean', (col) => col.defaultTo(false))
        .on(db),

      db.schema
        .createType('OrderTransactionType')
        .asEnum(['SALE', 'REFUND', 'CHARGEBACK', 'DEBT_RECOVERY']),

      baseTable('order_transactions')
        .addColumn('orderId', 'text', (col) =>
          col.references('orders.id').notNull(),
        )
        .addColumn('type', sql`"OrderTransactionType"`, (col) => col.notNull())
        .addColumn('amount', 'bigint', (col) => col.notNull())
        .addColumn('reference', 'text', (col) => col.notNull())
        .addColumn('reason', 'text', (col) => col.notNull())
        .on(db),

      db.schema
        .alterTable('order_transactions')
        .addUniqueConstraint('uq_order_transactions_reference_type', [
          'reference',
          'type',
        ]),
    ],
    triggers: [setUpdatedAt],
  });
}
