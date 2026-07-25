/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, FileUp, Sparkles, Clock, HardDrive, Eye, ArrowLeft, Sun, Moon, GitBranch } from 'lucide-react';
import { SAMPLE_PDF_DOCUMENTS, ISamplePdfDoc, createDemoPdfBuffer } from './samplePdfs';
import { PdfReaderScreen } from '../pdf-reader/PdfReaderScreen';
import { PdfEngine } from '../../core/pdf/PdfService';
import { Logger } from '../../infrastructure/logger/Logger';
import { useTheme } from '../theme/ThemeContext';
import { KnowledgeBridgeModal } from '../knowledge/KnowledgeBridgeModal';
import { IKnowledgeBridgeItem } from '../../entities/knowledge/KnowledgeBridgeModel';

export interface IPdfActiveSession {
  docId: string;
  title: string;
  buffer: ArrayBuffer;
  targetPage?: number;
}

export const LibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeType, toggleTheme } = useTheme();
  const [activePdfSession, setActivePdfSession] = useState<IPdfActiveSession | null>(null);
  const [lastReadPages, setLastReadPages] = useState<Record<string, number>>({});
  const [customPdfs, setCustomPdfs] = useState<IPdfActiveSession[]>([]);
  const [showKnowledgeBridge, setShowKnowledgeBridge] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const state = location.state as { materialId?: string; pageNumber?: number } | undefined;
    if (state?.materialId) {
      const materialId = state.materialId;
      const targetPage = state.pageNumber || 1;

      async function launchTargetFromNavigation() {
        Logger.info('LibraryScreen', `Auto-launching target PDF [${materialId}] page [${targetPage}] from navigation`);
        const matchedSample = SAMPLE_PDF_DOCUMENTS.find(doc => doc.id === materialId);
        const title = matchedSample ? matchedSample.title : 'Belge';
        const content = matchedSample?.content || ['Varsayılan içerik'];

        const buffer = await createDemoPdfBuffer(
          title,
          content,
          materialId === 'dostoyevski-notes-from-underground' ? 40 : 3
        );

        setActivePdfSession({
          docId: materialId,
          title,
          buffer,
          targetPage,
        });

        window.history.replaceState({}, document.title);
      }

      launchTargetFromNavigation();
    }
  }, [location.state]);

  useEffect(() => {
    async function loadSavedPages() {
      const pageMap: Record<string, number> = {};
      for (const doc of SAMPLE_PDF_DOCUMENTS) {
        const savedPage = await PdfEngine.getLastReadPage(doc.id);
        pageMap[doc.id] = savedPage;
      }
      setLastReadPages(pageMap);
    }
    loadSavedPages();
  }, [activePdfSession]);

  const handleOpenSamplePdf = async (doc: ISamplePdfDoc) => {
    try {
      Logger.info('LibraryScreen', `Preparing sample PDF: ${doc.title}`);
      const buffer = await createDemoPdfBuffer(
        doc.title, 
        doc.content || ['Varsayılan içerik'], 
        doc.id === 'dostoyevski-notes-from-underground' ? 40 : 3
      );
      
      setActivePdfSession({
        docId: doc.id,
        title: doc.title,
        buffer,
      });
    } catch (err) {
      Logger.error('LibraryScreen', 'Error opening sample PDF', err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Lütfen geçerli bir PDF (.pdf) dosyası seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const docId = `custom-pdf-${Date.now()}`;
        const newSession: IPdfActiveSession = {
          docId,
          title: file.name.replace(/\.pdf$/i, ''),
          buffer: reader.result,
        };
        setCustomPdfs((prev) => [newSession, ...prev]);
        setActivePdfSession(newSession);
        Logger.info('LibraryScreen', `Loaded user local PDF file: ${file.name}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectKnowledgeItem = async (item: IKnowledgeBridgeItem) => {
    try {
      Logger.info('LibraryScreen', `Navigating to material [${item.materialId}] at page [${item.pageNumber}] from Knowledge Bridge`);
      
      const matchedSample = SAMPLE_PDF_DOCUMENTS.find(doc => doc.id === item.materialId);
      const docTitle = matchedSample ? matchedSample.title : item.materialTitle;
      const content = matchedSample?.content || ['Varsayılan içerik'];

      const buffer = await createDemoPdfBuffer(
        docTitle, 
        content, 
        item.materialId === 'dostoyevski-notes-from-underground' ? 40 : 3
      );

      setActivePdfSession({
        docId: item.materialId,
        title: docTitle,
        buffer,
        targetPage: item.pageNumber,
      });
      setShowKnowledgeBridge(false);
    } catch (err) {
      Logger.error('LibraryScreen', 'Error loading material from Knowledge Bridge', err);
    }
  };

  return (
    <div 
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/pdf"
        className="hidden"
      />

      <header 
        className="h-14 px-6 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana Salon</span>
          </button>
          <span className="text-xs font-serif font-medium tracking-widest uppercase opacity-60">
            KÜTÜPHANE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKnowledgeBridge(true)}
            className="px-3 py-1.5 rounded-lg border font-mono text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 border-amber-500/30 text-amber-600 dark:text-amber-400"
            title="Bilgi Köprüsünü Aç"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-500" />
            <span>Bilgi Köprüsü</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg border font-mono text-xs font-medium flex items-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            <FileUp className="w-3.5 h-3.5 text-accent" />
            <span>PDF Yükle</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {themeType === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8 flex flex-col gap-8 animate-fade-in">
        {customPdfs.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>YÜKLENEN YEREL PDF BELGELERİ ({customPdfs.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customPdfs.map((pdf) => (
                <div
                  key={pdf.docId}
                  onClick={() => setActivePdfSession(pdf)}
                  className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-accent hover:shadow-md group"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-serif font-medium text-sm truncate group-hover:text-accent transition-colors">
                        {pdf.title}
                      </span>
                      <span className="text-[10px] font-mono opacity-50">Yerel Cihaz Dosyası • PDF</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded border text-xs font-mono flex items-center gap-1.5 opacity-80 group-hover:opacity-100 group-hover:bg-accent group-hover:text-white transition-all">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Oku</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-accent flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KÜTÜPHANE KOLEKSİYONU</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_PDF_DOCUMENTS.map((doc) => {
              const savedPage = lastReadPages[doc.id] || 1;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleOpenSamplePdf(doc)}
                  className="p-6 rounded-2xl border flex flex-col justify-between gap-4 cursor-pointer transition-all hover:border-accent hover:shadow-lg group relative overflow-hidden"
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
                      {savedPage > 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Kaldığı Sayfa: {savedPage}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-serif font-medium leading-snug group-hover:text-accent transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-xs leading-relaxed opacity-70 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {doc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 mt-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <div className="flex items-center gap-3 text-[11px] font-mono opacity-60">
                      <span>{doc.pageCount} Sayfa</span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>PDF Okuyucuda Aç</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <KnowledgeBridgeModal
        isOpen={showKnowledgeBridge}
        onClose={() => setShowKnowledgeBridge(false)}
        onSelectItem={handleSelectKnowledgeItem}
      />

      {activePdfSession && (
        <PdfReaderScreen
          docId={activePdfSession.docId}
          docTitle={activePdfSession.title}
          sourceUrlOrBuffer={activePdfSession.buffer}
          initialPage={activePdfSession.targetPage}
          onClose={() => setActivePdfSession(null)}
        />
      )}
    </div>
  );
};

export default LibraryScreen;
