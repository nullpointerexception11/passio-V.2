/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HighlightRepository } from '../../core/highlight/HighlightRepository';
import { ReadingNoteRepository } from '../notes/ReadingNoteRepository';
import { SAMPLE_PDF_DOCUMENTS } from '../../data/samplePdfs';
import { Logger } from '../../infrastructure/logger/Logger';
import { IKnowledgeBridgeItem } from '../../entities/knowledge/KnowledgeBridgeModel';

class KnowledgeBridgeRepositoryService {
  private resolveMaterialMetadata(materialId: string): { materialTitle: string; author: string } {
    const matchedSample = SAMPLE_PDF_DOCUMENTS.find(doc => doc.id === materialId);
    if (matchedSample) {
      return {
        materialTitle: matchedSample.title,
        author: matchedSample.author,
      };
    }

    if (materialId.startsWith('custom-pdf-')) {
      const cachedTitle = localStorage.getItem(`passio_pdf_title_${materialId}`);
      return {
        materialTitle: cachedTitle || 'Yerel Yüklenen PDF',
        author: 'Kişisel Kitaplık',
      };
    }

    return {
      materialTitle: materialId || 'Bilinmeyen Materyal',
      author: 'Anonim',
    };
  }

  async getAllKnowledgeItems(): Promise<IKnowledgeBridgeItem[]> {
    try {
      Logger.debug('KnowledgeBridgeRepository', 'Aggregating all highlights and notes');

      const [highlights, notes] = await Promise.all([
        HighlightRepository.getAllHighlights(),
        ReadingNoteRepository.getAllNotes(),
      ]);

      const mappedHighlights: IKnowledgeBridgeItem[] = highlights.map(h => {
        const meta = this.resolveMaterialMetadata(h.materialId);
        return {
          id: h.id,
          type: 'highlight',
          materialId: h.materialId,
          materialTitle: meta.materialTitle,
          author: meta.author,
          pageNumber: h.pageNumber || 1,
          tags: ['vurgu'],
          preview: h.selectedText,
          color: h.color,
          createdAt: h.createdAt,
        };
      });

      const mappedNotes: IKnowledgeBridgeItem[] = notes.map(n => {
        const meta = this.resolveMaterialMetadata(n.materialId);
        return {
          id: n.id,
          type: 'note',
          materialId: n.materialId,
          materialTitle: meta.materialTitle,
          author: meta.author,
          pageNumber: 1,
          tags: n.tags && n.tags.length > 0 ? n.tags : ['not'],
          title: n.title,
          preview: n.content,
          createdAt: n.createdAt,
        };
      });

      const combined = [...mappedHighlights, ...mappedNotes];
      return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      Logger.error('KnowledgeBridgeRepository', 'Failed to fetch knowledge bridge items', err);
      return [];
    }
  }
}

export const KnowledgeBridgeRepository = new KnowledgeBridgeRepositoryService();
export default KnowledgeBridgeRepository;
