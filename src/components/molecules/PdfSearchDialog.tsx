/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronUp, ChevronDown, X, Loader2, ListFilter } from 'lucide-react';
import { IPdfSearchMatch } from '../../core/pdf/PdfSearchService';

interface PdfSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  isSearching: boolean;
  matches: IPdfSearchMatch[];
  currentMatchIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectMatch: (index: number) => void;
  onClear: () => void;
}

export const PdfSearchDialog: React.FC<PdfSearchDialogProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  isSearching,
  matches,
  currentMatchIndex,
  onNext,
  onPrev,
  onSelectMatch,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResultsList, setShowResultsList] = React.useState<boolean>(false);

  // Auto-focus search input when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed top-16 right-6 z-50 w-80 sm:w-96 rounded-2xl border shadow-2xl backdrop-blur-xl font-sans text-xs overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
          boxShadow: 'var(--shadows-large)',
        }}
      >
        {/* Search Header Bar */}
        <div className="p-2.5 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-amber-600 dark:text-amber-400 opacity-70" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="PDF içinde sözcük veya kavram ara..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-transparent focus:border-amber-500/60 outline-none text-xs font-serif placeholder:font-sans placeholder:opacity-50 transition-colors"
            />
            {query && (
              <button
                onClick={onClear}
                className="absolute right-2 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 cursor-pointer"
                title="Aramayı Temizle"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Status & Match Navigator */}
          <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
            {isSearching ? (
              <div className="flex items-center gap-1 px-2 py-1 text-amber-600 dark:text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
              </div>
            ) : matches.length > 0 ? (
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <span className="px-1 text-[10px] font-medium opacity-80">
                  {currentMatchIndex + 1} / {matches.length}
                </span>

                <button
                  onClick={onPrev}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer active:scale-95 transition-all"
                  title="Önceki Eşleşme (Shift + Enter)"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>

                <button
                  onClick={onNext}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer active:scale-95 transition-all"
                  title="Sonraki Eşleşme (Enter)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setShowResultsList((prev) => !prev)}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    showResultsList ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                  title="Tüm Eşleşmeleri Listele"
                >
                  <ListFilter className="w-3 h-3" />
                </button>
              </div>
            ) : query.trim().length >= 2 ? (
              <span className="px-2 text-[10px] opacity-50">Sonuç yok</span>
            ) : null}

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors opacity-70 hover:opacity-100"
              title="Aramayı Kapat (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Results List Panel */}
        {showResultsList && matches.length > 0 && (
          <div className="max-h-60 overflow-y-auto divide-y font-serif text-xs p-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {matches.map((match, idx) => {
              const isSelected = idx === currentMatchIndex;

              return (
                <button
                  key={match.id}
                  onClick={() => {
                    onSelectMatch(idx);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-100'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] opacity-60 uppercase tracking-wider">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Sayfa {match.pageNumber}</span>
                    <span>Eşleşme #{idx + 1}</span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2">
                    {match.textSnippet}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfSearchDialog;
