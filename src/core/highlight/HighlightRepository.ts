/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db/connection';
import { Logger } from '../logger/Logger';
import { IHighlightFragment, HighlightColor } from './HighlightModel';

export interface DBHighlightRow {
  id: string;
  material_id: string;
  page_number: number;
  selected_text: string;
  rects_json: string;
  color: HighlightColor;
  created_at: string;
  updated_at: string;
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
      const rows = await db.select<DBHighlightRow>('highlights', { material_id: materialId });
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
      const payload: DBHighlightRow = {
        id: fragment.id,
        material_id: fragment.materialId,
        page_number: fragment.pageNumber,
        selected_text: fragment.selectedText,
        rects_json: JSON.stringify(fragment.rects || []),
        color: fragment.color,
        created_at: fragment.createdAt || now,
        updated_at: now,
      };

      const existing = await db.select<DBHighlightRow>('highlights', { id: fragment.id });
      if (existing.length > 0) {
        await db.update('highlights', payload as unknown as Record<string, unknown>, { id: fragment.id });
        Logger.info('HighlightRepository', `Updated highlight fragment [${fragment.id}]`);
      } else {
        await db.insert('highlights', payload as unknown as Record<string, unknown>);
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
        rects = JSON.parse(row.rects_json || '[]');
      } catch {
        rects = [];
      }

      return {
        id: row.id,
        materialId: row.material_id || '',
        pageNumber: row.page_number ?? 1,
        selectedText: row.selected_text || '',
        rects,
        color: (row.color as HighlightColor) || 'yellow',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
  }
}

export const HighlightRepository = new HighlightRepositoryService();
export default HighlightRepository;
