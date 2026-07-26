/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, IDatabaseService } from '../../infrastructure/db/connection';
import { Logger } from '../../infrastructure/logger/Logger';
import { IReadingNote } from './ReadingNoteModel';

export interface DBNoteRow {
  id: string;
  material_id: string;
  title?: string;
  content: string;
  tags_json?: string;
  created_at?: string;
  updated_at?: string;
}

export class ReadingNoteRepositoryService {
  constructor(private dbInstance: IDatabaseService = db) {}

  async getAllNotes(): Promise<IReadingNote[]> {
    try {
      Logger.debug('ReadingNoteRepository', 'Fetching all reading notes across materials');
      const rows = await this.dbInstance.select<DBNoteRow>('reading_notes');
      return this.mapRowsToNotes(rows);
    } catch (err) {
      Logger.error('ReadingNoteRepository', 'Failed to load all reading notes', err);
      return [];
    }
  }

  async getNotesByMaterial(materialId: string): Promise<IReadingNote[]> {
    try {
      Logger.debug('ReadingNoteRepository', `Fetching notes for material [${materialId}]`);
      const rows = await this.dbInstance.select<DBNoteRow>('reading_notes', { material_id: materialId });
      return this.mapRowsToNotes(rows);
    } catch (err) {
      Logger.error('ReadingNoteRepository', `Failed to load notes for [${materialId}]`, err);
      return [];
    }
  }

  async saveNote(note: IReadingNote): Promise<IReadingNote> {
    try {
      const now = new Date().toISOString();
      const payload: DBNoteRow = {
        id: note.id,
        material_id: note.materialId,
        title: note.title || '',
        content: note.content,
        tags_json: JSON.stringify(note.tags || []),
        created_at: note.createdAt || now,
        updated_at: now,
      };

      const existing = await this.dbInstance.select<DBNoteRow>('reading_notes', { id: note.id });
      if (existing.length > 0) {
        const { id, ...updatePayload } = payload;
        await this.dbInstance.update('reading_notes', updatePayload as unknown as Record<string, unknown>, { id: note.id });
        Logger.info('ReadingNoteRepository', `Updated reading note [${note.id}]`);
      } else {
        await this.dbInstance.insert('reading_notes', payload as unknown as Record<string, unknown>);
        Logger.info('ReadingNoteRepository', `Inserted new reading note [${note.id}]`);
      }

      return {
        ...note,
        updatedAt: now,
      };
    } catch (err) {
      Logger.error('ReadingNoteRepository', 'Failed to save reading note', err);
      throw err;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.dbInstance.delete('reading_notes', { id });
      Logger.info('ReadingNoteRepository', `Deleted reading note [${id}]`);
    } catch (err) {
      Logger.error('ReadingNoteRepository', `Failed to delete reading note [${id}]`, err);
      throw err;
    }
  }

  private mapRowsToNotes(rows: DBNoteRow[]): IReadingNote[] {
    return rows.map((row) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(row.tags_json || '[]');
      } catch {
        tags = [];
      }

      return {
        id: row.id,
        materialId: row.material_id || '',
        title: row.title || '',
        content: row.content || '',
        tags,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
  }
}

export const ReadingNoteRepository = new ReadingNoteRepositoryService();
export default ReadingNoteRepository;
