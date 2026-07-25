import React, { useState } from 'react';
import { X, Download, FileText, Code, Globe, FileCode } from 'lucide-react';
import { IReadingNote } from '../../core/notes/ReadingNoteModel';
import { DocumentExportService, ExportFormat } from '../../core/export/DocumentExportService';

interface ExportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  docId: string;
  notes: IReadingNote[];
}

export const ExportDocumentModal: React.FC<ExportDocumentModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  docId,
  notes,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');

  if (!isOpen) return null;

  const handleExport = () => {
    const content = DocumentExportService.generateExportContent(
      {
        documentTitle,
        docId,
        notes,
      },
      selectedFormat
    );

    const safeTitle = documentTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const extMap: Record<ExportFormat, { ext: string; mime: string }> = {
      markdown: { ext: 'md', mime: 'text/markdown' },
      html: { ext: 'html', mime: 'text/html' },
      json: { ext: 'json', mime: 'application/json' },
      txt: { ext: 'txt', mime: 'text/plain' },
    };

    const target = extMap[selectedFormat];
    DocumentExportService.downloadFile(content, `${safeTitle}_notes.${target.ext}`, target.mime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden transition-all">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 font-medium text-sm">
            <Download className="w-4 h-4 text-stone-500" />
            <span>Notları Dışa Aktar</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            <strong>{documentTitle}</strong> belgesine ait {notes.length} adet not ve okuma verisi dışa aktarılacaktır.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">
              Format Seçin
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFormat('markdown')}
                className={`p-3 rounded-md border text-left text-xs flex items-center gap-2 transition-all ${
                  selectedFormat === 'markdown'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-medium">Markdown (.md)</div>
                  <div className="text-[10px] text-stone-400">Notion, Obsidian uyumlu</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('html')}
                className={`p-3 rounded-md border text-left text-xs flex items-center gap-2 transition-all ${
                  selectedFormat === 'html'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-medium">HTML (.html)</div>
                  <div className="text-[10px] text-stone-400">Tarayıcıda görüntülenebilir</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('json')}
                className={`p-3 rounded-md border text-left text-xs flex items-center gap-2 transition-all ${
                  selectedFormat === 'json'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Code className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-medium">JSON (.json)</div>
                  <div className="text-[10px] text-stone-400">Ham veri formatı</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('txt')}
                className={`p-3 rounded-md border text-left text-xs flex items-center gap-2 transition-all ${
                  selectedFormat === 'txt'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="font-medium">Düz Metin (.txt)</div>
                  <div className="text-[10px] text-stone-400">Sade metin dosyası</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-100/50 dark:bg-stone-800/40 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-900 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>İndir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
