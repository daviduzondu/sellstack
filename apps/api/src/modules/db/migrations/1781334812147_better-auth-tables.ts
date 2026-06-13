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
      baseTable(
        db,
        'users',
        ['name', 'text', (col) => col.notNull()],
        ['email', 'text', (col) => col.notNull().unique()],
        ['emailVerified', 'boolean', (col) => col.notNull().defaultTo(false)],
        ['image', 'text'],
      ),

      baseTable(
        db,
        'sessions',
        [
          'userId',
          'text',
          (col) => col.notNull().references('users.id').onDelete('cascade'),
        ],
        ['token', 'text', (col) => col.notNull().unique()],
        ['expiresAt', 'timestamptz', (col) => col.notNull()],
        ['ipAddress', 'text'],
        ['userAgent', 'text'],
      ),

      baseTable(
        db,
        'accounts',
        [
          'userId',
          'text',
          (col) => col.notNull().references('users.id').onDelete('cascade'),
        ],
        ['accountId', 'text', (col) => col.notNull()],
        ['providerId', 'text', (col) => col.notNull()],
        ['accessToken', 'text'],
        ['refreshToken', 'text'],
        ['accessTokenExpiresAt', 'timestamptz'],
        ['refreshTokenExpiresAt', 'timestamptz'],
        ['scope', 'text'],
        ['idToken', 'text'],
        ['password', 'text'],
      ),

      baseTable(
        db,
        'verifications',
        ['identifier', 'text', (col) => col.notNull()],
        ['value', 'text', (col) => col.notNull()],
        ['expiresAt', 'timestamptz', (col) => col.notNull()],
      ),
    ],
    triggers: [setUpdatedAt],
  });
}
