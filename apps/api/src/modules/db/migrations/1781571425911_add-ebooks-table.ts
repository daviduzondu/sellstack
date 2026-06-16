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
      db.schema.createType('BookFormat').asEnum(['PDF', 'EPUB', 'DOCX']),
      db.schema.createType('BookLanguage').asEnum(['EN']),
      baseTable('ebooks')
        .addColumn('variantId', 'text', (col) =>
          col.notNull().references('product_variants.id'),
        )
        .addColumn('format', sql`"BookFormat"`, (col) => col.notNull())
        .addColumn('pageCount', 'integer', (col) => col.notNull())
        .addColumn('publishedAt', 'timestamptz')
        .addColumn('edition', 'text')
        .addColumn('language', 'text', (col) => col.notNull())
        .on(db),
    ],
    triggers: [setUpdatedAt],
  });
}
