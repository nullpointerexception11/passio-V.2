import * as pdfjsLib from 'pdfjs-dist';

export interface SearchResultMatch {
  pageNumber: number;
  matchIndex: number;
  textSnippet: string;
  boundingRects?: { x: number; y: number; width: number; height: number }[];
}

export class PdfSearchService {
  /**
   * Search query inside PDF document asynchronously without blocking UI thread.
   */
  static async searchDocument(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    query: string,
    onProgress?: (progress: number) => void
  ): Promise<SearchResultMatch[]> {
    if (!query || query.trim().length === 0 || !pdfDoc) {
      return [];
    }

    const normalizedQuery = query.toLocaleLowerCase('tr-TR').trim();
    const matches: SearchResultMatch[] = [];
    const totalPages = pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let fullPageText = '';
        const itemsWithPos: { text: string; transform: number[] }[] = [];

        for (const item of textContent.items as any[]) {
          if ('str' in item && item.str) {
            fullPageText += item.str + ' ';
            itemsWithPos.push({ text: item.str, transform: item.transform });
          }
        }

        const normalizedPageText = fullPageText.toLocaleLowerCase('tr-TR');
        let searchIndex = normalizedPageText.indexOf(normalizedQuery);
        let pageMatchCount = 0;

        while (searchIndex !== -1 && pageMatchCount < 20) {
          const startSnippet = Math.max(0, searchIndex - 30);
          const endSnippet = Math.min(fullPageText.length, searchIndex + normalizedQuery.length + 30);
          const textSnippet = '...' + fullPageText.substring(startSnippet, endSnippet) + '...';

          matches.push({
            pageNumber: pageNum,
            matchIndex: matches.length,
            textSnippet,
          });

          pageMatchCount++;
          searchIndex = normalizedPageText.indexOf(normalizedQuery, searchIndex + normalizedQuery.length);
        }

        if (onProgress) {
          onProgress(Math.round((pageNum / totalPages) * 100));
        }
      } catch (err) {
        console.warn(`[PdfSearchService] Error searching page ${pageNum}:`, err);
      }
    }

    return matches;
  }
}
