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
  private listeners: Set<HighlightListener> = new Set();

  /**
   * Loads and caches highlights for a specific material/PDF document ID
   */
  async loadHighlights(materialId: string): Promise<IHighlightFragment[]> {
    try {
      const fragments = await HighlightRepository.getHighlightsByMaterial(materialId);
      this.activeHighlights.set(materialId, fragments);
      this.notifyListeners();
      Logger.info('HighlightService', `Loaded ${fragments.length} highlights for material [${materialId}]`);
      return fragments;
    } catch (err) {
      Logger.error('HighlightService', `Error loading highlights for material [${materialId}]`, err);
      return [];
    }
  }

  /**
   * Retrieves cached highlights for a given material and page number
   */
  getHighlightsForPage(materialId: string, pageNumber: number): IHighlightFragment[] {
    const list = this.activeHighlights.get(materialId) || [];
    return list.filter((item) => item.pageNumber === pageNumber);
  }

  /**
   * Creates a new Knowledge Fragment highlight
   */
  async createHighlight(
    materialId: string,
    pageNumber: number,
    selectedText: string,
    rects: IHighlightRect[],
    color: HighlightColor
  ): Promise<IHighlightFragment> {
    const now = new Date().toISOString();
    const fragment: IHighlightFragment = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      materialId,
      pageNumber,
      selectedText,
      rects,
      color,
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
   * Deletes a Knowledge Fragment highlight
   */
  async deleteHighlight(materialId: string, highlightId: string): Promise<void> {
    try {
      await HighlightRepository.deleteHighlight(highlightId);
      
      const currentList = this.activeHighlights.get(materialId) || [];
      const updatedList = currentList.filter((item) => item.id !== highlightId);
      this.activeHighlights.set(materialId, updatedList);
      
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
