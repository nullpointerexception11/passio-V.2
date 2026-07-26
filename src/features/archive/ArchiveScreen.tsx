/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Archive, Download, FileText, Search, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { Header } from '../../shared/ui/Header';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_PDF_DOCUMENTS, ISamplePdfDoc } from '../library/samplePdfs';
import { ReadingNoteRepository } from '../../core/notes/ReadingNoteRepository';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';
import { ExportDocumentModal } from '../../components/molecules/ExportDocumentModal';
import { DocumentExportService, ExportFormat } from '../../core/export/DocumentExportService';

export const ArchiveScreen: React.FC = () => {
  const navigate = useNavigate();
  const [allNotes, setAllNotes] = useState<IReadingNote[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExportDoc, setSelectedExportDoc] = useState<{ id: string; title: string; notes: IReadingNote[] } | null>(null);
  const [isExportAllOpen, setIsExportAllOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadNotes() {
      const notes = await ReadingNoteRepository.getAllNotes();
      setAllNotes(notes);
    }
    loadNotes();
  }, []);

  const getNotesForMaterial = (materialId: string): IReadingNote[] => {
    return allNotes.filter((n) => n.materialId === materialId);
  };

  const filteredDocs = SAMPLE_PDF_DOCUMENTS.filter((doc) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.author.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query)
    );
  });

  const handleExportAllNotes = (format: ExportFormat) => {
    const content = DocumentExportService.generateExportContent(
      {
        documentTitle: 'Passio Tüm Okuma Notları Arşivi',
        docId: 'all-archived-notes',
        notes: allNotes,
      },
      format
    );

    const extMap: Record<ExportFormat, { ext: string; mime: string }> = {
      markdown: { ext: 'md', mime: 'text/markdown' },
      html: { ext: 'html', mime: 'text/html' },
      json: { ext: 'json', mime: 'application/json' },
      txt: { ext: 'txt', mime: 'text/plain' },
    };

    const target = extMap[format];
    DocumentExportService.downloadFile(content, `passio_tum_notlar_arsivi.${target.ext}`, target.mime);
    setIsExportAllOpen(false);
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Header title="ARŞİV VE DIŞA AKTARIM" onBack={() => navigate('/')} backLabel="Ana Salon" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 animate-fade-in">
        {/* Banner Section */}
        <section
          className="p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-serif font-medium">Güvenli Arşiv ve Dışa Aktarım Merkezi</h1>
              <p className="text-xs leading-relaxed opacity-70 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
                Tamamlanmış belgeleriniz, mühürlü notlarınız ve okuma vurgularınız yerel diskte şifreli saklanır.
                İstediğiniz zaman Markdown, HTML, JSON veya Düz Metin formatında dışa aktarabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsExportAllOpen(true)}
              className="w-full md:w-auto px-4 py-2 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 border-amber-500/40 text-amber-600 dark:text-amber-400"
              title="Tüm Notları ve Vurguları Toplu Dışa Aktar"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>Tüm Notları Dışa Aktar ({allNotes.length})</span>
            </button>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arşivde belge veya yazar ara..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono opacity-60">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{filteredDocs.length} Arşivlenmiş Belge</span>
          </div>
        </div>

        {/* Archived Documents List */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => {
            const docNotes = getNotesForMaterial(doc.id);
            return (
              <div
                key={doc.id}
                className="p-6 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:border-accent hover:shadow-md group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">
                      {doc.author}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-500" />
                      <span>{docNotes.length} Okuma Notu</span>
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-medium leading-snug group-hover:text-accent transition-colors">
                    {doc.title}
                  </h3>

                  <p className="text-xs leading-relaxed opacity-70 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {doc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-3 mt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-2 text-[11px] font-mono opacity-60">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{doc.pageCount} Sayfa</span>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedExportDoc({
                        id: doc.id,
                        title: doc.title,
                        notes: docNotes,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all hover:bg-amber-500 hover:text-white border-amber-500/30 text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Dışa Aktar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Individual Document Export Modal */}
      {selectedExportDoc && (
        <ExportDocumentModal
          isOpen={!!selectedExportDoc}
          onClose={() => setSelectedExportDoc(null)}
          documentTitle={selectedExportDoc.title}
          docId={selectedExportDoc.id}
          notes={selectedExportDoc.notes}
        />
      )}

      {/* Bulk All Notes Export Modal */}
      {isExportAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all p-6 flex flex-col gap-6"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 font-serif font-medium text-sm">
                <Download className="w-4 h-4 text-amber-500" />
                <span>Tüm Arşiv Notlarını Dışa Aktar</span>
              </div>
              <button
                onClick={() => setIsExportAllOpen(false)}
                className="text-xs font-mono opacity-50 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs opacity-70 leading-relaxed">
              Kütüphane ve okuma oturumlarınızdan derlenen toplam <strong>{allNotes.length}</strong> adet okuma notu ve vurgu dışa aktarılacaktır.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportAllNotes('markdown')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-amber-600 dark:text-amber-400">Markdown (.md)</span>
                <span className="text-[10px] opacity-60">Notion, Obsidian</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('html')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">HTML (.html)</span>
                <span className="text-[10px] opacity-60">Web Tarayıcısı</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('json')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-blue-600 dark:text-blue-400">JSON (.json)</span>
                <span className="text-[10px] opacity-60">Ham Veri</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('txt')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-purple-600 dark:text-purple-400">Düz Metin (.txt)</span>
                <span className="text-[10px] opacity-60">Sade Text</span>
              </button>
            </div>

            <div className="flex justify-end border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                onClick={() => setIsExportAllOpen(false)}
                className="px-4 py-1.5 text-xs font-mono rounded-lg border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveScreen;
