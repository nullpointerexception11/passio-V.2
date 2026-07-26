/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { HighlightEngine } from '../HighlightEngine';
import { IHighlightRect, HIGHLIGHT_COLOR_MAP, HighlightColor } from '../HighlightModel';

describe('HighlightEngine - Usage & Performance Tests', () => {
  describe('mergeAdjacentRects', () => {
    it('returns empty array when input is empty or null', () => {
      expect(HighlightEngine.mergeAdjacentRects([])).toEqual([]);
    });

    it('returns same array if only 1 rect provided', () => {
      const singleRect: IHighlightRect = { x: 0.1, y: 0.2, width: 0.3, height: 0.05 };
      expect(HighlightEngine.mergeAdjacentRects([singleRect])).toEqual([singleRect]);
    });

    it('merges horizontally adjacent rects on the same line into a single rect', () => {
      const rect1: IHighlightRect = { x: 0.10, y: 0.20, width: 0.15, height: 0.04 };
      const rect2: IHighlightRect = { x: 0.25, y: 0.20, width: 0.20, height: 0.04 }; // Adjacent

      const merged = HighlightEngine.mergeAdjacentRects([rect1, rect2]);
      expect(merged.length).toBe(1);
      expect(merged[0].x).toBe(0.10);
      expect(merged[0].width).toBeCloseTo(0.35); // 0.15 + 0.20
      expect(merged[0].y).toBe(0.20);
    });

    it('merges overlapping rects on the same line', () => {
      const rect1: IHighlightRect = { x: 0.10, y: 0.20, width: 0.20, height: 0.04 };
      const rect2: IHighlightRect = { x: 0.22, y: 0.20, width: 0.15, height: 0.04 }; // Overlapping

      const merged = HighlightEngine.mergeAdjacentRects([rect1, rect2]);
      expect(merged.length).toBe(1);
      expect(merged[0].x).toBe(0.10);
      expect(merged[0].width).toBeCloseTo(0.27); // 0.22 - 0.10 + 0.15 = 0.27
    });

    it('does NOT merge rects on different lines (different vertical y positions)', () => {
      const line1: IHighlightRect = { x: 0.10, y: 0.20, width: 0.30, height: 0.04 };
      const line2: IHighlightRect = { x: 0.10, y: 0.30, width: 0.30, height: 0.04 }; // Line 2

      const merged = HighlightEngine.mergeAdjacentRects([line1, line2]);
      expect(merged.length).toBe(2);
      expect(merged[0].y).toBe(0.20);
      expect(merged[1].y).toBe(0.30);
    });

    it('merges 3 separate word rects on the same line into a single continuous rect', () => {
      const word1: IHighlightRect = { x: 0.10, y: 0.20, width: 0.10, height: 0.04 };
      const word2: IHighlightRect = { x: 0.25, y: 0.20, width: 0.10, height: 0.04 };
      const word3: IHighlightRect = { x: 0.40, y: 0.20, width: 0.10, height: 0.04 };

      const merged = HighlightEngine.mergeAdjacentRects([word1, word2, word3]);
      expect(merged.length).toBe(1);
      expect(merged[0].x).toBe(0.10);
      expect(merged[0].width).toBeCloseTo(0.40); // Max right (0.40 + 0.10) - Min left (0.10)
      expect(merged[0].y).toBe(0.20);
    });

    it('keeps rects on two different lines completely separate', () => {
      const rectLine1: IHighlightRect = { x: 0.10, y: 0.20, width: 0.30, height: 0.04 };
      const rectLine2: IHighlightRect = { x: 0.15, y: 0.35, width: 0.25, height: 0.04 };

      const merged = HighlightEngine.mergeAdjacentRects([rectLine1, rectLine2]);
      expect(merged.length).toBe(2);
      expect(merged[0].y).toBe(0.20);
      expect(merged[1].y).toBe(0.35);
    });
  });

  describe('findHighlightAtPoint', () => {
    it('returns the fragment if click coordinates intersect normalized rect', () => {
      const mockContainer = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 500, height: 1000 }),
      } as HTMLElement;

      const fragment = {
        id: 'hl-1',
        materialId: 'doc-1',
        pageNumber: 1,
        selectedText: 'Test text',
        color: 'yellow' as const,
        rects: [{ x: 0.1, y: 0.2, width: 0.4, height: 0.05 }], // left 50, top 200, right 250, bottom 250
        createdAt: '2026-07-26',
        updatedAt: '2026-07-26',
      };

      // Point at x=100, y=220 (inside rect)
      const hit = HighlightEngine.findHighlightAtPoint([fragment], mockContainer, 100, 220);
      expect(hit).not.toBeNull();
      expect(hit?.id).toBe('hl-1');

      // Point at x=10, y=10 (outside rect)
      const miss = HighlightEngine.findHighlightAtPoint([fragment], mockContainer, 10, 10);
      expect(miss).toBeNull();
    });
  });

  describe('extractNormalizedSelection', () => {
    it('returns null if selection is empty or collapsed', () => {
      const emptySelection = { isCollapsed: true, toString: () => '' } as Selection;
      const mockContainer = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }) } as HTMLElement;

      expect(HighlightEngine.extractNormalizedSelection(emptySelection, mockContainer, 1)).toBeNull();
    });

    it('extracts and normalizes valid selection rects relative to container bounds', () => {
      const mockRange = {
        getClientRects: () => [
          { left: 60, top: 160, width: 300, height: 20 }, // 10% x, 20% y, 50% w, 2.5% h
        ],
        getBoundingClientRect: () => ({ left: 60, top: 160, width: 300, height: 20 }),
      };

      const mockSelection = {
        isCollapsed: false,
        toString: () => 'Seçilen Örnek Metin',
        getRangeAt: () => mockRange,
      } as unknown as Selection;

      const mockContainer = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }),
      } as HTMLElement;

      const result = HighlightEngine.extractNormalizedSelection(mockSelection, mockContainer, 2);

      expect(result).not.toBeNull();
      expect(result?.pageNumber).toBe(2);
      expect(result?.selectedText).toBe('Seçilen Örnek Metin');
      expect(result?.rects.length).toBe(1);
      expect(result?.rects[0].x).toBeCloseTo(0.10);
      expect(result?.rects[0].y).toBeCloseTo(0.20);
      expect(result?.rects[0].width).toBeCloseTo(0.50);
      expect(result?.rects[0].height).toBeCloseTo(0.025);
    });

    it('calculates boundingClientYBottom correctly based on the maximum rect bottom', () => {
      const mockRange = {
        getClientRects: () => [
          { left: 60, top: 160, width: 300, height: 20 },
          { left: 60, top: 190, width: 250, height: 25 },
        ],
        getBoundingClientRect: () => ({ left: 60, top: 160, width: 300, height: 55 }),
      };

      const mockSelection = {
        isCollapsed: false,
        toString: () => 'Multi line',
        getRangeAt: () => mockRange,
      } as unknown as Selection;

      const mockContainer = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }),
      } as HTMLElement;

      const result = HighlightEngine.extractNormalizedSelection(mockSelection, mockContainer, 1);
      expect(result).not.toBeNull();
      // rect 1 bottom = 160 + 20 = 180
      // rect 2 bottom = 190 + 25 = 215
      // maxBottom = 215
      expect(result?.boundingClientYBottom).toBe(215);
    });

    it('clamps normalized coordinates within 0..1 boundary', () => {
      const mockRange = {
        getClientRects: () => [
          { left: -50, top: -20, width: 700, height: 900 },
        ],
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }),
      };

      const mockSelection = {
        isCollapsed: false,
        toString: () => 'Sınır Dışı Metin',
        getRangeAt: () => mockRange,
      } as unknown as Selection;

      const mockContainer = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }),
      } as HTMLElement;

      const result = HighlightEngine.extractNormalizedSelection(mockSelection, mockContainer, 1);

      expect(result).not.toBeNull();
      expect(result?.rects[0].x).toBe(0);
      expect(result?.rects[0].y).toBe(0);
      expect(result?.rects[0].width).toBe(1);
      expect(result?.rects[0].height).toBe(1);
    });

    it('processes multi-line text selection rapidly (< 5ms for 50 lines)', () => {
      const clientRects = Array.from({ length: 50 }).map((_, i) => ({
        left: 50,
        top: 50 + i * 15,
        width: 400,
        height: 12,
      }));

      const mockRange = {
        getClientRects: () => clientRects,
        getBoundingClientRect: () => ({ left: 50, top: 50, width: 400, height: 750 }),
      };

      const mockSelection = {
        isCollapsed: false,
        toString: () => 'Çok satırlı büyük paragraf seçimi '.repeat(50),
        getRangeAt: () => mockRange,
      } as unknown as Selection;

      const mockContainer = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 1000 }),
      } as HTMLElement;

      const startTime = performance.now();
      const result = HighlightEngine.extractNormalizedSelection(mockSelection, mockContainer, 1);
      const duration = performance.now() - startTime;

      expect(result).not.toBeNull();
      expect(result?.rects.length).toBeLessThanOrEqual(50);
      expect(duration).toBeLessThan(5); // Must process in under 5 milliseconds
    });
  });

  describe('denormalizeRect', () => {
    it('converts normalized 0..1 coordinates accurately to page pixel dimensions', () => {
      const normalized: IHighlightRect = { x: 0.1, y: 0.2, width: 0.5, height: 0.05 };
      const pageWidth = 800;
      const pageHeight = 1000;

      const pixels = HighlightEngine.denormalizeRect(normalized, pageWidth, pageHeight);

      expect(pixels.left).toBe(80);     // 0.1 * 800
      expect(pixels.top).toBe(200);     // 0.2 * 1000
      expect(pixels.width).toBe(400);   // 0.5 * 800
      expect(pixels.height).toBe(50);   // 0.05 * 1000
    });
  });

  describe('getColorStyles', () => {
    it('returns style configurations for all 6 highlight color presets', () => {
      const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'purple', 'orange', 'red'];

      colors.forEach((color) => {
        const style = HighlightEngine.getColorStyles(color);
        expect(style).toBeDefined();
        expect(style.bg).toBeDefined();
        expect(style.border).toBeDefined();
        expect(style.accentHex).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(style.label).toBeDefined();
      });
    });

    it('defaults to yellow style if unknown color requested', () => {
      const style = HighlightEngine.getColorStyles('unknown' as any);
      expect(style).toEqual(HIGHLIGHT_COLOR_MAP.yellow);
    });
  });
});
