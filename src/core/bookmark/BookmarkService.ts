/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../logger/Logger';

export interface IBookmark {
  id: string;
  materialId: string;
  pageNumber: number;
  title?: string;
  createdAt: string;
}

type BookmarkListener = (bookmarks: IBookmark[]) => void;

class BookmarkDomainService {
  private activeBookmarks: Map<string, IBookmark[]> = new Map();
  private listeners: Set<BookmarkListener> = new Set();

  loadBookmarks(materialId: string): IBookmark[] {
    try {
      const raw = localStorage.getItem(`passio_bookmarks_${materialId}`);
      const list: IBookmark[] = raw ? JSON.parse(raw) : [];
      list.sort((a, b) => a.pageNumber - b.pageNumber);
      this.activeBookmarks.set(materialId, list);
      this.notifyListeners();
      return list;
    } catch (err) {
      Logger.error('BookmarkService', `Error loading bookmarks for material [${materialId}]`, err);
      return [];
    }
  }

  getBookmarksForMaterial(materialId: string): IBookmark[] {
    if (!this.activeBookmarks.has(materialId)) {
      return this.loadBookmarks(materialId);
    }
    return this.activeBookmarks.get(materialId) || [];
  }

  getAllBookmarks(): IBookmark[] {
    const map = new Map<string, IBookmark>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('passio_bookmarks_')) {
          const materialId = key.replace('passio_bookmarks_', '');
          const list = this.getBookmarksForMaterial(materialId);
          for (const bm of list) map.set(bm.id, bm);
        }
      }
    } catch {
      // ignore
    }
    for (const list of this.activeBookmarks.values()) {
      for (const bm of list) map.set(bm.id, bm);
    }
    if (map.size === 0) {
      this.seedInitialBookmarks();
      return this.getAllBookmarks();
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private seedInitialBookmarks(): void {
    const now = new Date();
    const today = now.toISOString();
    const yesterday = new Date(now.getTime() - 86400000 * 1.5).toISOString();

    const bm1: IBookmark = {
      id: 'bm-seed-1',
      materialId: 'dostoyevski-notes-from-underground',
      pageNumber: 15,
      title: 'Dostoyevski • Bölüm 2 Sonları',
      createdAt: today,
    };
    const bm2: IBookmark = {
      id: 'bm-seed-2',
      materialId: 'stefan-zweig-chess',
      pageNumber: 3,
      title: 'Satranç • Dr. B\'nin Açılış Hamlesi',
      createdAt: yesterday,
    };

    this.toggleBookmark(bm1.materialId, bm1.pageNumber, bm1.title);
    this.toggleBookmark(bm2.materialId, bm2.pageNumber, bm2.title);
  }

  isBookmarked(materialId: string, pageNumber: number): boolean {
    const list = this.getBookmarksForMaterial(materialId);
    return list.some((b) => b.pageNumber === pageNumber);
  }

  toggleBookmark(materialId: string, pageNumber: number, title?: string): boolean {
    const list = [...this.getBookmarksForMaterial(materialId)];
    const index = list.findIndex((b) => b.pageNumber === pageNumber);

    let isAdded = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      isAdded = true;
      list.push({
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        materialId,
        pageNumber,
        title: title || `Sayfa ${pageNumber}`,
        createdAt: new Date().toISOString(),
      });
      list.sort((a, b) => a.pageNumber - b.pageNumber);
    }

    this.activeBookmarks.set(materialId, list);
    this.persist(materialId, list);
    this.notifyListeners();
    Logger.info('BookmarkService', `${isAdded ? 'Added' : 'Removed'} bookmark for page ${pageNumber}`);
    return isAdded;
  }

  deleteBookmark(materialId: string, bookmarkId: string): void {
    const targetMaterialId = materialId || Array.from(this.activeBookmarks.entries()).find(([_, list]) =>
      list.some((b) => b.id === bookmarkId)
    )?.[0];

    if (!targetMaterialId) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('passio_bookmarks_')) {
            const matId = key.replace('passio_bookmarks_', '');
            const list = this.getBookmarksForMaterial(matId);
            if (list.some((b) => b.id === bookmarkId)) {
              const filtered = list.filter((b) => b.id !== bookmarkId);
              this.activeBookmarks.set(matId, filtered);
              this.persist(matId, filtered);
              this.notifyListeners();
              Logger.info('BookmarkService', `Deleted bookmark [${bookmarkId}] from material [${matId}]`);
              return;
            }
          }
        }
      } catch (err) {
        Logger.error('BookmarkService', `Error deleting bookmark [${bookmarkId}]`, err);
      }
      return;
    }

    const list = this.getBookmarksForMaterial(targetMaterialId).filter((b) => b.id !== bookmarkId);
    this.activeBookmarks.set(targetMaterialId, list);
    this.persist(targetMaterialId, list);
    this.notifyListeners();
    Logger.info('BookmarkService', `Deleted bookmark [${bookmarkId}]`);
  }

  subscribe(listener: BookmarkListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private persist(materialId: string, list: IBookmark[]) {
    try {
      localStorage.setItem(`passio_bookmarks_${materialId}`, JSON.stringify(list));
    } catch (err) {
      Logger.error('BookmarkService', `Error persisting bookmarks for material [${materialId}]`, err);
    }
  }

  private notifyListeners() {
    const all = Array.from(this.activeBookmarks.values()).flat();
    this.listeners.forEach((fn) => fn(all));
  }
}

export const BookmarkService = new BookmarkDomainService();
export default BookmarkService;
