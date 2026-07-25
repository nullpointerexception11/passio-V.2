/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter<T = unknown> implements IStorageAdapter<T> {
  private prefix: string;

  constructor(prefix: string = 'passio_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
  }

  async get(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (err) {
      console.error('LocalStorageAdapter set error:', err);
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async getAll(prefixFilter?: string): Promise<T[]> {
    const items: T[] = [];
    const filter = prefixFilter ? `${this.prefix}${prefixFilter}` : this.prefix;

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(filter)) {
        const item = await this.get(k.slice(this.prefix.length));
        if (item !== null) items.push(item);
      }
    }
    return items;
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}
