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
  Highlighter, 
  Tag, 
  Clock, 
  ArrowRight, 
  X,
  Command,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  GlobalSearchEngine, 
  IGlobalSearchResultGroup, 
  IGlobalSearchResult,
  GlobalSearchResultType 
} from '../../core/search/GlobalSearchEngine';
import { AccessTrackingService } from '../../core/access/AccessTrackingService';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>('');
  const [groups, setGroups] = useState<IGlobalSearchResultGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Flattened results list for arrow key navigation
  const flatResults = groups.flatMap((g) => g.items);

  // Execute Search
  const executeSearch = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const res = await GlobalSearchEngine.search(q);
      setGroups(res);
      setSelectedIndex(0);
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update search when query changes
  useEffect(() => {
    if (isOpen) {
      executeSearch(query);
    }
  }, [isOpen, query, executeSearch]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setGroups([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Open item action
  const handleSelectItem = (item: IGlobalSearchResult) => {
    AccessTrackingService.trackAccess(
      item.id, 
      item.title, 
      item.type === 'pdf' ? 'pdf' : item.type === 'highlight' ? 'highlight' : 'notebook', 
      item.subtitle
    );

    onClose();

    if (item.type === 'pdf' || (item.type === 'recent' && item.materialId)) {
      navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber || 1 } });
    } else if (
      item.type === 'notebook_title' || 
      item.type === 'notebook_content' || 
      (item.type === 'recent' && item.notebookId)
    ) {
      navigate('/focus', { state: { notebookId: item.notebookId } });
    } else if (item.type === 'highlight') {
      navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber || 1 } });
    } else if (item.type === 'tag' && item.tag) {
      navigate('/archive');
    }
  };

  // Keyboard navigation inside modal (Up/Down, Enter, Esc)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Helper to render type icons
  const renderIcon = (type: GlobalSearchResultType) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'notebook_title':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'notebook_content':
        return <FileText className="w-4 h-4 text-amber-600 opacity-80" />;
      case 'highlight':
        return <Highlighter className="w-4 h-4 text-emerald-500" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-purple-500" />;
      case 'recent':
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  let globalIndexCounter = 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        >
          {/* Header Search Input */}
          <div 
            className="p-4 border-b flex items-center gap-3 relative shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Search className="w-5 h-5 opacity-50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="PDF, Defter, Metin veya Etiketlerde Ara... (CTRL + K)"
              className="w-full bg-transparent text-sm font-serif font-medium focus:outline-none placeholder:opacity-40"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md opacity-40 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono opacity-50"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <span>ESC ile Kapat</span>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50 text-xs font-mono">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Aramalar Yapılıyor...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 gap-2 font-mono text-xs">
                <Search className="w-8 h-8 stroke-1" />
                <span>Eşleşen hiçbir sonuç bulunamadı.</span>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.category} className="flex flex-col gap-1.5">
                  {/* Category Header */}
                  <div className="px-3 pt-2 text-[10px] font-mono font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase opacity-80">
                    {group.category}
                  </div>

                  {/* Category Items */}
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const currentIndex = globalIndexCounter++;
                      const isSelected = currentIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/40 shadow-xs'
                              : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-lg border bg-stone-500/10 shrink-0 mt-0.5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                              {renderIcon(item.type)}
                            </div>

                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-serif font-medium truncate">
                                  {item.title}
                                </h4>
                                {item.subtitle && (
                                  <span className="text-[10px] font-mono opacity-50 shrink-0">
                                    • {item.subtitle}
                                  </span>
                                )}
                              </div>

                              {item.snippet && (
                                <p className="text-[11px] font-sans opacity-70 line-clamp-1 italic text-amber-700 dark:text-amber-300">
                                  "{item.snippet}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isSelected && (
                              <span className="text-[10px] font-mono opacity-70 text-amber-500 flex items-center gap-1">
                                Aç <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Keyboard Hints */}
          <div 
            className="px-4 py-2.5 border-t flex items-center justify-between text-[10px] font-mono opacity-60 shrink-0"
            style={{ 
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}
          >
            <div className="flex items-center gap-3">
              <span><b>↑↓</b> Seç</span>
              <span><b>↵</b> Aç</span>
              <span><b>ESC</b> Kapat</span>
            </div>

            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Passio Anında Yerel Arama Engine</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
