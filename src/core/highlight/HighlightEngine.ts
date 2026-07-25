/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IHighlightRect, HighlightColor, HIGHLIGHT_COLOR_MAP } from './HighlightModel';
import { Logger } from '../logger/Logger';

export interface ISelectionResult {
  pageNumber: number;
  selectedText: string;
  rects: IHighlightRect[];
  boundingClientX: number;
  boundingClientY: number;
}

class HighlightEngineService {
  /**
   * Normalizes selection client rects relative to the target page container bounds (0..1 percentage scale)
   */
  extractNormalizedSelection(
    selection: Selection,
    pageContainerEl: HTMLElement,
    pageNumber: number
  ): ISelectionResult | null {
    if (!selection || selection.isCollapsed) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText) return null;

    try {
      const range = selection.getRangeAt(0);
      const pageRect = pageContainerEl.getBoundingClientRect();

      if (pageRect.width === 0 || pageRect.height === 0) return null;

      const clientRects = Array.from(range.getClientRects());
      if (clientRects.length === 0) return null;

      const normalizedRects: IHighlightRect[] = [];

      for (const rect of clientRects) {
        // Skip microscopic empty spacing rects
        if (rect.width < 1 || rect.height < 1) continue;

        const relX = (rect.left - pageRect.left) / pageRect.width;
        const relY = (rect.top - pageRect.top) / pageRect.height;
        const relW = rect.width / pageRect.width;
        const relH = rect.height / pageRect.height;

        // Ensure bounds stay strictly inside 0..1 range
        const x = Math.max(0, Math.min(1, relX));
        const y = Math.max(0, Math.min(1, relY));
        const width = Math.max(0, Math.min(1 - x, relW));
        const height = Math.max(0, Math.min(1 - y, relH));

        normalizedRects.push({ x, y, width, height });
      }

      if (normalizedRects.length === 0) return null;

      const rangeRect = range.getBoundingClientRect();

      return {
        pageNumber,
        selectedText,
        rects: normalizedRects,
        boundingClientX: rangeRect.left + rangeRect.width / 2,
        boundingClientY: rangeRect.top,
      };
    } catch (err) {
      Logger.error('HighlightEngine', 'Failed to extract normalized selection rects', err);
      return null;
    }
  }

  /**
   * Converts normalized rects (0..1 scale) back to rendered pixel coordinates
   */
  denormalizeRect(
    rect: IHighlightRect,
    pageWidth: number,
    pageHeight: number
  ): { left: number; top: number; width: number; height: number } {
    return {
      left: rect.x * pageWidth,
      top: rect.y * pageHeight,
      width: rect.width * pageWidth,
      height: rect.height * pageHeight,
    };
  }

  /**
   * Returns style properties for rendering a highlight fragment color
   */
  getColorStyles(color: HighlightColor) {
    return HIGHLIGHT_COLOR_MAP[color] || HIGHLIGHT_COLOR_MAP.yellow;
  }
}

export const HighlightEngine = new HighlightEngineService();
export default HighlightEngine;
