import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';
import path from 'path';
import 'dotenv';

export default defineConfig({
  destroyOnExit: true,
  dialect: 'pg',
  migrations: {
    migrationFolder: path.join(
      process.cwd(),
      'src',
      'modules',
      'db',
      'migrations',
    ),
  },
  dialectConfig: {
    pool: new Pool({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
});
