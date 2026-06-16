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
      db.schema
        .createType('ProductStatus')
        .asEnum(['PUBLISHED', 'SUSPENDED', 'DRAFT']),
      db.schema
        .createType('ProductType')
        .asEnum(['EBOOK', 'AUDIO', 'MEMBERSHIP', 'OTHER']),
      db.schema.createType('Currency').asEnum(['NGN', 'USD']),

      baseTable('products')
        .addColumn('storeId', 'text', (col) =>
          col.notNull().references('stores.id'),
        )
        .addColumn('userId', 'text', (col) =>
          col.notNull().references('users.id'),
        )
        .addColumn('currency', sql`"Currency"`, (col) =>
          col.notNull().defaultTo('NGN'),
        )
        .addColumn('shortDecription', 'text')
        .addColumn('longDescription', 'text')
        .addColumn('status', sql`"ProductStatus"`, (col) =>
          col.notNull().defaultTo('DRAFT'),
        )
        .addColumn('type', sql`"ProductType"`, (col) => col.notNull())
        .addColumn('deletedAt', 'timestamptz')
        .on(db),

      baseTable('product_variants')
        .addColumn('productId', 'text', (col) =>
          col.notNull().references('products.id'),
        )
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('shortDescription', 'text', (col) => col.notNull())
        .addColumn('price', 'decimal', (col) => col.notNull())
        .on(db),

      baseTable('product_files')
        .addColumn('productId', 'text', (col) =>
          col.notNull().references('products.id'),
        )
        .addColumn('variantId', 'text', (col) =>
          col.notNull().references('product_variants.id'),
        )
        .addColumn('fileSizeBytes', 'integer', (col) => col.notNull())
        .addColumn('fileName', 'text', (col) => col.notNull())
        .addColumn('s3_key', 'text', (col) => col.notNull())
        .on(db),
    ],
    triggers: [setUpdatedAt],
  });
}
