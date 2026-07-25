/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pluggable Storage Adapter Interface
 * Unified contract for offline-first data storage (LocalStorage, IndexedDB, SQLite, etc.)
 */
export interface IStorageAdapter<T = unknown> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getAll(prefixFilter?: string): Promise<T[]>;
  clear(): Promise<void>;
}
