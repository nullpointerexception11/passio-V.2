import * as pdfjsLib from 'pdfjs-dist';

export interface TocItem {
  title: string;
  pageNumber?: number;
  dest?: any;
  items?: TocItem[];
}

export class PdfOutlineService {
  /**
   * Extract outline/table of contents tree from a loaded PDF document.
   */
  static async getOutline(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<TocItem[]> {
    if (!pdfDoc) return [];

    try {
      const outline = await pdfDoc.getOutline();
      if (!outline || outline.length === 0) return [];

      return await this.parseOutlineItems(pdfDoc, outline);
    } catch (err) {
      console.warn('[PdfOutlineService] Could not extract PDF outline:', err);
      return [];
    }
  }

  private static async parseOutlineItems(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    items: any[]
  ): Promise<TocItem[]> {
    const result: TocItem[] = [];

    for (const item of items) {
      let pageNumber: number | undefined;

      try {
        if (item.dest) {
          let dest = item.dest;
          if (typeof dest === 'string') {
            dest = await pdfDoc.getDestination(dest);
          }
          if (Array.isArray(dest) && dest.length > 0) {
            const pageRef = dest[0];
            if (typeof pageRef === 'object' && pageRef !== null) {
              const pageIndex = await pdfDoc.getPageIndex(pageRef);
              pageNumber = pageIndex + 1;
            } else if (typeof pageRef === 'number') {
              pageNumber = pageRef + 1;
            }
          }
        }
      } catch (e) {
        // Fallback or ignore unresolvable destination
      }

      const parsedChildren = item.items && item.items.length > 0
        ? await this.parseOutlineItems(pdfDoc, item.items)
        : [];

      result.push({
        title: item.title || 'Untitled',
        pageNumber,
        dest: item.dest,
        items: parsedChildren.length > 0 ? parsedChildren : undefined,
      });
    }

    return result;
  }
}
