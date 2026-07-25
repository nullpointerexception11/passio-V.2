/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeBridgeItem } from '../../entities/knowledge/KnowledgeBridgeModel';

export interface ICitationOptions {
  includeAuthor?: boolean;
  pagePrefix?: string;
}

export class CitationBuilder {
  public static buildCitation(
    item: IKnowledgeBridgeItem, 
    options: ICitationOptions = {}
  ): string {
    const quoteText = item.preview ? item.preview.trim() : '';
    const pageLabel = options.pagePrefix || 'Sayfa';
    
    let sourceLine = `${item.materialTitle}, ${pageLabel} ${item.pageNumber}`;
    if (options.includeAuthor && item.author && item.author !== 'Anonim') {
      sourceLine = `${item.author} — ${sourceLine}`;
    }

    return `> ${quoteText}\n\n— ${sourceLine}`;
  }
}

export default CitationBuilder;
