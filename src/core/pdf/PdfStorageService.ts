/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mkdir, writeFile, readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { isTauriEnvironment } from '../../infrastructure/db/connection';
import { Logger } from '../logger/Logger';

export class PdfStorageService {
  /**
   * Saves a PDF file buffer to persistent storage (Tauri AppData or IndexedDB fallback).
   * Returns the relative file path or reference string.
   */
  static async savePdfFile(docId: string, buffer: ArrayBuffer): Promise<string> {
    const relativePath = `PdfFiles/${docId}.pdf`;

    if (isTauriEnvironment()) {
      try {
        await mkdir('PdfFiles', { baseDir: BaseDirectory.AppData, recursive: true });
        const uint8 = new Uint8Array(buffer);
        await writeFile(relativePath, uint8, { baseDir: BaseDirectory.AppData });
        Logger.info('PdfStorageService', `Saved PDF file to Tauri AppData: ${relativePath}`);
        return relativePath;
      } catch (err) {
        Logger.error('PdfStorageService', `Failed to save PDF with Tauri fs API (${relativePath}), falling back`, err);
      }
    }

    // Browser Preview Fallback (IndexedDB)
    await this.saveToIndexedDB(docId, buffer);
    Logger.info('PdfStorageService', `Saved PDF file to Browser IndexedDB [${docId}]`);
    return `indexeddb://${docId}`;
  }

  /**
   * Reads a PDF file buffer from persistent storage using the saved file_path.
   */
  static async readPdfFile(filePath: string, docId?: string): Promise<ArrayBuffer> {
    if (isTauriEnvironment() && !filePath.startsWith('indexeddb://')) {
      try {
        const cleanPath = filePath.startsWith('PdfFiles/') ? filePath : `PdfFiles/${docId || filePath}.pdf`;
        const uint8 = await readFile(cleanPath, { baseDir: BaseDirectory.AppData });
        Logger.info('PdfStorageService', `Successfully read PDF from Tauri AppData: ${cleanPath}`);
        return uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
      } catch (err) {
        Logger.error('PdfStorageService', `Failed to read PDF file from Tauri AppData (${filePath})`, err);
      }
    }

    // Fallback read from IndexedDB
    const effectiveDocId = docId || filePath.replace('indexeddb://', '');
    const buffer = await this.readFromIndexedDB(effectiveDocId);
    if (buffer) {
      return buffer;
    }

    throw new Error(`PDF belge dosyası bulunamadı: ${filePath}`);
  }

  private static openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('passio_pdf_storage', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private static async saveToIndexedDB(docId: string, buffer: ArrayBuffer): Promise<void> {
    try {
      const db = await this.openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readwrite');
        tx.objectStore('pdfs').put(buffer, docId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      Logger.error('PdfStorageService', 'IndexedDB save failed', e);
    }
  }

  private static async readFromIndexedDB(docId: string): Promise<ArrayBuffer | null> {
    try {
      const db = await this.openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pdfs', 'readonly');
        const req = tx.objectStore('pdfs').get(docId);
        req.onsuccess = () => resolve((req.result as ArrayBuffer) || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      Logger.error('PdfStorageService', 'IndexedDB read failed', e);
      return null;
    }
  }
}
