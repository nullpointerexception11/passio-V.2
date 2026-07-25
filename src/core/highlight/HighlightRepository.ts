/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db/connection';
import { Logger } from '../logger/Logger';
import { IHighlightFragment, HighlightColor } from './HighlightModel';

export interface DBHighlightRow {
  id: string;
  material_id?: string;
  materialId?: string;
  page_number?: number;
  pageNumber?: number;
  selected_text?: string;
  selectedText?: string;
  rects_json?: string;
  rectsJson?: string;
  color: HighlightColor;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

class HighlightRepositoryService {
  /**
   * Fetches all highlights across all materials
   */
  async getAllHighlights(): Promise<IHighlightFragment[]> {
    try {
      Logger.debug('HighlightRepository', 'Fetching all highlights across materials');
      const rows = await db.select<DBHighlightRow>('highlights');
      return this.mapRowsToFragments(rows);
    } catch (err) {
      Logger.error('HighlightRepository', 'Failed to load all highlights', err);
      return [];
    }
  }

  /**
   * Fetches all highlights belonging to a specific material/document
   */
  async getHighlightsByMaterial(materialId: string): Promise<IHighlightFragment[]> {
    try {
      Logger.debug('HighlightRepository', `Fetching highlights for material [${materialId}]`);
      
      // Try DB select with both camelCase and snake_case mapping support
      const rows = await db.select<DBHighlightRow>('highlights', { materialId });
      if (rows.length === 0) {
        const altRows = await db.select<DBHighlightRow>('highlights', { material_id: materialId });
        return this.mapRowsToFragments(altRows);
      }
      return this.mapRowsToFragments(rows);
    } catch (err) {
      Logger.error('HighlightRepository', `Failed to load highlights for [${materialId}]`, err);
      return [];
    }
  }

  /**
   * Saves or updates a Knowledge Fragment in persistent storage
   */
  async saveHighlight(fragment: IHighlightFragment): Promise<IHighlightFragment> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: fragment.id,
        materialId: fragment.materialId,
        material_id: fragment.materialId,
        pageNumber: fragment.pageNumber,
        page_number: fragment.pageNumber,
        selectedText: fragment.selectedText,
        selected_text: fragment.selectedText,
        rectsJson: JSON.stringify(fragment.rects),
        rects_json: JSON.stringify(fragment.rects),
        color: fragment.color,
        createdAt: fragment.createdAt || now,
        created_at: fragment.createdAt || now,
        updatedAt: now,
        updated_at: now,
      };

      const existing = await db.select<DBHighlightRow>('highlights', { id: fragment.id });
      if (existing.length > 0) {
        await db.update('highlights', payload, { id: fragment.id });
        Logger.info('HighlightRepository', `Updated highlight fragment [${fragment.id}]`);
      } else {
        await db.insert('highlights', payload);
        Logger.info('HighlightRepository', `Inserted new highlight fragment [${fragment.id}]`);
      }

      return {
        ...fragment,
        updatedAt: now,
      };
    } catch (err) {
      Logger.error('HighlightRepository', 'Failed to save highlight fragment', err);
      throw err;
    }
  }

  /**
   * Removes a Knowledge Fragment by ID
   */
  async deleteHighlight(id: string): Promise<void> {
    try {
      await db.delete('highlights', { id });
      Logger.info('HighlightRepository', `Deleted highlight fragment [${id}]`);
    } catch (err) {
      Logger.error('HighlightRepository', `Failed to delete highlight fragment [${id}]`, err);
      throw err;
    }
  }

  private mapRowsToFragments(rows: DBHighlightRow[]): IHighlightFragment[] {
    return rows.map((row) => {
      let rects = [];
      try {
        const jsonStr = row.rectsJson || row.rects_json || '[]';
        rects = JSON.parse(jsonStr);
      } catch {
        rects = [];
      }

      return {
        id: row.id,
        materialId: row.materialId || row.material_id || '',
        pageNumber: row.pageNumber || row.page_number || 1,
        selectedText: row.selectedText || row.selected_text || '',
        rects,
        color: (row.color as HighlightColor) || 'yellow',
        createdAt: row.createdAt || row.created_at || new Date().toISOString(),
        updatedAt: row.updatedAt || row.updated_at || new Date().toISOString(),
      };
    });
  }
}

export const HighlightRepository = new HighlightRepositoryService();
export default HighlightRepository;
