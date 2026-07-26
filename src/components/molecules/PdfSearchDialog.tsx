import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { SearchResultMatch } from '../../core/pdf/PdfSearchService';

interface PdfSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  results: SearchResultMatch[];
  isSearching: boolean;
  activeMatchIndex: number;
  onSelectMatch: (index: number) => void;
  onJumpToPage: (pageNumber: number) => void;
}

export const PdfSearchDialog: React.FC<PdfSearchDialogProps> = ({
  isOpen,
  onClose,
  onSearch,
  results,
  isSearching,
  activeMatchIndex,
  onSelectMatch,
  onJumpToPage,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        if (results.length > 0) {
          const prevIndex = (activeMatchIndex - 1 + results.length) % results.length;
          onSelectMatch(prevIndex);
        }
      } else {
        if (query && results.length === 0 && !isSearching) {
          onSearch(query);
        } else if (results.length > 0) {
          const nextIndex = (activeMatchIndex + 1) % results.length;
          onSelectMatch(nextIndex);
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (val.trim().length >= 2) {
        onSearch(val);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/20 backdrop-blur-xs p-4">
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh] transition-all">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Belge içinde ara..."
            className="flex-1 bg-transparent text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden"
          />

          {isSearching && <Loader2 className="w-4 h-4 text-stone-400 animate-spin shrink-0" />}

          {results.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-stone-500 font-mono px-2">
              <span>
                {activeMatchIndex + 1} / {results.length}
              </span>
              <button
                onClick={() =>
                  onSelectMatch((activeMatchIndex - 1 + results.length) % results.length)
                }
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded"
                title="Önceki (Shift+Enter)"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectMatch((activeMatchIndex + 1) % results.length)}
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded"
                title="Sonraki (Enter)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {query.trim().length > 0 && results.length === 0 && !isSearching && (
            <div className="p-6 text-center text-xs text-stone-400">
              Aramayla eşleşen sonuç bulunamadı.
            </div>
          )}

          {results.map((item, idx) => {
            const isActive = idx === activeMatchIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectMatch(idx);
                  onJumpToPage(item.pageNumber);
                }}
                className={`w-full text-left p-2.5 rounded-md text-xs transition-colors border ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-100'
                    : 'bg-transparent border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-stone-400 mb-1">
                  <span>Sayfa {item.pageNumber}</span>
                  {isActive && <span className="text-amber-600 dark:amber-400 font-sans">Aktif</span>}
                </div>
                <div className="line-clamp-2 leading-relaxed">{item.textSnippet}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
