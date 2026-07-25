/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SAMPLE_PDF_DOCUMENTS, createDemoPdfBuffer } from '../../../data/samplePdfs';
import { IMaterial, IMaterialActiveSession } from '../types/material.types';
import { Logger } from '../../../core/logger/Logger';

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

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const docId = `custom-pdf-${Date.now()}`;
          const session: IMaterialActiveSession = {
            docId,
            title: file.name.replace(/\.pdf$/i, ''),
            buffer: reader.result,
          };
          Logger.info('MaterialService', `Processed uploaded file: ${file.name}`);
          resolve(session);
        } else {
          reject(new Error('Dosya okunamadı.'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
