/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../../infrastructure/db/connection';
import { Logger } from '../../../core/logger/Logger';
import { HighlightRepository } from '../../../core/highlight/HighlightRepository';
import { ReadingNoteRepository } from '../../../core/notes/ReadingNoteRepository';
import { PdfEngine } from '../../../core/pdf/PdfService';

export type ReadingStatus = 'new' | 'reading' | 'finished';

export interface ICollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface IPdfHoverStats {
  docId: string;
  lastReadPage: number;
  totalPages: number;
  lastOpenedAt?: string;
  status: ReadingStatus;
  highlightCount: number;
  noteCount: number;
  collectionIds: string[];
}

export class LibraryMetadataService {
  /**
   * Fetches all collections
   */
  static async getCollections(): Promise<ICollection[]> {
    try {
      const rows = await db.select<ICollection>('collections');
      return rows;
    } catch (err) {
      Logger.error('LibraryMetadataService', 'Failed to fetch collections', err);
      return [];
    }
  }

  /**
   * Creates a new collection
   */
  static async createCollection(name: string): Promise<ICollection> {
    const id = `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newCol: ICollection = {
      id,
      name: name.trim(),
      created_at: now,
      updated_at: now,
    };
    await db.insert('collections', newCol as unknown as Record<string, unknown>);
    Logger.info('LibraryMetadataService', `Created collection [${name}]`);
    return newCol;
  }

  /**
   * Deletes a collection
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    await db.delete('collections', { id: collectionId });
    await db.delete('document_collections', { collection_id: collectionId });
    Logger.info('LibraryMetadataService', `Deleted collection [${collectionId}]`);
  }

  /**
   * Gets document collection links
   */
  static async getDocumentCollectionMap(): Promise<Record<string, string[]>> {
    try {
      const rows = await db.select<{ document_id: string; collection_id: string }>('document_collections');
      const map: Record<string, string[]> = {};
      for (const row of rows) {
        if (!map[row.document_id]) {
          map[row.document_id] = [];
        }
        if (!map[row.document_id].includes(row.collection_id)) {
          map[row.document_id].push(row.collection_id);
        }
      }
      return map;
    } catch (err) {
      Logger.error('LibraryMetadataService', 'Failed to fetch document collections', err);
      return {};
    }
  }

  /**
   * Toggle a document's inclusion in a collection
   */
  static async toggleDocumentCollection(docId: string, collectionId: string): Promise<boolean> {
    try {
      const existing = await db.select('document_collections', {
        document_id: docId,
        collection_id: collectionId,
      });

      if (existing.length > 0) {
        await db.delete('document_collections', {
          document_id: docId,
          collection_id: collectionId,
        });
        Logger.info('LibraryMetadataService', `Removed doc [${docId}] from collection [${collectionId}]`);
        return false;
      } else {
        await db.insert('document_collections', {
          document_id: docId,
          collection_id: collectionId,
        });
        Logger.info('LibraryMetadataService', `Added doc [${docId}] to collection [${collectionId}]`);
        return true;
      }
    } catch (err) {
      Logger.error('LibraryMetadataService', `Failed to toggle document collection`, err);
      return false;
    }
  }

  /**
   * Reading Status Management
   */
  static getReadingStatus(docId: string, lastReadPage: number, totalPages: number): ReadingStatus {
    const savedStatus = localStorage.getItem(`passio_pdf_status_${docId}`) as ReadingStatus | null;
    if (savedStatus && ['new', 'reading', 'finished'].includes(savedStatus)) {
      return savedStatus;
    }
    if (lastReadPage >= totalPages && totalPages > 0) {
      return 'finished';
    }
    if (lastReadPage > 1) {
      return 'reading';
    }
    return 'new';
  }

  static setReadingStatus(docId: string, status: ReadingStatus): void {
    localStorage.setItem(`passio_pdf_status_${docId}`, status);
    Logger.info('LibraryMetadataService', `Updated reading status for [${docId}] to [${status}]`);
  }

  /**
   * Last Opened Timestamp
   */
  static recordLastOpened(docId: string): void {
    const now = new Date().toISOString();
    localStorage.setItem(`passio_pdf_last_opened_${docId}`, now);
  }

  static getLastOpened(docId: string): string | undefined {
    return localStorage.getItem(`passio_pdf_last_opened_${docId}`) || undefined;
  }

  /**
   * Fetches stats map (highlights & notes counts) across all documents
   */
  static async getAllPdfStats(): Promise<{
    highlightsMap: Record<string, number>;
    notesMap: Record<string, number>;
  }> {
    const allHighlights = await HighlightRepository.getAllHighlights();
    const allNotes = await ReadingNoteRepository.getAllNotes();

    const highlightsMap: Record<string, number> = {};
    const notesMap: Record<string, number> = {};

    for (const h of allHighlights) {
      if (h.materialId) {
        highlightsMap[h.materialId] = (highlightsMap[h.materialId] || 0) + 1;
      }
    }

    for (const n of allNotes) {
      if (n.materialId) {
        notesMap[n.materialId] = (notesMap[n.materialId] || 0) + 1;
      }
    }

    return { highlightsMap, notesMap };
  }
}
