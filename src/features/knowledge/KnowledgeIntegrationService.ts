/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgeSearchService } from './KnowledgeSearchService';
import { CitationBuilder } from './CitationBuilder';
import { ReferenceManager } from './ReferenceManager';
import { PreviewService } from './PreviewService';
import { NavigationService } from './NavigationService';
import { 
  IKnowledgeBridgeItem, 
  IKnowledgeBridgeFilter, 
  IKnowledgeBridgeSearchResult 
} from '../../entities/knowledge/KnowledgeBridgeModel';

class KnowledgeIntegrationDomainService {
  async searchKnowledge(filter: IKnowledgeBridgeFilter = {}): Promise<IKnowledgeBridgeSearchResult> {
    return await KnowledgeSearchService.search(filter);
  }

  buildCitation(item: IKnowledgeBridgeItem): string {
    return CitationBuilder.buildCitation(item);
  }

  getPreview(item: IKnowledgeBridgeItem) {
    return PreviewService.generatePreview(item);
  }

  registerReference(notebookId: string, item: IKnowledgeBridgeItem) {
    return ReferenceManager.addReference(notebookId, item.id, item.materialTitle, item.pageNumber);
  }

  navigateToSource(
    navigateFn: (path: string, options?: { state?: any }) => void,
    materialId: string,
    pageNumber: number
  ) {
    NavigationService.navigateToSource(navigateFn, materialId, pageNumber);
  }
}

export const KnowledgeIntegrationService = new KnowledgeIntegrationDomainService();
export default KnowledgeIntegrationService;
