/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IAccessRecord {
  id: string;
  title: string;
  type: 'notebook' | 'note' | 'pdf' | 'highlight' | 'bookmark';
  count: number;
  lastAccessed: string;
  subtitle?: string;
}

const STORAGE_KEY = 'passio_frequently_accessed';

class AccessTrackingDomainService {
  private getRecords(): Record<string, IAccessRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.seedInitialRecords();
      }
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private seedInitialRecords(): Record<string, IAccessRecord> {
    const now = new Date().toISOString();
    const seeded: Record<string, IAccessRecord> = {
      'dostoyevski-notes-from-underground': {
        id: 'dostoyevski-notes-from-underground',
        title: 'Yeraltından Notlar',
        type: 'pdf',
        count: 18,
        lastAccessed: now,
        subtitle: 'Fyodor Dostoyevski • 40 Sayfa',
      },
      'stefan-zweig-chess': {
        id: 'stefan-zweig-chess',
        title: 'Satranç',
        type: 'pdf',
        count: 12,
        lastAccessed: now,
        subtitle: 'Stefan Zweig • 3 Sayfa',
      },
      'nb-sample-deneme': {
        id: 'nb-sample-deneme',
        title: 'Sessizlik ve Yazı Üzerine Notlar',
        type: 'notebook',
        count: 9,
        lastAccessed: now,
        subtitle: 'Defter • 84 Kelime',
      },
      'nb-sample-gunluk': {
        id: 'nb-sample-gunluk',
        title: 'Okuma ve Düşünce Günlüğü',
        type: 'notebook',
        count: 5,
        lastAccessed: now,
        subtitle: 'Defter • 42 Kelime',
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {
      // ignore
    }
    return seeded;
  }

  private saveRecords(records: Record<string, IAccessRecord>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }

  /**
   * Tracks opening or accessing a material locally in browser storage.
   * Strictly offline, zero analytics.
   */
  trackAccess(
    id: string,
    title: string,
    type: 'notebook' | 'note' | 'pdf' | 'highlight' | 'bookmark',
    subtitle?: string
  ): void {
    const records = this.getRecords();
    const existing = records[id] || {
      id,
      title,
      type,
      count: 0,
      lastAccessed: new Date().toISOString(),
      subtitle,
    };

    records[id] = {
      ...existing,
      title,
      type,
      count: existing.count + 1,
      lastAccessed: new Date().toISOString(),
      subtitle: subtitle || existing.subtitle,
    };

    this.saveRecords(records);
  }

  getAccessCount(id: string): number {
    const records = this.getRecords();
    return records[id]?.count || 0;
  }

  getFrequentlyAccessed(limit: number = 20): IAccessRecord[] {
    const records = this.getRecords();
    return Object.values(records)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getAllAccessRecords(): Record<string, IAccessRecord> {
    return this.getRecords();
  }
}

export const AccessTrackingService = new AccessTrackingDomainService();
export default AccessTrackingService;
