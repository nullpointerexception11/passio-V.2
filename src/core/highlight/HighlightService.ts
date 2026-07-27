/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HighlightRepository } from './HighlightRepository';
import { IHighlightFragment, IHighlightRect, HighlightColor } from './HighlightModel';
import { Logger } from '../logger/Logger';

type HighlightListener = (highlights: IHighlightFragment[]) => void;

class HighlightDomainService {
  private activeHighlights: Map<string, IHighlightFragment[]> = new Map();
  private loadedMaterials: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<IHighlightFragment[]>> = new Map();
  private listeners: Set<HighlightListener> = new Set();

  /**
   * Loads and caches highlights for a specific material/PDF document ID
   */
  async loadHighlights(materialId: string): Promise<IHighlightFragment[]> {
    if (this.loadingPromises.has(materialId)) {
      return this.loadingPromises.get(materialId)!;
    }

    const loadPromise = (async () => {
      try {
        const fragments = await HighlightRepository.getHighlightsByMaterial(materialId);
        this.activeHighlights.set(materialId, fragments);
        this.loadedMaterials.add(materialId);
        this.notifyListeners();
        Logger.info('HighlightService', `Loaded ${fragments.length} highlights for material [${materialId}]`);
        return fragments;
      } catch (err) {
        Logger.error('HighlightService', `Error loading highlights for material [${materialId}]`, err);
        return [];
      } finally {
        this.loadingPromises.delete(materialId);
      }
    })();

    this.loadingPromises.set(materialId, loadPromise);
    return loadPromise;
  }

  /**
   * Retrieves cached highlights for a given material and page number
   */
  getHighlightsForPage(materialId: string, pageNumber: number): IHighlightFragment[] {
    if (!this.loadedMaterials.has(materialId) && !this.loadingPromises.has(materialId)) {
      this.loadHighlights(materialId);
    }
    const list = this.activeHighlights.get(materialId) || [];
    return list.filter((item) => item.pageNumber === pageNumber);
  }

  /**
   * Retrieves all cached highlights for a given material
   */
  getHighlightsForMaterial(materialId: string): IHighlightFragment[] {
    if (!this.loadedMaterials.has(materialId) && !this.loadingPromises.has(materialId)) {
      this.loadHighlights(materialId);
    }
    return this.activeHighlights.get(materialId) || [];
  }

  /**
   * Creates a new Knowledge Fragment highlight
   */
  async createHighlight(
    materialId: string,
    pageNumber: number,
    selectedText: string,
    rects: IHighlightRect[],
    color: HighlightColor,
    note?: string
  ): Promise<IHighlightFragment> {
    if (!this.loadedMaterials.has(materialId)) {
      await this.loadHighlights(materialId);
    }

    const now = new Date().toISOString();
    const fragment: IHighlightFragment = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      materialId,
      pageNumber,
      selectedText,
      rects,
      color,
      note,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const saved = await HighlightRepository.saveHighlight(fragment);
      
      const currentList = this.activeHighlights.get(materialId) || [];
      const updatedList = [...currentList, saved];
      this.activeHighlights.set(materialId, updatedList);
      
      this.notifyListeners();
      Logger.info('HighlightService', `Created highlight fragment [${saved.id}] on page ${pageNumber}`);
      return saved;
    } catch (err) {
      Logger.error('HighlightService', 'Failed to create highlight fragment', err);
      throw err;
    }
  }

  /**
   * Updates color, note or tags of an existing highlight fragment
   */
  async updateHighlight(
    materialId: string,
    highlightId: string,
    updates: Partial<Pick<IHighlightFragment, 'color' | 'note' | 'tags'>>
  ): Promise<IHighlightFragment | null> {
    if (!this.loadedMaterials.has(materialId)) {
      await this.loadHighlights(materialId);
    }

    try {
      const currentList = this.activeHighlights.get(materialId) || [];
      const index = currentList.findIndex((item) => item.id === highlightId);
      if (index === -1) return null;

      const existing = currentList[index];
      const updated: IHighlightFragment = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const saved = await HighlightRepository.saveHighlight(updated);
      
      const updatedList = [...currentList];
      updatedList[index] = saved;
      this.activeHighlights.set(materialId, updatedList);

      this.notifyListeners();
      Logger.info('HighlightService', `Updated highlight fragment [${highlightId}]`);
      return saved;
    } catch (err) {
      Logger.error('HighlightService', `Failed to update highlight [${highlightId}]`, err);
      throw err;
    }
  }

  /**
   * Deletes a Knowledge Fragment highlight
   */
  async deleteHighlight(materialId: string, highlightId: string): Promise<void> {
    if (materialId && !this.loadedMaterials.has(materialId)) {
      await this.loadHighlights(materialId);
    }

    try {
      await HighlightRepository.deleteHighlight(highlightId);
      
      const targetMatId = materialId || Array.from(this.activeHighlights.entries()).find(([_, list]) =>
        list.some((item) => item.id === highlightId)
      )?.[0];

      if (targetMatId) {
        const currentList = this.activeHighlights.get(targetMatId) || [];
        const updatedList = currentList.filter((item) => item.id !== highlightId);
        this.activeHighlights.set(targetMatId, updatedList);
      }
      
      this.notifyListeners();
      Logger.info('HighlightService', `Removed highlight fragment [${highlightId}]`);
    } catch (err) {
      Logger.error('HighlightService', `Failed to delete highlight [${highlightId}]`, err);
      throw err;
    }
  }

  /**
   * Subscribes to highlight state changes
   */
  subscribe(listener: HighlightListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const all = Array.from(this.activeHighlights.values()).flat();
    this.listeners.forEach((fn) => fn(all));
  }
}

export const HighlightService = new HighlightDomainService();
export default HighlightService;
