import * as Codegen from '@sinclair/typebox-codegen';
import { Cli } from 'kysely-codegen';
import { config } from 'kysely.config';
import fs from 'node:fs/promises';
import path from 'node:path';

void new Cli()
  .generate({ ...config, dialect: 'postgres' })
  .then(async (result) => {
    // Strip kysely imports and utility type declarations first
    result = result.replace(/import.*from ['"]kysely['"];?\n?/g, '');
    result = result.replace(/export type ColumnType[\s\S]*?};/, '');
    result = result.replace(/export type Generated[\s\S]*?;/, '');
    result = result.replace(/export type Numeric[^\n]*\n/, '');
    result = result.replace(/export type Int8[^\n]*\n/, '');
    result = result.replace(/export type Timestamp[^\n]*\n/, '');

    // Then replace usages in the interface definitions
    result = result.replace(/Generated<([^>]+)>/g, '$1');
    result = result.replace(/\bTimestamp\b/g, 'Date');
    result = result.replace(/\bNumeric\b/g, 'string');
    result = result.replace(/\bInt8\b/g, 'string');

    await fs.writeFile(
      path.join(
        process.cwd(),
        'src',
        'modules',
        'db',
        'generated',
        'typebox.ts',
      ),
      Codegen.TypeScriptToTypeBox.Generate(result),
      'utf-8',
    );
  });
