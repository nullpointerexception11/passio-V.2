/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SAMPLE_PDF_DOCUMENTS } from '../../data/samplePdfs';
import { NotebookRepository } from '../notebooks/NotebookRepository';
import { HighlightRepository } from '../highlight/HighlightRepository';
import { ReadingNoteRepository } from '../notes/ReadingNoteRepository';
import { AccessTrackingService } from '../access/AccessTrackingService';
import { Logger } from '../logger/Logger';

export type GlobalSearchResultType =
  | 'pdf'
  | 'notebook_title'
  | 'notebook_content'
  | 'highlight'
  | 'tag'
  | 'recent';

export interface IGlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle?: string;
  snippet?: string;
  materialId?: string;
  pageNumber?: number;
  notebookId?: string;
  tag?: string;
  date?: string;
  accessCount?: number;
}

export interface IGlobalSearchResultGroup {
  category: string;
  type: GlobalSearchResultType;
  items: IGlobalSearchResult[];
}

export class GlobalSearchEngine {
  /**
   * Turkish diacritics normalization for accurate search matching
   */
  public static normalizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'ü')
      .replace(/Ş/g, 'ş')
      .replace(/Ö/g, 'ö')
      .replace(/Ç/g, 'ç')
      .toLocaleLowerCase('tr-TR')
      .trim();
  }

  /**
   * Helper to extract snippet preview surrounding the target query match
   */
  private static extractSnippet(text: string, query: string, maxLen: number = 100): string {
    if (!text) return '';
    const normText = this.normalizeText(text);
    const normQuery = this.normalizeText(query);
    const index = normText.indexOf(normQuery);

    if (index === -1) {
      return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
    }

    const start = Math.max(0, index - 25);
    const end = Math.min(text.length, index + query.length + 60);
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    return snippet;
  }

  /**
   * Main Global Search Entry Point
   */
  public static async search(query: string): Promise<IGlobalSearchResultGroup[]> {
    try {
      const q = this.normalizeText(query);

      const [notebooks, highlights, readingNotes] = await Promise.all([
        NotebookRepository.getAllNotebooks(),
        HighlightRepository.getAllHighlights(),
        ReadingNoteRepository.getAllNotes(),
      ]);

      const frequentlyAccessed = AccessTrackingService.getFrequentlyAccessed(10);
      const docTitleMap: Record<string, string> = {};
      for (const pdf of SAMPLE_PDF_DOCUMENTS) {
        docTitleMap[pdf.id] = pdf.title;
      }

      // If search query is empty, return Recent / Frequently Accessed items
      if (!q) {
        const recentItems: IGlobalSearchResult[] = [];

        // Add top frequently accessed items
        for (const record of frequentlyAccessed) {
          recentItems.push({
            id: record.id,
            type: 'recent',
            title: record.title,
            subtitle: record.subtitle || `${record.count} kez erişildi`,
            materialId: record.type === 'pdf' ? record.id : undefined,
            notebookId: record.type === 'notebook' ? record.id : undefined,
            accessCount: record.count,
          });
        }

        // Add top modified notebooks if not already present
        for (const nb of notebooks.slice(0, 5)) {
          if (!recentItems.some((i) => i.id === nb.metadata.id)) {
            recentItems.push({
              id: nb.metadata.id,
              type: 'recent',
              title: nb.metadata.title,
              subtitle: `Defter • ${nb.metadata.wordCount} Kelime`,
              notebookId: nb.metadata.id,
              date: nb.metadata.updatedAt,
            });
          }
        }

        return [
          {
            category: 'Son Erişilen Dosyalar ve Defterler',
            type: 'recent',
            items: recentItems.slice(0, 8),
          },
        ];
      }

      // Query is non-empty: Search across all categories
      const pdfResults: IGlobalSearchResult[] = [];
      const notebookTitleResults: IGlobalSearchResult[] = [];
      const notebookContentResults: IGlobalSearchResult[] = [];
      const highlightResults: IGlobalSearchResult[] = [];
      const tagResults: IGlobalSearchResult[] = [];
      const tagMap = new Map<string, number>();

      // 1. PDF Search (Titles, Authors, Keywords)
      for (const pdf of SAMPLE_PDF_DOCUMENTS) {
        const normTitle = this.normalizeText(pdf.title);
        const normAuthor = this.normalizeText(pdf.author);

        if (normTitle.includes(q) || normAuthor.includes(q)) {
          pdfResults.push({
            id: pdf.id,
            type: 'pdf',
            title: pdf.title,
            subtitle: `${pdf.author} • ${pdf.pageCount} Sayfa`,
            materialId: pdf.id,
            pageNumber: 1,
          });
        }
      }

      // 2. Notebook Search (Titles, Content, Tags)
      for (const nb of notebooks) {
        const normTitle = this.normalizeText(nb.metadata.title);
        const normContent = this.normalizeText(nb.content.text || '');

        // Title match
        if (normTitle.includes(q)) {
          notebookTitleResults.push({
            id: nb.metadata.id,
            type: 'notebook_title',
            title: nb.metadata.title,
            subtitle: `${nb.metadata.wordCount} Kelime • ${nb.metadata.type}`,
            notebookId: nb.metadata.id,
            date: nb.metadata.updatedAt,
          });
        }

        // Content match (if not already matched by title, or include snippet)
        if (normContent.includes(q)) {
          const snippet = this.extractSnippet(nb.content.text, query);
          notebookContentResults.push({
            id: `nb-content-${nb.metadata.id}`,
            type: 'notebook_content',
            title: nb.metadata.title,
            subtitle: 'Defter İçi Metin Eşleşmesi',
            snippet,
            notebookId: nb.metadata.id,
            date: nb.metadata.updatedAt,
          });
        }

        // Notebook Tags & Type
        const nbTags = nb.metadata.tags || [nb.metadata.type];
        for (const t of nbTags) {
          const normTag = this.normalizeText(t);
          if (normTag.includes(q) || `#${normTag}`.includes(q)) {
            tagMap.set(t, (tagMap.get(t) || 0) + 1);
          }
        }
      }

      // 3. Highlight Search
      for (const hl of highlights) {
        const normText = this.normalizeText(hl.selectedText);

        if (normText.includes(q)) {
          const docTitle = docTitleMap[hl.materialId] || 'PDF Dokümanı';
          highlightResults.push({
            id: hl.id,
            type: 'highlight',
            title: `"${hl.selectedText}"`,
            subtitle: `${docTitle} • Sayfa ${hl.pageNumber}`,
            snippet: `Renk: ${hl.color}`,
            materialId: hl.materialId,
            pageNumber: hl.pageNumber,
            date: hl.updatedAt || hl.createdAt,
          });
        }
      }

      // 4. Reading Note Tags Search
      for (const note of readingNotes) {
        if (note.tags) {
          for (const t of note.tags) {
            const normTag = this.normalizeText(t);
            if (normTag.includes(q) || `#${normTag}`.includes(q)) {
              tagMap.set(t, (tagMap.get(t) || 0) + 1);
            }
          }
        }
      }

      // Transform Tag Map to Tag Results
      for (const [tag, count] of tagMap.entries()) {
        tagResults.push({
          id: `tag-${tag}`,
          type: 'tag',
          title: `#${tag}`,
          subtitle: `${count} eşleşen kayıt ve not`,
          tag,
        });
      }

      // Assemble final grouped results
      const groups: IGlobalSearchResultGroup[] = [];

      if (pdfResults.length > 0) {
        groups.push({
          category: 'PDF Dokümanları',
          type: 'pdf',
          items: pdfResults,
        });
      }

      if (notebookTitleResults.length > 0) {
        groups.push({
          category: 'Defter Başlıkları',
          type: 'notebook_title',
          items: notebookTitleResults,
        });
      }

      if (notebookContentResults.length > 0) {
        groups.push({
          category: 'Defter İçi Metinler',
          type: 'notebook_content',
          items: notebookContentResults,
        });
      }

      if (highlightResults.length > 0) {
        groups.push({
          category: 'Alıntılar ve Vurgular',
          type: 'highlight',
          items: highlightResults,
        });
      }

      if (tagResults.length > 0) {
        groups.push({
          category: 'Etiketler',
          type: 'tag',
          items: tagResults,
        });
      }

      return groups;
    } catch (err) {
      Logger.error('GlobalSearchEngine', 'Error during global search execution', err);
      return [];
    }
  }
}

export default GlobalSearchEngine;
