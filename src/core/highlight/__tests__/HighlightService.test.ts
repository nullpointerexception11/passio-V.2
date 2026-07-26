/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HighlightService } from '../HighlightService';
import { IHighlightRect } from '../HighlightModel';

// Mock HighlightRepository in memory
vi.mock('../HighlightRepository', () => {
  const store = new Map<string, any>();
  return {
    HighlightRepository: {
      getHighlightsByMaterial: async (materialId: string) => {
        return Array.from(store.values()).filter((item) => item.materialId === materialId);
      },
      saveHighlight: async (fragment: any) => {
        store.set(fragment.id, fragment);
        return fragment;
      },
      deleteHighlight: async (id: string) => {
        store.delete(id);
      },
    },
  };
});

describe('HighlightService - Domain Lifecycle & Event Tests', () => {
  const testDocId = 'doc-test-123';
  const dummyRects: IHighlightRect[] = [{ x: 0.1, y: 0.1, width: 0.5, height: 0.05 }];

  beforeEach(async () => {
    // Clear and reload
    await HighlightService.loadHighlights(testDocId);
  });

  it('creates a new highlight fragment with color and note', async () => {
    const created = await HighlightService.createHighlight(
      testDocId,
      1,
      'Passio felsefesi',
      dummyRects,
      'purple',
      'Önemli anahtar felsefe'
    );

    expect(created.id).toBeDefined();
    expect(created.materialId).toBe(testDocId);
    expect(created.pageNumber).toBe(1);
    expect(created.selectedText).toBe('Passio felsefesi');
    expect(created.color).toBe('purple');
    expect(created.note).toBe('Önemli anahtar felsefe');
  });

  it('retrieves highlights for a specific page', async () => {
    await HighlightService.createHighlight(testDocId, 1, 'Sayfa 1 metni', dummyRects, 'yellow');
    await HighlightService.createHighlight(testDocId, 2, 'Sayfa 2 metni', dummyRects, 'green');

    const page1Highlights = HighlightService.getHighlightsForPage(testDocId, 1);
    const page2Highlights = HighlightService.getHighlightsForPage(testDocId, 2);

    expect(page1Highlights.some((h) => h.selectedText === 'Sayfa 1 metni')).toBe(true);
    expect(page1Highlights.some((h) => h.selectedText === 'Sayfa 2 metni')).toBe(false);
    expect(page2Highlights.some((h) => h.selectedText === 'Sayfa 2 metni')).toBe(true);
  });

  it('updates highlight color and note successfully', async () => {
    const created = await HighlightService.createHighlight(testDocId, 1, 'Güncellenecek metin', dummyRects, 'blue');

    const updated = await HighlightService.updateHighlight(testDocId, created.id, {
      color: 'orange',
      note: 'Eklenen yeni not',
    });

    expect(updated).not.toBeNull();
    expect(updated?.color).toBe('orange');
    expect(updated?.note).toBe('Eklenen yeni not');

    const pageHighlights = HighlightService.getHighlightsForPage(testDocId, 1);
    const found = pageHighlights.find((h) => h.id === created.id);
    expect(found?.color).toBe('orange');
  });

  it('deletes highlight fragment successfully', async () => {
    const created = await HighlightService.createHighlight(testDocId, 1, 'Silinecek metin', dummyRects, 'red');

    await HighlightService.deleteHighlight(testDocId, created.id);

    const pageHighlights = HighlightService.getHighlightsForPage(testDocId, 1);
    expect(pageHighlights.some((h) => h.id === created.id)).toBe(false);
  });

  it('notifies subscribers when highlights are modified', async () => {
    const listener = vi.fn();
    const unsubscribe = HighlightService.subscribe(listener);

    await HighlightService.createHighlight(testDocId, 1, 'Abone testi', dummyRects, 'yellow');

    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });
});
