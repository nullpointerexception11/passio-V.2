/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeBridgeItem, KnowledgeBridgeType } from '../../entities/knowledge/KnowledgeBridgeModel';

export interface IKnowledgePreviewData {
  id: string;
  type: KnowledgeBridgeType;
  typeLabel: string;
  title: string;
  content: string;
  materialTitle: string;
  author: string;
  pageNumber: number;
  tags: string[];
  createdAtFormatted: string;
}

export class PreviewService {
  public static generatePreview(item: IKnowledgeBridgeItem): IKnowledgePreviewData {
    const isHighlight = item.type === 'highlight' || item.type === 'annotation';
    let typeLabel = 'Bilgi Parçası';
    if (item.type === 'highlight') typeLabel = 'Vurgu';
    else if (item.type === 'note') typeLabel = 'Okuma Notu';
    else if (item.type === 'annotation') typeLabel = 'Alıntı';
    else if (item.type === 'insight') typeLabel = 'Düşünce';
    
    let formattedDate = '';
    try {
      formattedDate = new Date(item.createdAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      formattedDate = item.createdAt;
    }

    return {
      id: item.id,
      type: item.type,
      typeLabel,
      title: item.title || (isHighlight ? `Alıntı (Sayfa ${item.pageNumber})` : 'Okuma Notu'),
      content: item.preview,
      materialTitle: item.materialTitle,
      author: item.author,
      pageNumber: item.pageNumber,
      tags: item.tags || [],
      createdAtFormatted: formattedDate,
    };
  }
}

export default PreviewService;
