/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, BookOpen, Bookmark, Search, Link as LinkIcon } from 'lucide-react';
import { SAMPLE_PDF_DOCUMENTS } from '../../data/samplePdfs';
import { ReadingNoteRepository } from '../../core/notes/ReadingNoteRepository';
import { NotebookService } from '../../core/notebooks/NotebookService';
import { BookmarkService } from '../../core/bookmark/BookmarkService';
import { KnowledgeLinkService } from '../../core/knowledge/KnowledgeLinkService';
import { KnowledgeLinkTargetType } from '../../entities/knowledge/KnowledgeBridgeModel';

interface KnowledgeBridgeLinkModalProps {
  isOpen: boolean;
  highlightId: string;
  highlightText?: string;
  onClose: () => void;
  onLinkAdded?: () => void;
}

interface SelectableItem {
  id: string;
  type: KnowledgeLinkTargetType;
  title: string;
  subtitle: string;
  materialId?: string;
  pageNumber?: number;
}

export const KnowledgeBridgeLinkModal: React.FC<KnowledgeBridgeLinkModalProps> = ({
  isOpen,
  highlightId,
  highlightText,
  onClose,
  onLinkAdded,
}) => {
  const [activeTab, setActiveTab] = useState<KnowledgeLinkTargetType>('note');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notesList, setNotesList] = useState<SelectableItem[]>([]);
  const [pdfsList, setPdfsList] = useState<SelectableItem[]>([]);
  const [bookmarksList, setBookmarksList] = useState<SelectableItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Load Notes
    async function loadNotesData() {
      const allReadingNotes = await ReadingNoteRepository.getAllNotes();
      const allNotebooks = await NotebookService.getNotebooks();

      const mappedNotes: SelectableItem[] = [
        ...allReadingNotes.map((n) => ({
          id: n.id,
          type: 'note' as const,
          title: n.title || 'İsimsiz Not',
          subtitle: n.content ? `${n.content.slice(0, 40)}...` : 'Okuma Notu',
        })),
        ...allNotebooks.map((nb) => ({
          id: nb.metadata.id,
          type: 'note' as const,
          title: nb.metadata.title || 'İsimsiz Defter',
          subtitle: 'Yazıhane Defteri',
        })),
      ];

      setNotesList(mappedNotes);
    }

    // Load PDFs
    function loadPdfsData() {
      const mappedPdfs: SelectableItem[] = SAMPLE_PDF_DOCUMENTS.map((doc) => ({
        id: doc.id,
        type: 'pdf' as const,
        title: doc.title,
        subtitle: `${doc.author} • ${doc.pageCount} Sayfa`,
        materialId: doc.id,
        pageNumber: 1,
      }));
      setPdfsList(mappedPdfs);
    }

    // Load Bookmarks
    function loadBookmarksData() {
      const allBookmarks = BookmarkService.getAllBookmarks();
      const mappedBookmarks: SelectableItem[] = allBookmarks.map((bm) => {
        const matchedDoc = SAMPLE_PDF_DOCUMENTS.find((d) => d.id === bm.materialId);
        const docTitle = matchedDoc ? matchedDoc.title : 'Belge';
        return {
          id: bm.id,
          type: 'bookmark' as const,
          title: `Sayfa ${bm.pageNumber} Yer İmi`,
          subtitle: docTitle,
          materialId: bm.materialId,
          pageNumber: bm.pageNumber,
        };
      });
      setBookmarksList(mappedBookmarks);
    }

    loadNotesData();
    loadPdfsData();
    loadBookmarksData();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItems = (
    activeTab === 'note' ? notesList : activeTab === 'pdf' ? pdfsList : bookmarksList
  ).filter(
    (item) =>
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (item: SelectableItem) => {
    KnowledgeLinkService.addLink({
      highlightId,
      targetType: item.type,
      targetId: item.id,
      targetTitle: item.title,
      targetSubtitle: item.subtitle,
      materialId: item.materialId,
      pageNumber: item.pageNumber,
    });

    if (onLinkAdded) onLinkAdded();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-fade-in"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-semibold">Bağlantı Ekle</h3>
                <p className="text-[11px] font-mono opacity-50">Alıntıya açık ilişki bağlayın</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {highlightText && (
            <div
              className="px-5 py-2.5 bg-black/5 dark:bg-white/5 border-b text-xs font-serif italic truncate opacity-80"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              "{highlightText}"
            </div>
          )}

          {/* 3 Target Tabs */}
          <div className="grid grid-cols-3 gap-1 p-3 border-b shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={() => setActiveTab('note')}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'note'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notlar</span>
            </button>

            <button
              onClick={() => setActiveTab('pdf')}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'pdf'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PDF'ler</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmark')}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'bookmark'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Yer İmleri</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'note'
                    ? 'Not ara...'
                    : activeTab === 'pdf'
                    ? 'PDF ara...'
                    : 'Yer imi ara...'
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg border bg-transparent outline-none"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              />
            </div>
          </div>

          {/* List of Selectable Target Items */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[180px]">
            {currentItems.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono opacity-50 border border-dashed rounded-xl p-4">
                Eşleşen öğe bulunamadı.
              </div>
            ) : (
              currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="p-3 rounded-xl border flex items-center justify-between gap-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group"
                  style={{ borderColor: 'var(--color-border-subtle)' }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-amber-500 shrink-0">
                      {item.type === 'note' && <FileText className="w-3.5 h-3.5" />}
                      {item.type === 'pdf' && <BookOpen className="w-3.5 h-3.5" />}
                      {item.type === 'bookmark' && <Bookmark className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-serif font-medium text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono opacity-50 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    + Bağla
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBridgeLinkModal;
