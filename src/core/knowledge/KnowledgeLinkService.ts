/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLink } from '../../entities/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../infrastructure/logger/Logger';

type KnowledgeLinkListener = () => void;

const LOCAL_STORAGE_KEY = 'passio_knowledge_links';

class KnowledgeLinkDomainService {
  private links: IKnowledgeLink[] = [];
  private listeners: Set<KnowledgeLinkListener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        this.links = JSON.parse(raw);
      } else {
        this.seedInitialLinks();
      }
      this.initialized = true;
    } catch (err) {
      Logger.error('KnowledgeLinkService', 'Error initializing knowledge links', err);
      this.links = [];
    }
  }

  private seedInitialLinks(): void {
    const seedLinks: IKnowledgeLink[] = [
      {
        id: 'link-seed-1',
        highlightId: 'hl-sample-1',
        targetType: 'note',
        targetId: 'note-sample-1',
        targetTitle: 'İnsan Varoluşu ve Acı Üzerine Notlar',
        targetSubtitle: 'Yazıhane Notu',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-seed-2',
        highlightId: 'hl-sample-1',
        targetType: 'pdf',
        targetId: 'dostoyevski-notes-from-underground',
        targetTitle: 'Yeraltından Notlar',
        targetSubtitle: 'F. Dostoyevski • PDF',
        materialId: 'dostoyevski-notes-from-underground',
        pageNumber: 12,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-seed-3',
        highlightId: 'hl-sample-1',
        targetType: 'bookmark',
        targetId: 'bm-sample-12',
        targetTitle: 'Sayfa 12 (Ana Fikir)',
        targetSubtitle: 'Yeraltından Notlar',
        materialId: 'dostoyevski-notes-from-underground',
        pageNumber: 12,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'link-seed-4',
        highlightId: 'hl-sample-2',
        targetType: 'pdf',
        targetId: 'stefan-zweig-chess',
        targetTitle: 'Satranç',
        targetSubtitle: 'S. Zweig • PDF',
        materialId: 'stefan-zweig-chess',
        pageNumber: 8,
        createdAt: new Date().toISOString(),
      },
    ];

    this.links = seedLinks;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.links));
    } catch (err) {
      Logger.error('KnowledgeLinkService', 'Failed to persist knowledge links', err);
    }
  }

  public getLinksForHighlight(highlightId: string): IKnowledgeLink[] {
    this.init();
    return this.links.filter((l) => l.highlightId === highlightId);
  }

  public getAllLinks(): IKnowledgeLink[] {
    this.init();
    return [...this.links];
  }

  public addLink(linkInput: Omit<IKnowledgeLink, 'id' | 'createdAt'>): IKnowledgeLink {
    this.init();
    // Check duplicate
    const existing = this.links.find(
      (l) =>
        l.highlightId === linkInput.highlightId &&
        l.targetType === linkInput.targetType &&
        l.targetId === linkInput.targetId
    );
    if (existing) {
      return existing;
    }

    const newLink: IKnowledgeLink = {
      ...linkInput,
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.links.unshift(newLink);
    this.saveToStorage();
    this.notifyListeners();
    Logger.info('KnowledgeLinkService', `Added link for highlight [${linkInput.highlightId}] to [${linkInput.targetTitle}]`);
    return newLink;
  }

  public removeLink(linkId: string): void {
    this.init();
    this.links = this.links.filter((l) => l.id !== linkId);
    this.saveToStorage();
    this.notifyListeners();
    Logger.info('KnowledgeLinkService', `Removed link [${linkId}]`);
  }

  public subscribe(listener: KnowledgeLinkListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        Logger.error('KnowledgeLinkService', 'Error notifying listener', err);
      }
    });
  }
}

export const KnowledgeLinkService = new KnowledgeLinkDomainService();
export default KnowledgeLinkService;
