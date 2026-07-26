/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SAMPLE_PDF_DOCUMENTS, createDemoPdfBuffer } from '../../../data/samplePdfs';
import { IMaterial, IMaterialActiveSession } from '../types/material.types';
import { Logger } from '../../../core/logger/Logger';
import { db } from '../../../infrastructure/db/connection';
import { PdfStorageService } from '../../../core/pdf/PdfStorageService';

export class MaterialService {
  /**
   * Gets curated sample materials
   */
  static getSampleMaterials(): IMaterial[] {
    return SAMPLE_PDF_DOCUMENTS.map((doc) => ({
      id: doc.id,
      title: doc.title,
      author: doc.author,
      description: doc.description,
      type: 'pdf',
      pageCount: doc.pageCount,
      fileSize: doc.fileSize,
      content: doc.content,
      isCustom: false,
    }));
  }

  /**
   * Prepares active reading session for a sample or known material
   */
  static async prepareSampleSession(
    materialId: string,
    targetPage?: number
  ): Promise<IMaterialActiveSession> {
    Logger.info('MaterialService', `Preparing session for material [${materialId}]`);
    const matchedSample = SAMPLE_PDF_DOCUMENTS.find((doc) => doc.id === materialId);
    const title = matchedSample ? matchedSample.title : 'Belge';
    const content = matchedSample?.content || ['Varsayılan içerik'];

    const buffer = await createDemoPdfBuffer(
      title,
      content,
      materialId === 'dostoyevski-notes-from-underground' ? 40 : 3
    );

    return {
      docId: materialId,
      title,
      buffer,
      targetPage,
    };
  }

  /**
   * Converts a user uploaded File into an active material session
   */
  static async processUploadedFile(file: File): Promise<IMaterialActiveSession> {
    if (file.type !== 'application/pdf') {
      throw new Error('Lütfen geçerli bir PDF (.pdf) dosyası seçin.');
    }

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Dosya boyutu çok büyük. Lütfen 200MB\'tan küçük bir PDF dosyası seçin.');
    }

    const docId = `custom-pdf-${crypto.randomUUID()}`;
    const buffer = await file.arrayBuffer();
    const filePath = await PdfStorageService.savePdfFile(docId, buffer);
    
    await db.insert('documents', {
      id: docId,
      title: file.name.replace(/\.pdf$/i, ''),
      file_path: filePath,
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      docId,
      title: file.name.replace(/\.pdf$/i, ''),
      buffer,
    };
  }
}
