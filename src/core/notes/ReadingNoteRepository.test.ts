import { describe, it, expect, beforeEach } from 'vitest';
import { ReadingNoteRepositoryService } from './ReadingNoteRepository';
import { SqliteTestAdapter } from '../../infrastructure/db/test/SqliteTestAdapter';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';

describe('ReadingNoteRepositoryService', () => {
  let repository: ReadingNoteRepositoryService;
  let adapter: SqliteTestAdapter;

  beforeEach(async () => {
    adapter = new SqliteTestAdapter();
    await adapter.initialize();
    repository = new ReadingNoteRepositoryService(adapter);
  });

  it('should save and retrieve a note', async () => {
    const note: IReadingNote = {
      id: 'note-1',
      materialId: 'mat-1',
      title: 'Test Note',
      content: 'Test content',
      tags: ['tag1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repository.saveNote(note);
    const saved = await repository.getNotesByMaterial('mat-1');
    expect(saved.length).toBe(1);
    expect(saved[0].id).toBe('note-1');
    expect(saved[0].content).toBe('Test content');
  });

  it('should delete a note', async () => {
    const note: IReadingNote = {
      id: 'note-2',
      materialId: 'mat-1',
      title: 'Test Note 2',
      content: 'Test content 2',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repository.saveNote(note);
    await repository.deleteNote('note-2');
    const saved = await repository.getNotesByMaterial('mat-1');
    expect(saved.length).toBe(0);
  });
});
