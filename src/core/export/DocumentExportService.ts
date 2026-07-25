import { IReadingNote } from '../notes/ReadingNoteModel';

export type ExportFormat = 'markdown' | 'html' | 'json' | 'txt';

export interface DocumentExportData {
  documentTitle: string;
  docId: string;
  notes: IReadingNote[];
  highlights?: { text: string; pageNumber: number; color?: string; comment?: string }[];
}

export class DocumentExportService {
  /**
   * Export notes and highlights into a formatted string or download payload.
   */
  static generateExportContent(data: DocumentExportData, format: ExportFormat): string {
    const { documentTitle, docId, notes, highlights = [] } = data;
    const nowStr = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    switch (format) {
      case 'markdown': {
        let md = `# ${documentTitle}\n\n`;
        md += `*Passio Okuma Notları ve Vurgular — ${nowStr}*\n\n---\n\n`;

        if (notes.length > 0) {
          md += `## Okuma Notları (${notes.length})\n\n`;
          notes.forEach((note, index) => {
            md += `### ${index + 1}. ${note.title || 'İsimsiz Not'}\n`;
            if (note.tags && note.tags.length > 0) {
              md += `**Etiketler:** ${note.tags.map((t) => `#${t}`).join(' ')}\n\n`;
            }
            md += `${note.content}\n\n`;
            md += `*Oluşturulma: ${new Date(note.createdAt).toLocaleString('tr-TR')}*\n\n---\n\n`;
          });
        }

        if (highlights.length > 0) {
          md += `## Vurgulanan Metinler (${highlights.length})\n\n`;
          highlights.forEach((h, index) => {
            md += `> "${h.text}"\n\n`;
            md += `*Sayfa: ${h.pageNumber}*`;
            if (h.comment) {
              md += ` — **Not:** ${h.comment}`;
            }
            md += `\n\n`;
          });
        }

        return md;
      }

      case 'html': {
        let html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - Passio Notları</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #2d3748; }
    h1 { font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { font-size: 1.4rem; color: #4a5568; margin-top: 30px; }
    .meta { font-size: 0.9rem; color: #718096; margin-bottom: 24px; }
    .note-card { background: #f7fafc; border-left: 4px solid #4a5568; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
    blockquote { background: #fffaf0; border-left: 4px solid #dd6b20; margin: 16px 0; padding: 12px 16px; font-style: italic; }
    .tags { font-size: 0.85rem; color: #319795; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
  <div class="meta">Passio Okuma Notları ve Vurgular — ${nowStr}</div>
`;

        if (notes.length > 0) {
          html += `<h2>Okuma Notları (${notes.length})</h2>`;
          notes.forEach((note) => {
            html += `<div class="note-card">
              <h3>${note.title || 'İsimsiz Not'}</h3>
              <p>${note.content.replace(/\n/g, '<br>')}</p>
              ${note.tags && note.tags.length > 0 ? `<div class="tags">Etiketler: ${note.tags.map((t) => `#${t}`).join(' ')}</div>` : ''}
            </div>`;
          });
        }

        if (highlights.length > 0) {
          html += `<h2>Vurgulanan Metinler (${highlights.length})</h2>`;
          highlights.forEach((h) => {
            html += `<blockquote>"${h.text}"<br><small style="font-style:normal; color:#718096;">Sayfa ${h.pageNumber}${h.comment ? ` — Not: ${h.comment}` : ''}</small></blockquote>`;
          });
        }

        html += `</body></html>`;
        return html;
      }

      case 'json': {
        return JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            documentTitle,
            docId,
            notes,
            highlights,
          },
          null,
          2
        );
      }

      case 'txt':
      default: {
        let txt = `${documentTitle.toUpperCase()}\nPassio Okuma Notları ve Vurgular - ${nowStr}\n\n`;
        txt += `==============================================\n\n`;

        if (notes.length > 0) {
          txt += `OKUMA NOTLARI (${notes.length})\n------------------------\n\n`;
          notes.forEach((note, i) => {
            txt += `[${i + 1}] ${note.title || 'İsimsiz Not'}\n`;
            txt += `${note.content}\n`;
            if (note.tags?.length) txt += `Etiketler: ${note.tags.join(', ')}\n`;
            txt += `\n`;
          });
        }

        if (highlights.length > 0) {
          txt += `VURGULAR (${highlights.length})\n------------------------\n\n`;
          highlights.forEach((h) => {
            txt += `"${h.text}" (Sayfa ${h.pageNumber})\n`;
            if (h.comment) txt += `Not: ${h.comment}\n`;
            txt += `\n`;
          });
        }

        return txt;
      }
    }
  }

  /**
   * Trigger browser download of exported document file.
   */
  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
