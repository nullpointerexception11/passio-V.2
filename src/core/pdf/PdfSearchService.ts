/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Logger } from '../logger/Logger';

export interface IHighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPdfSearchMatch {
  id: string;
  pageNumber: number;
  matchIndex: number; // Global index across document (0..N-1)
  pageMatchIndex: number; // Match index on this specific page (0..M-1)
  textSnippet: string;
  matchedText: string;
  rects: IHighlightRect[];
}

export interface IPdfTextItemIndex {
  str: string;
  normalizedRect: IHighlightRect;
  charOffsetInPage: number;
}

export interface IPdfPageIndex {
  pageNumber: number;
  fullText: string;
  items: IPdfTextItemIndex[];
  viewportWidth: number;
  viewportHeight: number;
}

class PdfSearchService {
  private documentIndexMap = new WeakMap<pdfjsLib.PDFDocumentProxy, IPdfPageIndex[]>();
  private indexingPromises = new WeakMap<pdfjsLib.PDFDocumentProxy, Promise<IPdfPageIndex[]>>();

  /**
   * Builds or returns an indexed text layer for the PDF document across all pages.
   */
  async indexDocument(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<IPdfPageIndex[]> {
    if (this.documentIndexMap.has(pdfDoc)) {
      return this.documentIndexMap.get(pdfDoc)!;
    }

    if (this.indexingPromises.has(pdfDoc)) {
      return this.indexingPromises.get(pdfDoc)!;
    }

    const indexTask = (async () => {
      Logger.info('PdfSearchService', `Indexing document text layer (${pdfDoc.numPages} pages)...`);
      const pageIndexes: IPdfPageIndex[] = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          const textContent = await page.getTextContent();

          let pageTextAccumulator = '';
          const itemsIndex: IPdfTextItemIndex[] = [];

          for (let i = 0; i < textContent.items.length; i++) {
            const item: any = textContent.items[i];
            if (!item.str || item.str.length === 0) continue;

            const tx = item.transform[4];
            const ty = item.transform[5];
            const fontH = Math.abs(item.transform[3]) || 12;
            const fontW = item.width || (item.str.length * fontH * 0.5);

            const p1 = viewport.convertToViewportPoint(tx, ty);
            const p2 = viewport.convertToViewportPoint(tx + fontW, ty + fontH);

            const pxLeft = Math.min(p1[0], p2[0]);
            const pxTop = Math.min(p1[1], p2[1]);
            const pxW = Math.abs(p1[0] - p2[0]);
            const pxH = Math.abs(p1[1] - p2[1]);

            const x = Math.max(0, Math.min(1, pxLeft / viewport.width));
            const y = Math.max(0, Math.min(1, pxTop / viewport.height));
            const width = Math.max(0, Math.min(1 - x, pxW / viewport.width));
            const height = Math.max(0, Math.min(1 - y, pxH / viewport.height));

            const charOffset = pageTextAccumulator.length;
            pageTextAccumulator += item.str + ' ';

            itemsIndex.push({
              str: item.str,
              normalizedRect: { x, y, width, height },
              charOffsetInPage: charOffset,
            });
          }

          pageIndexes.push({
            pageNumber: pageNum,
            fullText: pageTextAccumulator,
            items: itemsIndex,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
          });
        } catch (err) {
          Logger.error('PdfSearchService', `Failed to index page ${pageNum}`, err);
        }
      }

      this.documentIndexMap.set(pdfDoc, pageIndexes);
      Logger.info('PdfSearchService', `Successfully indexed ${pageIndexes.length} pages.`);
      return pageIndexes;
    })();

    this.indexingPromises.set(pdfDoc, indexTask);
    return indexTask;
  }

  /**
   * Synchronously or asynchronously performs keyword search over the document index.
   */
  async search(pdfDoc: pdfjsLib.PDFDocumentProxy, query: string): Promise<IPdfSearchMatch[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const indexes = await this.indexDocument(pdfDoc);
    const matches: IPdfSearchMatch[] = [];
    const lowerQuery = trimmed.toLowerCase();

    let globalMatchCount = 0;

    for (const pageIdx of indexes) {
      let pageMatchCount = 0;

      for (const item of pageIdx.items) {
        const lowerStr = item.str.toLowerCase();
        let startIdx = 0;

        while ((startIdx = lowerStr.indexOf(lowerQuery, startIdx)) !== -1) {
          const strLen = item.str.length || 1;
          const startRatio = startIdx / strLen;
          const matchRatio = lowerQuery.length / strLen;

          const subX = item.normalizedRect.x + item.normalizedRect.width * startRatio;
          const subW = Math.max(0.002, item.normalizedRect.width * matchRatio);

          const subRect: IHighlightRect = {
            x: Math.max(0, Math.min(1, subX)),
            y: item.normalizedRect.y,
            width: Math.max(0.001, Math.min(1 - subX, subW)),
            height: item.normalizedRect.height,
          };

          // Generate snippet around match
          const itemPos = item.charOffsetInPage + startIdx;
          const snippetStart = Math.max(0, itemPos - 25);
          const snippetEnd = Math.min(pageIdx.fullText.length, itemPos + lowerQuery.length + 35);
          const prefix = snippetStart > 0 ? '...' : '';
          const suffix = snippetEnd < pageIdx.fullText.length ? '...' : '';
          const snippet = prefix + pageIdx.fullText.substring(snippetStart, snippetEnd).trim() + suffix;

          matches.push({
            id: `search-match-p${pageIdx.pageNumber}-${globalMatchCount}`,
            pageNumber: pageIdx.pageNumber,
            matchIndex: globalMatchCount,
            pageMatchIndex: pageMatchCount,
            textSnippet: snippet,
            matchedText: item.str.substring(startIdx, startIdx + lowerQuery.length),
            rects: [subRect],
          });

          globalMatchCount++;
          pageMatchCount++;
          startIdx += lowerQuery.length;
        }
      }
    }

    return matches;
  }
}

export const PdfSearchEngine = new PdfSearchService();
export default PdfSearchEngine;
