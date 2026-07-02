import { CreateTableBuilder, Kysely, RawBuilder, sql } from 'kysely';
import { enforceOneStorePerCart } from 'src/utils/db/sql/enforce-one-store-per-cart';
import { preventMultiCurrencyCart } from 'src/utils/db/sql/prevent-multi-currency-cart';
import { preventProductCurrencyUpdate } from 'src/utils/db/sql/prevent-product-currency-update';
import { preventProductTypeUpdate } from 'src/utils/db/sql/prevent-product-type-update';
import { setUpdatedAt } from 'src/utils/db/sql/set-updated-at-trigger';

type Query = {
  execute: () => Promise<any>;
};

export const triggers = [
  setUpdatedAt,
  enforceOneStorePerCart,
  preventProductTypeUpdate,
  preventProductCurrencyUpdate,
  preventMultiCurrencyCart,
] as const;

export function baseTable(tableName: string) {
  const columns: Parameters<CreateTableBuilder<any>['addColumn']>[] = [];

  return {
    addColumn(...args: Parameters<CreateTableBuilder<any>['addColumn']>) {
      columns.push(args);
      return this;
    },
    on: (db: Kysely<any>) => {
      let runner = db.schema
        .createTable(tableName)
        .addColumn('id', 'text', (col) =>
          col
            .notNull()
            .primaryKey()
            .defaultTo(sql`gen_random_uuid()`),
        );

      for (const column of columns) {
        runner = runner.addColumn(...column);
      }

      return runner
        .addColumn('createdAt', 'timestamptz', (col) =>
          col.notNull().defaultTo(sql`now()`),
        )
        .addColumn('updatedAt', 'timestamptz', (col) =>
          col.notNull().defaultTo(sql`now()`),
        );
    },
  };
}

export async function executeWithTriggers({
  queries,
  triggers,
  db,
}: {
  queries: readonly [Query, ...Query[]];
  triggers: readonly [RawBuilder<unknown>, ...RawBuilder<unknown>[]];
  db: Kysely<any>;
}) {
  for (const b of queries) {
    await b.execute();
  }

  for (const t of triggers) {
    await t.execute(db);
  }
}
