/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PdfEngine } from '../../../core/pdf/PdfService';
import { SAMPLE_PDF_DOCUMENTS } from '../../../data/samplePdfs';

export class MaterialRepository {
  /**
   * Fetches saved progress / last read page for all sample materials
   */
  static async getLastReadPages(): Promise<Record<string, number>> {
    const pageMap: Record<string, number> = {};
    for (const doc of SAMPLE_PDF_DOCUMENTS) {
      try {
        const savedPage = await PdfEngine.getLastReadPage(doc.id);
        pageMap[doc.id] = savedPage;
      } catch {
        pageMap[doc.id] = 1;
      }
    }
    return pageMap;
  }

  /**
   * Fetches saved page for a single material ID
   */
  static async getLastReadPage(materialId: string): Promise<number> {
    try {
      return await PdfEngine.getLastReadPage(materialId);
    } catch {
      return 1;
    }
  }
}
