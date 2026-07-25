/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotebookService } from '../../../core/notebooks/NotebookService';
import { KnowledgeIntegrationService } from '../../../core/knowledge/KnowledgeIntegrationService';
import { CitationBuilder } from '../../knowledge/CitationBuilder';
import { ReferenceManager, INotebookReference } from '../../knowledge/ReferenceManager';
import { IKnowledgeBridgeItem } from '../../../entities/knowledge/KnowledgeBridgeModel';
import { Logger } from '../../../infrastructure/logger/Logger';

export class WritingService {
  /**
   * Builds formatted quote text from a knowledge item and registers its reference in the notebook.
   */
  static insertKnowledgeReference(
    notebookId: string,
    item: IKnowledgeBridgeItem
  ): { formattedCitation: string; reference: INotebookReference } {
    const formattedCitation = CitationBuilder.buildCitation(item, {
      includeAuthor: true,
      pagePrefix: 'Sayfa',
    });

    const reference = ReferenceManager.addReference(
      notebookId,
      item.id,
      item.materialTitle,
      item.pageNumber
    );

    Logger.info('WritingService', `Inserted reference from [${item.materialTitle}] into notebook [${notebookId}]`);

    return { formattedCitation, reference };
  }

  /**
   * Gets all registered references for a notebook.
   */
  static getNotebookReferences(notebookId: string): INotebookReference[] {
    return ReferenceManager.getReferencesForNotebook(notebookId);
  }

  /**
   * Auto-saves notebook content.
   */
  static async autoSaveContent(notebookId: string, newText: string) {
    return await NotebookService.updateContent(notebookId, newText);
  }

  /**
   * Helper to count words and calculate estimated reading time.
   */
  static calculateTextStats(text: string) {
    const wordCount = NotebookService.countWords(text);
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    return { wordCount, readingTimeMinutes };
  }
}
