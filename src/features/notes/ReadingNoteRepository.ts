/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../infrastructure/db/connection';
import { Logger } from '../../infrastructure/logger/Logger';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';

export interface DBNoteRow {
  id: string;
  material_id?: string;
  materialId?: string;
  title?: string;
  content: string;
  tags_json?: string;
  tagsJson?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

class ReadingNoteRepositoryService {
  async getAllNotes(): Promise<IReadingNote[]> {
    try {
      Logger.debug('ReadingNoteRepository', 'Fetching all reading notes across materials');
      const rows = await db.select<DBNoteRow>('reading_notes');
      return this.mapRowsToNotes(rows);
    } catch (err) {
      Logger.error('ReadingNoteRepository', 'Failed to load all reading notes', err);
      return [];
    }
  }

  async getNotesByMaterial(materialId: string): Promise<IReadingNote[]> {
    try {
      Logger.debug('ReadingNoteRepository', `Fetching notes for material [${materialId}]`);

      const rows = await db.select<DBNoteRow>('reading_notes', { materialId });
      if (rows.length === 0) {
        const altRows = await db.select<DBNoteRow>('reading_notes', { material_id: materialId });
        return this.mapRowsToNotes(altRows);
      }
      return this.mapRowsToNotes(rows);
    } catch (err) {
      Logger.error('ReadingNoteRepository', `Failed to load notes for [${materialId}]`, err);
      return [];
    }
  }

  async saveNote(note: IReadingNote): Promise<IReadingNote> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: note.id,
        materialId: note.materialId,
        material_id: note.materialId,
        title: note.title || '',
        content: note.content,
        tagsJson: JSON.stringify(note.tags || []),
        tags_json: JSON.stringify(note.tags || []),
        createdAt: note.createdAt || now,
        created_at: note.createdAt || now,
        updatedAt: now,
        updated_at: now,
      };

      const existing = await db.select<DBNoteRow>('reading_notes', { id: note.id });
      if (existing.length > 0) {
        await db.update('reading_notes', payload, { id: note.id });
        Logger.info('ReadingNoteRepository', `Updated reading note [${note.id}]`);
      } else {
        await db.insert('reading_notes', payload);
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
      await db.delete('reading_notes', { id });
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
        const jsonStr = row.tagsJson || row.tags_json || '[]';
        tags = JSON.parse(jsonStr);
      } catch {
        tags = [];
      }

      return {
        id: row.id,
        materialId: row.materialId || row.material_id || '',
        title: row.title || '',
        content: row.content || '',
        tags,
        createdAt: row.createdAt || row.created_at || new Date().toISOString(),
        updatedAt: row.updatedAt || row.updated_at || new Date().toISOString(),
      };
    });
  }
}

export const ReadingNoteRepository = new ReadingNoteRepositoryService();
export default ReadingNoteRepository;
