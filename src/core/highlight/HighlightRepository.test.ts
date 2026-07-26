import { describe, it, expect, beforeEach } from 'vitest';
import { HighlightRepositoryService } from './HighlightRepository';
import { SqliteTestAdapter } from '../../infrastructure/db/test/SqliteTestAdapter';
import { IHighlightFragment } from '../../entities/highlight/HighlightModel';

describe('HighlightRepositoryService', () => {
  let repository: HighlightRepositoryService;
  let adapter: SqliteTestAdapter;

  beforeEach(async () => {
    adapter = new SqliteTestAdapter();
    await adapter.initialize();
    repository = new HighlightRepositoryService(adapter);
  });

  it('should save and retrieve a highlight', async () => {
    const highlight: IHighlightFragment = {
      id: 'test-id',
      materialId: 'mat-1',
      pageNumber: 1,
      selectedText: 'Test text',
      rects: [],
      color: 'yellow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repository.saveHighlight(highlight);
    const saved = await repository.getHighlightsByMaterial('mat-1');
    expect(saved.length).toBe(1);
    expect(saved[0].id).toBe('test-id');
    expect(saved[0].selectedText).toBe('Test text');
  });

  it('should delete a highlight', async () => {
    const highlight: IHighlightFragment = {
      id: 'test-id-2',
      materialId: 'mat-1',
      pageNumber: 1,
      selectedText: 'Test text',
      rects: [],
      color: 'yellow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repository.saveHighlight(highlight);
    await repository.deleteHighlight('test-id-2');
    const saved = await repository.getHighlightsByMaterial('mat-1');
    expect(saved.length).toBe(0);
  });
});
