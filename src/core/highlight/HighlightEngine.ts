/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IHighlightRect, IHighlightFragment, HighlightColor, HIGHLIGHT_COLOR_MAP } from './HighlightModel';
import { Logger } from '../logger/Logger';

export interface ISelectionResult {
  pageNumber: number;
  selectedText: string;
  rects: IHighlightRect[];
  boundingClientX: number;
  boundingClientY: number;
  boundingClientYBottom: number;
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
      const pageRect = pageContainerEl.getBoundingClientRect();
      if (pageRect.width <= 0 || pageRect.height <= 0) return null;

      const range = selection.getRangeAt(0);
      const rawClientRects = range.getClientRects();
      if (rawClientRects.length === 0) return null;

      // Filter rects to exclude rects that are completely disjoint from this page container
      const clientRects: DOMRect[] = [];
      const pageTop = pageRect.top;
      const pageBottom = pageRect.bottom ?? (pageRect.top + pageRect.height);

      for (let i = 0; i < rawClientRects.length; i++) {
        const rect = rawClientRects[i];
        const rBottom = rect.bottom ?? (rect.top + rect.height);
        const rTop = rect.top;
        // Allow rect if it overlaps vertically with page container
        if (rBottom >= pageTop - 20 && rTop <= pageBottom + 20) {
          clientRects.push(rect);
        }
      }

      if (clientRects.length === 0) return null;

      const normalizedRects: IHighlightRect[] = [];
      let minTop = Infinity;
      let minLeft = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      const invWidth = 1 / pageRect.width;
      const invHeight = 1 / pageRect.height;

      for (let i = 0; i < clientRects.length; i++) {
        const rect = clientRects[i];
        // Skip microscopic empty spacing rects (< 0.5px)
        if (rect.width < 0.5 || rect.height < 0.5) continue;

        if (rect.top < minTop) {
          minTop = rect.top;
          minLeft = rect.left;
        } else if (rect.top === minTop && rect.left < minLeft) {
          minLeft = rect.left;
        }
        if (rect.left + rect.width > maxRight) {
          maxRight = rect.left + rect.width;
        }
        const rectBottom = rect.top + rect.height;
        if (rectBottom > maxBottom) {
          maxBottom = rectBottom;
        }

        const relX = (rect.left - pageRect.left) * invWidth;
        const relY = (rect.top - pageRect.top) * invHeight;
        const relW = rect.width * invWidth;
        const relH = rect.height * invHeight;

        // Ensure bounds stay strictly inside 0..1 range
        const x = relX < 0 ? 0 : relX > 1 ? 1 : relX;
        const y = relY < 0 ? 0 : relY > 1 ? 1 : relY;
        const width = relW < 0 ? 0 : (x + relW > 1 ? 1 - x : relW);
        const height = relH < 0 ? 0 : (y + relH > 1 ? 1 - y : relH);

        normalizedRects.push({ x, y, width, height });
      }

      if (normalizedRects.length === 0) return null;

      const mergedRects = this.mergeAdjacentRects(normalizedRects);

      // Derive bounding position directly from computed coordinates without calling range.getBoundingClientRect()
      const boundingClientX = minLeft !== Infinity && maxRight !== -Infinity 
        ? (minLeft + maxRight) / 2 
        : pageRect.left + pageRect.width / 2;
      const boundingClientY = minTop !== Infinity ? minTop : pageRect.top;
      const boundingClientYBottom = maxBottom !== -Infinity ? maxBottom : (minTop !== Infinity ? minTop + 20 : pageRect.top + 20);

      return {
        pageNumber,
        selectedText,
        rects: mergedRects,
        boundingClientX,
        boundingClientY,
        boundingClientYBottom,
      };
    } catch (err) {
      Logger.error('HighlightEngine', 'Failed to extract normalized selection rects', err);
      return null;
    }
  }

  /**
   * Merges rects on the same line into a single continuous rect.
   */
  mergeAdjacentRects(rects: IHighlightRect[]): IHighlightRect[] {
    if (!rects || rects.length <= 1) return rects || [];

    // Calculate Y-centers for each rect
    const withCenter = rects.map((rect) => ({
      rect,
      yCenter: rect.y + rect.height * 0.5,
    }));

    // Sort by Y-center ascending
    withCenter.sort((a, b) => a.yCenter - b.yCenter);

    // Group rects into lines
    const groups: Array<typeof withCenter> = [];

    for (const item of withCenter) {
      let matchedGroup: typeof withCenter | null = null;
      for (const group of groups) {
        const rep = group[0];
        // Scale-independent line grouping: distance must be within 40% of average line height
        const avgHeight = (item.rect.height + rep.rect.height) * 0.5;
        if (Math.abs(item.yCenter - rep.yCenter) < avgHeight * 0.4) {
          matchedGroup = group;
          break;
        }
      }

      if (matchedGroup) {
        matchedGroup.push(item);
      } else {
        groups.push([item]);
      }
    }

    // Produce a single rectangle for each line group
    const merged: IHighlightRect[] = groups.map((group) => {
      let minX = Infinity;
      let maxXRight = -Infinity;
      let minY = Infinity;
      let maxYBottom = -Infinity;

      for (const item of group) {
        const r = item.rect;
        if (r.x < minX) minX = r.x;
        if (r.x + r.width > maxXRight) maxXRight = r.x + r.width;
        if (r.y < minY) minY = r.y;
        if (r.y + r.height > maxYBottom) maxYBottom = r.y + r.height;
      }

      return {
        x: minX,
        y: minY,
        width: maxXRight - minX,
        height: maxYBottom - minY,
      };
    });

    // Sort the final merged rects primarily by y, then by x
    merged.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 0.01) {
        return yDiff;
      }
      return a.x - b.x;
    });

    return merged;
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
   * Checks if a screen point (clientX, clientY) intersects any highlight fragment's normalized rects on a page element
   */
  findHighlightAtPoint(
    fragments: IHighlightFragment[],
    pageContainerEl: HTMLElement,
    clientX: number,
    clientY: number
  ): IHighlightFragment | null {
    if (!fragments || fragments.length === 0 || !pageContainerEl) return null;

    try {
      const pageRect = pageContainerEl.getBoundingClientRect();
      if (pageRect.width <= 0 || pageRect.height <= 0) return null;

      const relX = (clientX - pageRect.left) / pageRect.width;
      const relY = (clientY - pageRect.top) / pageRect.height;

      // Allow a small padding tolerance (5px) for touch or high-DPI precision
      const tolX = 5 / pageRect.width;
      const tolY = 5 / pageRect.height;

      for (const fragment of fragments) {
        for (const rect of fragment.rects) {
          if (
            relX >= rect.x - tolX &&
            relX <= rect.x + rect.width + tolX &&
            relY >= rect.y - tolY &&
            relY <= rect.y + rect.height + tolY
          ) {
            return fragment;
          }
        }
      }
    } catch (err) {
      Logger.error('HighlightEngine', 'Failed to check point in highlight rects', err);
    }

    return null;
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
