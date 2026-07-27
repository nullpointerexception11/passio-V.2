/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IReadingNote } from '../../entities/note/ReadingNoteModel';
import { ReadingNoteRepository } from '../notes/ReadingNoteRepository';
import { NotebookService } from '../notebooks/NotebookService';
import { INotebook } from '../notebooks/NotebookModel';
import { Logger } from '../logger/Logger';

export interface IInboxNote {
  id: string;
  content: string;
  createdAt: string;
  isConverted?: boolean;
  convertedToType?: 'reading_note' | 'notebook';
  convertedToId?: string;
}

type InboxListener = () => void;

const STORAGE_KEY = 'passio_inbox_notes';

class InboxDomainService {
  private notes: IInboxNote[] = [];
  private listeners: Set<InboxListener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.notes = JSON.parse(raw);
      } else {
        this.seedInitialNotes();
      }
      this.initialized = true;
    } catch (err) {
      Logger.error('InboxService', 'Error initializing inbox notes', err);
      this.notes = [];
    }
  }

  private seedInitialNotes() {
    const seed: IInboxNote[] = [
      {
        id: 'inbox-seed-1',
        content: 'Yeraltından Notlar 2. Bölüm için özgürlük ve keder üzerine bir paragraf taslağı hazırla.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        isConverted: false,
      },
      {
        id: 'inbox-seed-2',
        content: 'Dostoyevski anlatısında iç monologların varoluşçu okuması.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        isConverted: false,
      },
    ];
    this.notes = seed;
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
    } catch (err) {
      Logger.error('InboxService', 'Failed to persist inbox notes', err);
    }
  }

  public getNotes(): IInboxNote[] {
    this.init();
    return [...this.notes];
  }

  public getUnconvertedNotes(): IInboxNote[] {
    this.init();
    return this.notes.filter((n) => !n.isConverted);
  }

  public addNote(content: string): IInboxNote {
    this.init();
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error('Note content cannot be empty');
    }

    const newNote: IInboxNote = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      content: trimmed,
      createdAt: new Date().toISOString(),
      isConverted: false,
    };

    this.notes.unshift(newNote);
    this.saveToStorage();
    this.notifyListeners();
    Logger.info('InboxService', `Created inbox note [${newNote.id}]`);
    return newNote;
  }

  public deleteNote(id: string): void {
    this.init();
    this.notes = this.notes.filter((n) => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
    Logger.info('InboxService', `Deleted inbox note [${id}]`);
  }

  /**
   * Converts an Inbox note into a Reading Note (Okuma Notu)
   */
  public async convertToReadingNote(
    inboxId: string,
    materialId = 'dostoyevski-notes-from-underground'
  ): Promise<IReadingNote> {
    this.init();
    const inboxItem = this.notes.find((n) => n.id === inboxId);
    if (!inboxItem) {
      throw new Error('Inbox note not found');
    }

    const firstLine = inboxItem.content.split('\n')[0];
    const title = firstLine.length > 40 ? `${firstLine.substring(0, 40)}...` : firstLine;

    const readingNote: IReadingNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      materialId,
      title: title || 'Inbox Notu',
      content: inboxItem.content,
      tags: ['inbox', 'dönüştürüldü'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ReadingNoteRepository.saveNote(readingNote);

    // Update inbox note status
    inboxItem.isConverted = true;
    inboxItem.convertedToType = 'reading_note';
    inboxItem.convertedToId = readingNote.id;
    this.saveToStorage();
    this.notifyListeners();

    Logger.info('InboxService', `Converted inbox note [${inboxId}] to ReadingNote [${readingNote.id}]`);
    return readingNote;
  }

  /**
   * Converts an Inbox note into a Yazıhane Notebook
   */
  public async convertToNotebook(inboxId: string): Promise<INotebook> {
    this.init();
    const inboxItem = this.notes.find((n) => n.id === inboxId);
    if (!inboxItem) {
      throw new Error('Inbox note not found');
    }

    const firstLine = inboxItem.content.split('\n')[0];
    const title = firstLine.length > 30 ? `${firstLine.substring(0, 30)}...` : firstLine;

    const notebook = await NotebookService.createNotebook(
      title || 'Yeni Defter',
      'dusunce'
    );
    await NotebookService.updateContent(notebook.metadata.id, inboxItem.content);

    // Update inbox note status
    inboxItem.isConverted = true;
    inboxItem.convertedToType = 'notebook';
    inboxItem.convertedToId = notebook.metadata.id;
    this.saveToStorage();
    this.notifyListeners();

    Logger.info('InboxService', `Converted inbox note [${inboxId}] to Notebook [${notebook.metadata.id}]`);
    return notebook;
  }

  public subscribe(listener: InboxListener): () => void {
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
        Logger.error('InboxService', 'Error notifying listener', err);
      }
    });
  }
}

export const InboxService = new InboxDomainService();
export default InboxService;
