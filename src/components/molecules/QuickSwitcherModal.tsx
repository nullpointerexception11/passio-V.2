/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Layers, 
  Bookmark, 
  X,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../infrastructure/db/connection';
import { SAMPLE_PDF_DOCUMENTS } from '../../data/samplePdfs';
import { NotebookRepository } from '../../core/notebooks/NotebookRepository';
import { ReadingNoteRepository } from '../../core/notes/ReadingNoteRepository';
import { LibraryMetadataService } from '../../features/library/services/libraryMetadataService';
import { BookmarkService } from '../../core/bookmark/BookmarkService';

export interface QuickSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuickSwitcherItemType = 'pdf' | 'note' | 'collection' | 'bookmark';

interface IQuickSwitcherItem {
  id: string;
  type: QuickSwitcherItemType;
  title: string;
  subtitle?: string;
  snippet?: string;
  materialId?: string;
  pageNumber?: number;
  notebookId?: string;
  date?: string;
}

export const QuickSwitcherModal: React.FC<QuickSwitcherModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>('');
  const [items, setItems] = useState<IQuickSwitcherItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IQuickSwitcherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  /**
   * Turkish normalization for accurate search matching
   */
  const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/Ğ/g, 'g')
      .replace(/Ü/g, 'ü')
      .replace(/Ş/g, 'ş')
      .replace(/Ö/g, 'ö')
      .replace(/Ç/g, 'ç')
      .toLowerCase()
      .trim();
  };

  // Load all search targets from repositories & database
  const loadSwitcherData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allItems: IQuickSwitcherItem[] = [];

      // 1. Load PDFs
      // 1a. Samples
      for (const pdf of SAMPLE_PDF_DOCUMENTS) {
        allItems.push({
          id: pdf.id,
          type: 'pdf',
          title: pdf.title,
          subtitle: `${pdf.author || 'Bilinmeyen Yazar'} • ${pdf.pageCount} Sayfa`,
          materialId: pdf.id,
          pageNumber: 1,
        });
      }

      // 1b. Custom PDFs from db
      try {
        const customDocs = await db.select<any>('documents');
        if (customDocs && customDocs.length > 0) {
          for (const doc of customDocs) {
            allItems.push({
              id: doc.id,
              type: 'pdf',
              title: doc.title || 'İsimsiz Belge',
              subtitle: 'Yüklenen PDF Belgesi',
              materialId: doc.id,
              pageNumber: 1,
            });
          }
        }
      } catch (err) {
        console.error('QuickSwitcher: Failed to load custom documents', err);
      }

      // Map document IDs to titles for quick subtitle referencing
      const docTitles: Record<string, string> = {};
      for (const item of allItems) {
        if (item.type === 'pdf' && item.materialId) {
          docTitles[item.materialId] = item.title;
        }
      }

      // 2. Load Notes (Notebooks and Reading Notes)
      // 2a. Notebooks
      try {
        const notebooks = await NotebookRepository.getAllNotebooks();
        for (const nb of notebooks) {
          allItems.push({
            id: nb.metadata.id,
            type: 'note',
            title: nb.metadata.title || 'İsimsiz Defter',
            subtitle: `Defter • ${nb.metadata.wordCount} Kelime`,
            notebookId: nb.metadata.id,
            date: nb.metadata.updatedAt,
            snippet: nb.content.text ? nb.content.text.substring(0, 80) : undefined,
          });
        }
      } catch (err) {
        console.error('QuickSwitcher: Failed to load notebooks', err);
      }

      // 2b. Reading Notes
      try {
        const readingNotes = await ReadingNoteRepository.getAllNotes();
        for (const note of readingNotes) {
          const docTitle = docTitles[note.materialId] || 'Okuma Notu';
          allItems.push({
            id: note.id,
            type: 'note',
            title: note.title || 'İsimsiz Okuma Notu',
            subtitle: `Okuma Notu • ${docTitle}`,
            materialId: note.materialId,
            pageNumber: 1,
            snippet: note.content ? note.content.substring(0, 80) : undefined,
          });
        }
      } catch (err) {
        console.error('QuickSwitcher: Failed to load reading notes', err);
      }

      // 3. Load Collections
      try {
        const cols = await LibraryMetadataService.getCollections();
        for (const col of cols) {
          allItems.push({
            id: col.id,
            type: 'collection',
            title: col.name,
            subtitle: 'Kütüphane Koleksiyonu',
          });
        }
      } catch (err) {
        console.error('QuickSwitcher: Failed to load collections', err);
      }

      // 4. Load Bookmarks
      try {
        const bookmarks = BookmarkService.getAllBookmarks();
        for (const bm of bookmarks) {
          const docTitle = docTitles[bm.materialId] || 'PDF Dokümanı';
          allItems.push({
            id: bm.id,
            type: 'bookmark',
            title: bm.title || `Yer İşareti • Sayfa ${bm.pageNumber}`,
            subtitle: `${docTitle} • Sayfa ${bm.pageNumber}`,
            materialId: bm.materialId,
            pageNumber: bm.pageNumber,
          });
        }
      } catch (err) {
        console.error('QuickSwitcher: Failed to load bookmarks', err);
      }

      setItems(allItems);
      setFilteredItems(allItems);
    } catch (err) {
      console.error('QuickSwitcher: failed to build items', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSwitcherData();
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, loadSwitcherData]);

  // Execute client-side search matching
  useEffect(() => {
    const q = normalizeText(query);
    if (!q) {
      setFilteredItems(items);
      setSelectedIndex(0);
      return;
    }

    const matched = items.filter((item) => {
      const titleMatch = normalizeText(item.title).includes(q);
      const subtitleMatch = item.subtitle && normalizeText(item.subtitle).includes(q);
      const snippetMatch = item.snippet && normalizeText(item.snippet).includes(q);
      return titleMatch || subtitleMatch || snippetMatch;
    });

    setFilteredItems(matched);
    setSelectedIndex(0);
  }, [query, items]);

  // Select Item and Open Instantly
  const handleSelectItem = (item: IQuickSwitcherItem) => {
    onClose();

    if (item.type === 'pdf') {
      navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber || 1 } });
    } else if (item.type === 'note') {
      if (item.notebookId) {
        navigate('/focus', { state: { notebookId: item.notebookId } });
      } else if (item.materialId) {
        navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber || 1 } });
      }
    } else if (item.type === 'collection') {
      navigate('/library', { state: { collectionId: item.id } });
    } else if (item.type === 'bookmark') {
      navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber } });
    }
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Render type icon
  const renderIcon = (type: QuickSwitcherItemType) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'collection':
        return <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getCategoryLabel = (type: QuickSwitcherItemType) => {
    switch (type) {
      case 'pdf':
        return 'Belgeler (PDF)';
      case 'note':
        return 'Notlar ve Defterler';
      case 'collection':
        return 'Koleksiyonlar';
      case 'bookmark':
        return 'Yer İşaretleri';
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div 
            className="p-4 border-b flex items-center gap-3 relative shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Search className="w-4.5 h-4.5 opacity-50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="PDF, Not, Koleksiyon veya Yer İşareti ara... (CTRL + P)"
              className="w-full bg-transparent text-sm font-sans font-medium focus:outline-none placeholder:opacity-40"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md opacity-40 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono opacity-50"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <span>ESC</span>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 min-h-[150px]">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50 text-xs font-mono">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>Yükleniyor...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 gap-1.5 font-mono text-xs">
                <Search className="w-6 h-6 stroke-1" />
                <span>Sonuç bulunamadı</span>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                
                // Determine if this is the first item of its category to show group header
                const showHeader = index === 0 || filteredItems[index - 1].type !== item.type;

                return (
                  <React.Fragment key={item.id}>
                    {showHeader && (
                      <div className="px-3 pt-3 pb-1 text-[9px] font-mono font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase">
                        {getCategoryLabel(item.type)}
                      </div>
                    )}
                    
                    <div
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-stone-500/10 border-stone-500/25'
                          : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-2 rounded-xl border bg-stone-500/5 shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          {renderIcon(item.type)}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <h4 className="text-xs font-serif font-semibold truncate leading-normal">
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <span className="text-[10px] font-mono opacity-55 truncate">
                              {item.subtitle}
                            </span>
                          )}
                          {item.snippet && (
                            <p className="text-[10px] font-sans opacity-45 truncate italic mt-0.5">
                              "{item.snippet}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <span className="text-[9px] font-mono opacity-80 text-stone-600 dark:text-stone-300 flex items-center gap-1 bg-stone-500/10 px-2 py-0.5 rounded border border-stone-500/20">
                            Git <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Footer keyboard help */}
          <div 
            className="px-4 py-2 border-t flex items-center justify-between text-[9px] font-mono opacity-50 shrink-0"
            style={{ 
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0,0,0,0.01)'
            }}
          >
            <div className="flex items-center gap-3">
              <span><b>↑↓</b> Seç</span>
              <span><b>↵</b> Git</span>
              <span><b>ESC</b> Kapat</span>
            </div>

            <div className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-stone-400" />
              <span>Hızlı Geçiş (Quick Switcher)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickSwitcherModal;
