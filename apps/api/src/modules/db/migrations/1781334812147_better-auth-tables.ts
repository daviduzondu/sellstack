import type { Kysely } from 'kysely';
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
      baseTable('users')
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('email', 'text', (col) => col.notNull().unique())
        .addColumn('emailVerified', 'boolean', (col) =>
          col.notNull().defaultTo(false),
        )
        .addColumn('image', 'text')
        .on(db),

      baseTable('sessions')
        .addColumn('userId', 'text', (col) =>
          col.notNull().references('users.id').onDelete('cascade'),
        )
        .addColumn('token', 'text', (col) => col.notNull().unique())
        .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
        .addColumn('ipAddress', 'text')
        .addColumn('userAgent', 'text')
        .on(db),

      baseTable('accounts')
        .addColumn('userId', 'text', (col) =>
          col.notNull().references('users.id').onDelete('cascade'),
        )
        .addColumn('accountId', 'text', (col) => col.notNull())
        .addColumn('providerId', 'text', (col) => col.notNull())
        .addColumn('accessToken', 'text')
        .addColumn('refreshToken', 'text')
        .addColumn('accessTokenExpiresAt', 'timestamptz')
        .addColumn('refreshTokenExpiresAt', 'timestamptz')
        .addColumn('scope', 'text')
        .addColumn('idToken', 'text')
        .addColumn('password', 'text')
        .on(db),

      baseTable('verifications')
        .addColumn('identifier', 'text', (col) => col.notNull())
        .addColumn('value', 'text', (col) => col.notNull())
        .addColumn('expiresAt', 'timestamptz', (col) => col.notNull())
        .on(db),
    ],
    triggers: [setUpdatedAt],
  });
}
