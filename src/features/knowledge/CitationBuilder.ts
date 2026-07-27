/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeBridgeItem } from '../../entities/knowledge/KnowledgeBridgeModel';

export interface ICitationOptions {
  includeAuthor?: boolean;
  pagePrefix?: string;
  format?: 'markdown' | 'html';
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

    const color = item.color || 'yellow';
    const format = options.format || 'html';

    if (format === 'html') {
      let colorHex = '#eab308';
      let bgHex = 'rgba(234, 179, 8, 0.08)';
      
      switch (color) {
        case 'blue':
          colorHex = '#3b82f6';
          bgHex = 'rgba(59, 130, 246, 0.08)';
          break;
        case 'green':
          colorHex = '#22c55e';
          bgHex = 'rgba(34, 197, 94, 0.08)';
          break;
        case 'red':
          colorHex = '#ef4444';
          bgHex = 'rgba(239, 68, 68, 0.08)';
          break;
        case 'purple':
          colorHex = '#a855f7';
          bgHex = 'rgba(168, 85, 247, 0.08)';
          break;
        case 'orange':
          colorHex = '#f97316';
          bgHex = 'rgba(249, 115, 22, 0.08)';
          break;
      }

      return `<blockquote class="passio-quote-block" data-highlight-color="${color}" data-book="${item.materialTitle}" data-page="${item.pageNumber}" style="border-left: 3px solid ${colorHex}; padding: 12px 16px; margin: 18px 0; background-color: ${bgHex}; border-radius: 0 8px 8px 0; border-top: none; border-right: none; border-bottom: none; font-style: normal; display: block;">
  <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 1.1em; font-style: italic; line-height: 1.6; color: inherit;">"${quoteText}"</p>
  <cite style="font-family: monospace; font-size: 0.75em; opacity: 0.6; display: flex; align-items: center; gap: 6px; font-style: normal; border: none; padding: 0; margin: 0; color: inherit;">
    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${colorHex}; margin-right: 6px; vertical-align: middle;"></span>
    <span>${sourceLine}</span>
  </cite>
</blockquote>`;
    }

    return `> ${quoteText}\n\n— ${sourceLine}`;
  }
}

export default CitationBuilder;
