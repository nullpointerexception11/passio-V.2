/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../core/logger/Logger';
import { AppConfig } from '../../core/config/AppConfig';

/**
 * Interface representing standard operations for database persistence
 */
export interface IDatabaseService {
  initialize(): Promise<void>;
  execute(query: string, params?: unknown[]): Promise<unknown>;
  select<T>(table: string, filters?: Record<string, unknown>): Promise<T[]>;
  insert<T>(table: string, data: Record<string, unknown>): Promise<T>;
  update(table: string, data: Record<string, unknown>, filters: Record<string, unknown>): Promise<void>;
  delete(table: string, filters: Record<string, unknown>): Promise<void>;
}

type RecordType = Record<string, unknown>;

/**
 * In-Memory & LocalStorage based SQL adapter for browser/web preview fallback.
 * Allows full data survival, querying, and schema obedience without breaking Tauri's native layer.
 */
class BrowserMockDatabaseService implements IDatabaseService {
  private store: Record<string, Record<string, RecordType>> = {};

  async initialize(): Promise<void> {
    Logger.info('Database', 'Initializing Browser fallback Database Engine...');
    
    // Seed initial collections and settings
    this.store['documents'] = JSON.parse(localStorage.getItem('passio_docs') || '{}');
    this.store['collections'] = JSON.parse(localStorage.getItem('passio_collections') || '{}');
    this.store['settings'] = JSON.parse(localStorage.getItem('passio_settings') || '{}');
    this.store['highlights'] = JSON.parse(localStorage.getItem('passio_highlights') || '{}');
    this.store['reading_notes'] = JSON.parse(localStorage.getItem('passio_reading_notes') || '{}');
    this.store['notebooks'] = JSON.parse(localStorage.getItem('passio_notebooks') || '{}');

    // Seed default sample highlights if empty
    if (Object.keys(this.store['highlights']).length === 0) {
      this.store['highlights'] = {
        'h-seed-1': {
          id: 'h-seed-1',
          material_id: 'passio-philosophy-manifesto',
          materialId: 'passio-philosophy-manifesto',
          page_number: 1,
          pageNumber: 1,
          selected_text: 'Günümüz yazılım dünyası, kullanıcının dikkatini sürekli canlı tutmayı amaçlayan bildirimler, rozetler ve renkli göstergelerle doludur. Passio, bu yaklaşımın tam karşısında yer alır. Bilgi edinme süreci derin bir sessizlik gerektirir.',
          selectedText: 'Günümüz yazılım dünyası, kullanıcının dikkatini sürekli canlı tutmayı amaçlayan bildirimler, rozetler ve renkli göstergelerle doludur. Passio, bu yaklaşımın tam karşısında yer alır. Bilgi edinme süreci derin bir sessizlik gerektirir.',
          rects_json: '[]',
          rectsJson: '[]',
          color: 'yellow',
          created_at: new Date('2026-07-20T10:00:00Z').toISOString(),
          createdAt: new Date('2026-07-20T10:00:00Z').toISOString(),
        },
        'h-seed-2': {
          id: 'h-seed-2',
          material_id: 'passio-philosophy-manifesto',
          materialId: 'passio-philosophy-manifesto',
          page_number: 2,
          pageNumber: 2,
          selected_text: 'Verilerinizin hiçbir sunucuya veya bulut servisine aktarılmadığı bir sistem, yalnızca gizliliğinizi korumakla kalmaz; aynı zamanda bağlantı koptuğunda dahi kesintisiz bir çalışma ritmi sunar.',
          selectedText: 'Verilerinizin hiçbir sunucuya veya bulut servisine aktarılmadığı bir sistem, yalnızca gizliliğinizi korumakla kalmaz; aynı zamanda bağlantı koptuğunda dahi kesintisiz bir çalışma ritmi sunar.',
          rects_json: '[]',
          rectsJson: '[]',
          color: 'green',
          created_at: new Date('2026-07-21T11:30:00Z').toISOString(),
          createdAt: new Date('2026-07-21T11:30:00Z').toISOString(),
        },
        'h-seed-3': {
          id: 'h-seed-3',
          material_id: 'dostoyevski-notes-from-underground',
          materialId: 'dostoyevski-notes-from-underground',
          page_number: 2,
          pageNumber: 2,
          selected_text: 'Baylar, yemin ederim ki her şeyi fazlasıyla anlamak bir hastalıktır; gerçek, tam bir hastalık.',
          selectedText: 'Baylar, yemin ederim ki her şeyi fazlasıyla anlamak bir hastalıktır; gerçek, tam bir hastalık.',
          rects_json: '[]',
          rectsJson: '[]',
          color: 'purple',
          created_at: new Date('2026-07-21T14:15:00Z').toISOString(),
          createdAt: new Date('2026-07-21T14:15:00Z').toISOString(),
        },
      };
      this.persist('highlights');
    }

    // Seed default sample reading notes if empty
    if (Object.keys(this.store['reading_notes']).length === 0) {
      this.store['reading_notes'] = {
        'n-seed-1': {
          id: 'n-seed-1',
          material_id: 'passio-philosophy-manifesto',
          materialId: 'passio-philosophy-manifesto',
          title: 'Sessizlik ve Derinleşme',
          content: 'Arayüz tasarımı doğrudan düşünme kapasitemizi etkiler. Sade bir ekran, zihnin kendi iç dinamiklerine odaklanmasını kolaylaştırır.',
          tags_json: JSON.stringify(['sadelik', 'odak', 'felsefe']),
          tagsJson: JSON.stringify(['sadelik', 'odak', 'felsefe']),
          created_at: new Date('2026-07-21T09:00:00Z').toISOString(),
          createdAt: new Date('2026-07-21T09:00:00Z').toISOString(),
        },
        'n-seed-2': {
          id: 'n-seed-2',
          material_id: 'dostoyevski-notes-from-underground',
          materialId: 'dostoyevski-notes-from-underground',
          title: 'Bilinç ve Yere Düşüş',
          content: 'Yeraltı adamı, aşırı bilincin insanı nasıl pasifize ettiğini ve toplumsal kalıplara başkaldırdığını ifade ediyor.',
          tags_json: JSON.stringify(['yeraltı', 'edebiyat', 'varoluş']),
          tagsJson: JSON.stringify(['yeraltı', 'edebiyat', 'varoluş']),
          created_at: new Date('2026-07-21T16:20:00Z').toISOString(),
          createdAt: new Date('2026-07-21T16:20:00Z').toISOString(),
        },
      };
      this.persist('reading_notes');
    }
    
    Logger.info('Database', 'Browser fallback database initialized and state seeded from LocalStorage.');
  }

  private persist(table: string) {
    if (table === 'documents') localStorage.setItem('passio_docs', JSON.stringify(this.store['documents']));
    if (table === 'collections') localStorage.setItem('passio_collections', JSON.stringify(this.store['collections']));
    if (table === 'settings') localStorage.setItem('passio_settings', JSON.stringify(this.store['settings']));
    if (table === 'highlights') localStorage.setItem('passio_highlights', JSON.stringify(this.store['highlights']));
    if (table === 'reading_notes') localStorage.setItem('passio_reading_notes', JSON.stringify(this.store['reading_notes']));
    if (table === 'notebooks') localStorage.setItem('passio_notebooks', JSON.stringify(this.store['notebooks']));
  }

  async execute(query: string, params?: unknown[]): Promise<unknown> {
    Logger.debug('Database', `Executing Raw Query [Fallback Mode]: ${query}`, params);
    return [];
  }

  async select<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    const tableData = this.store[table] || {};
    let items = Object.values(tableData) as unknown as T[];

    if (filters) {
      items = items.filter((item: unknown) => {
        const record = item as Record<string, unknown>;
        return Object.entries(filters).every(([key, val]) => record[key] === val);
      });
    }
    return items;
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<T> {
    if (!this.store[table]) this.store[table] = {};
    const id = ((data.id as string) || (data.key as string) || Math.random().toString(36).substring(7));
    const newItem: RecordType = { ...data, id };
    this.store[table][id] = newItem;
    this.persist(table);
    Logger.debug('Database', `Inserted record into table [${table}]:`, newItem);
    return newItem as unknown as T;
  }

  async update(table: string, data: Record<string, unknown>, filters: Record<string, unknown>): Promise<void> {
    const tableData = this.store[table] || {};
    Object.values(tableData).forEach((item: RecordType) => {
      const match = Object.entries(filters).every(([key, val]) => item[key] === val);
      if (match) {
        const id = (item.id || item.key) as string;
        this.store[table][id] = { ...item, ...data };
      }
    });
    this.persist(table);
  }

  async delete(table: string, filters: Record<string, unknown>): Promise<void> {
    const tableData = this.store[table] || {};
    Object.entries(tableData).forEach(([id, item]: [string, RecordType]) => {
      const match = Object.entries(filters).every(([key, val]) => item[key] === val);
      if (match) {
        delete this.store[table][id];
      }
    });
    this.persist(table);
  }
}

interface ITauriSqlPlugin {
  execute(query: string, params?: unknown[]): Promise<unknown>;
  select<T>(query: string, params?: unknown[]): Promise<T[]>;
}

/**
 * Desktop Tauri SQLite Database Service
 * Implemented to interface directly with Tauri's SQL Bridge plugin in production builds.
 */
class TauriDatabaseService implements IDatabaseService {
  private dbInstance: ITauriSqlPlugin | null = null;

  async initialize(): Promise<void> {
    Logger.info('Database', `Initializing Native SQLite Database: ${AppConfig.database.fileName}`);
    try {
      // Dynamic import to prevent bundler errors in browser sandbox context
      const pluginName = '@tauri-apps/plugin-sql';
      const { default: Database } = await import(/* @vite-ignore */ pluginName);
      this.dbInstance = await Database.load(`sqlite:${AppConfig.database.fileName}`);
      Logger.info('Database', 'Native SQLite Database connection established successfully via Tauri bridge.');
      
      // Execute table creation scripts (mimicking drizzle-kit migrations on launch)
      await this.runMigrations();
    } catch (err) {
      Logger.error('Database', 'Failed to initialize native SQLite. Swapping to Browser Fallback...', err);
      throw err;
    }
  }

  private async runMigrations() {
    if (!this.dbInstance) return;
    Logger.info('Database', 'Running native Drizzle schema alignments...');
    
    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        summary TEXT,
        word_count INTEGER NOT NULL DEFAULT 0,
        reading_time_min INTEGER NOT NULL DEFAULT 0,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS document_collections (
        document_id TEXT NOT NULL,
        collection_id TEXT NOT NULL,
        PRIMARY KEY (document_id, collection_id),
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
        FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
      );
    `);

    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await this.dbInstance.execute(`
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
    `);

    await this.dbInstance.execute(`
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

    await this.dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'serbest',
        content TEXT NOT NULL DEFAULT '',
        word_count INTEGER NOT NULL DEFAULT 0,
        settings_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    Logger.info('Database', 'Native Drizzle schema alignments complete.');
  }

  async execute(query: string, params?: unknown[]): Promise<unknown> {
    if (!this.dbInstance) throw new Error('DB not initialized');
    return this.dbInstance.execute(query, params);
  }

  async select<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    if (!this.dbInstance) throw new Error('DB not initialized');
    if (!filters || Object.keys(filters).length === 0) {
      return this.dbInstance.select<T>(`SELECT * FROM ${table}`);
    }
    const keys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
    const vals = Object.values(filters);
    return this.dbInstance.select<T>(`SELECT * FROM ${table} WHERE ${keys}`, vals);
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<T> {
    if (!this.dbInstance) throw new Error('DB not initialized');
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const vals = Object.values(data);
    
    await this.dbInstance.execute(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`, vals);
    return data as T;
  }

  async update(table: string, data: Record<string, unknown>, filters: Record<string, unknown>): Promise<void> {
    if (!this.dbInstance) throw new Error('DB not initialized');
    const updateKeys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const filterKeys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
    
    const vals = [...Object.values(data), ...Object.values(filters)];
    await this.dbInstance.execute(`UPDATE ${table} SET ${updateKeys} WHERE ${filterKeys}`, vals);
  }

  async delete(table: string, filters: Record<string, unknown>): Promise<void> {
    if (!this.dbInstance) throw new Error('DB not initialized');
    const filterKeys = Object.keys(filters).map(k => `${k} = ?`).join(' AND ');
    const vals = Object.values(filters);
    await this.dbInstance.execute(`DELETE FROM ${table} WHERE ${filterKeys}`, vals);
  }
}

// Check window safely
const win = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {};
const isTauri = typeof window !== 'undefined' && ('__TAURI_IPC__' in win || '__TAURI__' in win);

export const db: IDatabaseService = isTauri ? new TauriDatabaseService() : new BrowserMockDatabaseService();

export async function initDb(): Promise<void> {
  try {
    await db.initialize();
  } catch (err) {
    Logger.warn('Database', 'Native SQLite failed. Reverting to memory storage layer...', err);
    if (isTauri) {
      const fallback = new BrowserMockDatabaseService();
      await fallback.initialize();
      Object.assign(db, fallback);
    }
  }
}

export default db;
