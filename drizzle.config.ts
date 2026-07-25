/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'passio_core.db', // SQLite local file
  },
  verbose: true,
  strict: true,
});
