import { defineConfig, DefineConfigInput } from 'kysely-ctl';
import { Pool } from 'pg';
import path from 'path';
import 'dotenv';

export const config = {
  destroyOnExit: true,
  dialect: 'postgres',
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
} as const;

export default defineConfig(config as DefineConfigInput);
