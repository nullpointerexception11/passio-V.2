/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Logger } from '../logger/Logger';
import { db } from '../../db/connection';

// Configure PDF.js Worker for browser sandbox & Tauri native environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface IPdfDocumentMeta {
  id: string;
  title: string;
  numPages: number;
  lastPage: number;
  fileSize?: string;
  sourceUrl?: string;
}

export interface IPdfPageRenderOptions {
  pageNumber: number;
  scale: number;
  canvas: HTMLCanvasElement;
}

class PdfService {
  private activeRenderTasks: Map<number, pdfjsLib.RenderTask> = new Map();

  /**
   * Initializes and loads a PDF document from URL or ArrayBuffer
   */
  async loadDocument(urlOrBuffer: string | ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
    try {
      Logger.info('PdfService', 'Loading PDF document resource...');
      let source: Parameters<typeof pdfjsLib.getDocument>[0];
      if (typeof urlOrBuffer === 'string') {
        source = { url: urlOrBuffer };
      } else if (urlOrBuffer instanceof ArrayBuffer) {
        if (urlOrBuffer.byteLength === 0) {
          throw new Error('Provided ArrayBuffer is detached (byteLength is 0).');
        }
        // Copy the ArrayBuffer so PDF.js worker transfer does NOT detach the original buffer
        const bufferCopy = urlOrBuffer.slice(0);
        source = { data: new Uint8Array(bufferCopy) };
      } else if (ArrayBuffer.isView(urlOrBuffer)) {
        const view = urlOrBuffer as ArrayBufferView;
        if (view.buffer.byteLength === 0) {
          throw new Error("Provided TypedArray's buffer is detached.");
        }
        const bufferCopy = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
        source = { data: new Uint8Array(bufferCopy) };
      } else {
        throw new Error('Unsupported source format for PDF loading.');
      }
      const loadingTask = pdfjsLib.getDocument(source);
      const pdfDoc = await loadingTask.promise;
      Logger.info('PdfService', `PDF document loaded successfully. Total Pages: ${pdfDoc.numPages}`);
      return pdfDoc;
    } catch (err) {
      Logger.error('PdfService', 'Failed to load PDF document.', err);
      throw err;
    }
  }

  /**
   * Retrieves the stored last read page number for a given document ID from offline storage
   */
  async getLastReadPage(docId: string): Promise<number> {
    try {
      const records = await db.select<{ key: string; value: string }>('settings', {
        key: `pdf_last_page_${docId}`,
      });
      if (records.length > 0) {
        const page = parseInt(records[0].value, 10);
        if (!isNaN(page) && page > 0) {
          Logger.info('PdfService', `Retrieved saved last read page for [${docId}]: Page ${page}`);
          return page;
        }
      }
    } catch (err) {
      Logger.warn('PdfService', `Could not fetch last page for [${docId}]. Defaulting to 1.`, err);
    }
    return 1;
  }

  /**
   * Saves the current read page number for a document ID to local SQLite / settings store
   */
  async saveLastReadPage(docId: string, pageNumber: number): Promise<void> {
    try {
      const key = `pdf_last_page_${docId}`;
      const now = new Date().toISOString();

      const existing = await db.select('settings', { key });
      if (existing.length > 0) {
        await db.update('settings', { value: pageNumber.toString(), updatedAt: now }, { key });
      } else {
        await db.insert('settings', { key, value: pageNumber.toString(), updatedAt: now });
      }
      Logger.debug('PdfService', `Saved last read page for [${docId}]: Page ${pageNumber}`);
    } catch (err) {
      Logger.warn('PdfService', `Failed to persist page number for [${docId}]`, err);
    }
  }

  /**
   * Renders a specific PDF page onto a canvas with hardware acceleration and cancellation safety
   */
  async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number
  ): Promise<void> {
    // Cancel any existing render task on this page number to prevent canvas race conditions
    if (this.activeRenderTasks.has(pageNumber)) {
      try {
        this.activeRenderTasks.get(pageNumber)?.cancel();
      } catch {
        // Ignore task cancellation error
      }
      this.activeRenderTasks.delete(pageNumber);
    }

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Match canvas dimensions to high-DPI device pixel ratio for razor-sharp typography
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.scale(dpr, dpr);

      const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
      };

      const renderTask = page.render(renderContext);
      this.activeRenderTasks.set(pageNumber, renderTask);

      await renderTask.promise;
      this.activeRenderTasks.delete(pageNumber);
    } catch (err: any) {
      if (err?.name === 'RenderingCancelledException') {
        Logger.debug('PdfService', `Rendering cancelled for page ${pageNumber} due to scroll or zoom change.`);
      } else {
        Logger.error('PdfService', `Error rendering page ${pageNumber}:`, err);
      }
    }
  }

  /**
   * Cleans up any active rendering tasks
   */
  cancelAllRenders() {
    this.activeRenderTasks.forEach((task) => {
      try {
        task.cancel();
      } catch {
        // Ignore
      }
    });
    this.activeRenderTasks.clear();
  }
}

export const PdfEngine = new PdfService();
export default PdfEngine;
