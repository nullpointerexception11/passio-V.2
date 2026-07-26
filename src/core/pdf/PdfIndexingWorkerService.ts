import * as pdfjsLib from 'pdfjs-dist';
import { PdfEngine } from './PdfService';

export type IndexingStatus = 'idle' | 'indexing' | 'ready' | 'error';

export interface IndexingProgress {
  status: IndexingStatus;
  progressPercent: number;
  indexedPages: number;
  totalPages: number;
}

type ProgressCallback = (progress: IndexingProgress) => void;

export class PdfIndexingWorkerService {
  private static statusMap = new Map<string, IndexingProgress>();
  private static listenersMap = new Map<string, Set<ProgressCallback>>();

  static getStatus(docId: string): IndexingProgress {
    return (
      this.statusMap.get(docId) || {
        status: 'idle',
        progressPercent: 0,
        indexedPages: 0,
        totalPages: 0,
      }
    );
  }

  static subscribe(docId: string, callback: ProgressCallback): () => void {
    if (!this.listenersMap.has(docId)) {
      this.listenersMap.set(docId, new Set());
    }
    const set = this.listenersMap.get(docId)!;
    set.add(callback);

    // Call with current status immediately
    callback(this.getStatus(docId));

    return () => {
      set.delete(callback);
    };
  }

  private static notify(docId: string, progress: IndexingProgress) {
    this.statusMap.set(docId, progress);
    const set = this.listenersMap.get(docId);
    if (set) {
      set.forEach((cb) => cb(progress));
    }
  }

  static async indexDocument(docId: string, pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<void> {
    if (!pdfDoc) return;

    const current = this.getStatus(docId);
    if (current.status === 'indexing' || current.status === 'ready') return;

    const totalPages = pdfDoc.numPages;
    this.notify(docId, {
      status: 'indexing',
      progressPercent: 0,
      indexedPages: 0,
      totalPages,
    });

    try {
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        await PdfEngine.getCachedTextContent(page); // Warm cache / index page text

        const progressPercent = Math.round((pageNum / totalPages) * 100);
        this.notify(docId, {
          status: pageNum === totalPages ? 'ready' : 'indexing',
          progressPercent,
          indexedPages: pageNum,
          totalPages,
        });

        // Yield execution to unblock UI thread
        if (pageNum % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    } catch (err) {
      console.warn('[PdfIndexingWorkerService] Error indexing document:', err);
      this.notify(docId, {
        status: 'error',
        progressPercent: 0,
        indexedPages: 0,
        totalPages,
      });
    }
  }
}
