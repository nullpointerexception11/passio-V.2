/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import initSqlJs, { Database } from 'sql.js';
import { IDatabaseService } from '../connection';

export class SqliteTestAdapter implements IDatabaseService {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
    await this.runMigrations();
  }

  private async runMigrations() {
    if (!this.db) return;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY NOT NULL,
        material_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        selected_text TEXT NOT NULL,
        rects_json TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'yellow',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reading_notes (
        id TEXT PRIMARY KEY NOT NULL,
        material_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  async execute(query: string, params?: unknown[]): Promise<unknown> {
    if (!this.db) throw new Error('DB not initialized');
    const stmt = this.db.prepare(query);
    if (params) stmt.bind(params as any);
    stmt.step();
    return stmt.get();
  }

  async select<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    if (!this.db) throw new Error('DB not initialized');
    let query = `SELECT * FROM ${table}`;
    const vals: unknown[] = [];
    if (filters && Object.keys(filters).length > 0) {
      const keys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
      query += ` WHERE ${keys}`;
      vals.push(...Object.values(filters));
    }
    const stmt = this.db.prepare(query);
    stmt.bind(vals as any);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<T> {
    if (!this.db) throw new Error('DB not initialized');
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const vals = Object.values(data);
    this.db.run(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, vals as any);
    return data as T;
  }

  async update(table: string, data: Record<string, unknown>, filters: Record<string, unknown>): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');
    const updateKeys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const filterKeys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
    const vals = [...Object.values(data), ...Object.values(filters)];
    this.db.run(`UPDATE ${table} SET ${updateKeys} WHERE ${filterKeys}`, vals as any);
  }

  async delete(table: string, filters: Record<string, unknown>): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');
    const filterKeys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
    const vals = Object.values(filters);
    this.db.run(`DELETE FROM ${table} WHERE ${filterKeys}`, vals as any);
  }
}
