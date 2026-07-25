import React from 'react';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import { TocItem } from '../../core/pdf/PdfOutlineService';

interface PdfTocSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  outline: TocItem[];
  onSelectPage: (pageNumber: number) => void;
}

export const PdfTocSidebar: React.FC<PdfTocSidebarProps> = ({
  isOpen,
  onClose,
  outline,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  const renderItems = (items: TocItem[], level = 0) => {
    return (
      <div className="space-y-0.5">
        {items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => {
                if (item.pageNumber) {
                  onSelectPage(item.pageNumber);
                }
              }}
              style={{ paddingLeft: `${Math.min(level * 16 + 12, 64)}px` }}
              className="w-full text-left py-2 pr-3 text-xs flex items-center justify-between text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-sm transition-colors group"
            >
              <span className="truncate flex-1 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                {item.title}
              </span>
              {item.pageNumber && (
                <span className="text-[11px] font-mono text-stone-400 ml-2 shrink-0">
                  {item.pageNumber}
                </span>
              )}
            </button>
            {item.items && item.items.length > 0 && renderItems(item.items, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-80 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-xl flex flex-col transition-all">
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 text-sm font-medium">
          <BookOpen className="w-4 h-4 text-stone-500" />
          <span>İçindekiler</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {outline.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            Bu belgede içindekiler tablosu bulunamadı.
          </div>
        ) : (
          renderItems(outline)
        )}
      </div>
    </div>
  );
};
