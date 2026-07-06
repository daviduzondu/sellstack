import { CreateTableBuilder, Kysely, RawBuilder, sql } from 'kysely';

type Query = {
  execute: () => Promise<any>;
};

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
