/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadingNoteRepository } from './ReadingNoteRepository';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';
import { Logger } from '../../infrastructure/logger/Logger';

type NoteListener = (notes: IReadingNote[]) => void;

class ReadingNoteDomainService {
  private activeNotes: Map<string, IReadingNote[]> = new Map();
  private listeners: Set<NoteListener> = new Set();

  async loadNotes(materialId: string): Promise<IReadingNote[]> {
    try {
      const notes = await ReadingNoteRepository.getNotesByMaterial(materialId);
      this.activeNotes.set(materialId, notes);
      this.notifyListeners();
      Logger.info('ReadingNoteService', `Loaded ${notes.length} notes for material [${materialId}]`);
      return notes;
    } catch (err) {
      Logger.error('ReadingNoteService', `Error loading notes for material [${materialId}]`, err);
      return [];
    }
  }

  getNotesForMaterial(materialId: string): IReadingNote[] {
    return this.activeNotes.get(materialId) || [];
  }

  async saveNote(
    materialId: string,
    title: string,
    content: string,
    tags: string[],
    existingId?: string
  ): Promise<IReadingNote> {
    const now = new Date().toISOString();
    const id = existingId || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const note: IReadingNote = {
      id,
      materialId,
      title: title.trim(),
      content: content.trim(),
      tags: tags.map((t) => t.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const saved = await ReadingNoteRepository.saveNote(note);

      const currentList = this.activeNotes.get(materialId) || [];
      const index = currentList.findIndex((n) => n.id === id);

      let updatedList: IReadingNote[];
      if (index >= 0) {
        updatedList = [...currentList];
        updatedList[index] = saved;
      } else {
        updatedList = [saved, ...currentList];
      }

      this.activeNotes.set(materialId, updatedList);
      this.notifyListeners();
      Logger.info('ReadingNoteService', `Saved reading note [${saved.id}]`);
      return saved;
    } catch (err) {
      Logger.error('ReadingNoteService', 'Failed to save reading note', err);
      throw err;
    }
  }

  async deleteNote(materialId: string, noteId: string): Promise<void> {
    try {
      await ReadingNoteRepository.deleteNote(noteId);

      const currentList = this.activeNotes.get(materialId) || [];
      const updatedList = currentList.filter((n) => n.id !== noteId);
      this.activeNotes.set(materialId, updatedList);

      this.notifyListeners();
      Logger.info('ReadingNoteService', `Deleted reading note [${noteId}]`);
    } catch (err) {
      Logger.error('ReadingNoteService', `Failed to delete note [${noteId}]`, err);
      throw err;
    }
  }

  searchNotes(materialId: string, searchTerm: string): IReadingNote[] {
    const list = this.getNotesForMaterial(materialId);
    if (!searchTerm || !searchTerm.trim()) return list;

    const query = searchTerm.toLowerCase().trim();

    return list.filter((note) => {
      const matchesTitle = note.title.toLowerCase().includes(query);
      const matchesContent = note.content.toLowerCase().includes(query);
      const matchesTag = note.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesTitle || matchesContent || matchesTag;
    });
  }

  subscribe(listener: NoteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const all = Array.from(this.activeNotes.values()).flat();
    this.listeners.forEach((fn) => fn(all));
  }
}

export const ReadingNoteService = new ReadingNoteDomainService();
export default ReadingNoteService;
