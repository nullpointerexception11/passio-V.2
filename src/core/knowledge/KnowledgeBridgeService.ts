/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgeBridgeRepository } from './KnowledgeBridgeRepository';
import { 
  IKnowledgeBridgeItem, 
  IKnowledgeBridgeFilter, 
  IKnowledgeBridgeSearchResult 
} from './KnowledgeBridgeModel';
import { Logger } from '../logger/Logger';

class KnowledgeBridgeDomainService {
  /**
   * Normalizes Turkish characters and string case for clean fuzzy search
   */
  private normalizeSearchText(text: string): string {
    if (!text) return '';
    return text
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLocaleLowerCase('tr-TR')
      .trim();
  }

  /**
   * Core Domain Search Engine
   * Executes filtering across Etiket, Materyal Adı, Yazar, İçerik, and Tarih
   */
  async searchKnowledge(filter: IKnowledgeBridgeFilter = {}): Promise<IKnowledgeBridgeSearchResult> {
    try {
      Logger.debug('KnowledgeBridgeService', 'Executing knowledge bridge query', filter);

      const allItems = await KnowledgeBridgeRepository.getAllKnowledgeItems();

      // Extract all unique tags
      const tagSet = new Set<string>();
      allItems.forEach(item => {
        item.tags.forEach(t => tagSet.add(t));
      });
      const availableTags = Array.from(tagSet).sort();

      const normalizedQuery = filter.query ? this.normalizeSearchText(filter.query) : '';
      const selectedType = filter.typeFilter || 'all';
      const selectedTag = filter.tag ? this.normalizeSearchText(filter.tag) : '';

      const filteredItems = allItems.filter(item => {
        // 1. Type Filter (Tümü / Sadece Vurgular / Sadece Notlar)
        if (selectedType === 'highlight' && item.type !== 'highlight') {
          return false;
        }
        if (selectedType === 'note' && item.type !== 'note') {
          return false;
        }

        // 2. Specific Tag Filter
        if (selectedTag) {
          const hasMatchingTag = item.tags.some(t => 
            this.normalizeSearchText(t).includes(selectedTag)
          );
          if (!hasMatchingTag) return false;
        }

        // 3. Material ID Filter if passed
        if (filter.materialId && item.materialId !== filter.materialId) {
          return false;
        }

        // 4. Free text Search Query across: Etiket, Materyal Adı, Yazar, İçerik, Tarih
        if (normalizedQuery) {
          const materialTitleMatch = this.normalizeSearchText(item.materialTitle).includes(normalizedQuery);
          const authorMatch = this.normalizeSearchText(item.author).includes(normalizedQuery);
          const previewMatch = this.normalizeSearchText(item.preview).includes(normalizedQuery);
          const titleMatch = item.title ? this.normalizeSearchText(item.title).includes(normalizedQuery) : false;
          
          const tagsMatch = item.tags.some(t => 
            this.normalizeSearchText(t).includes(normalizedQuery) ||
            `#${this.normalizeSearchText(t)}`.includes(normalizedQuery)
          );

          // Date match (e.g., "2026", "07", formatted date)
          const dateObj = new Date(item.createdAt);
          const formattedDate = dateObj.toLocaleDateString('tr-TR');
          const dateMatch = formattedDate.includes(normalizedQuery) || item.createdAt.includes(normalizedQuery);

          return materialTitleMatch || authorMatch || previewMatch || titleMatch || tagsMatch || dateMatch;
        }

        return true;
      });

      // Compute counts
      const highlightCount = filteredItems.filter(i => i.type === 'highlight').length;
      const noteCount = filteredItems.filter(i => i.type === 'note').length;

      return {
        items: filteredItems,
        totalCount: filteredItems.length,
        highlightCount,
        noteCount,
        availableTags,
      };
    } catch (err) {
      Logger.error('KnowledgeBridgeService', 'Error executing knowledge search', err);
      return {
        items: [],
        totalCount: 0,
        highlightCount: 0,
        noteCount: 0,
        availableTags: [],
      };
    }
  }
}

export const KnowledgeBridgeService = new KnowledgeBridgeDomainService();
export default KnowledgeBridgeService;
