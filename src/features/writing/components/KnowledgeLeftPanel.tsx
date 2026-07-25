/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Search,
  GitBranch,
  Highlighter,
  FileText,
  Quote,
  PlusCircle,
  ExternalLink,
  Eye,
  BookOpen,
} from 'lucide-react';
import { KnowledgeIntegrationService } from '../../../core/knowledge/KnowledgeIntegrationService';
import { IKnowledgeBridgeItem, KnowledgeBridgeTypeFilter } from '../../../entities/knowledge/KnowledgeBridgeModel';
import { KnowledgeItemPreviewModal } from '../../../components/molecules/KnowledgeItemPreviewModal';

interface KnowledgeLeftPanelProps {
  isOpen: boolean;
  notebookId: string;
  onClose: () => void;
  onInsertItem: (item: IKnowledgeBridgeItem) => void;
  onNavigateToSource?: (item: IKnowledgeBridgeItem) => void;
}

export const KnowledgeLeftPanel: React.FC<KnowledgeLeftPanelProps> = ({
  isOpen,
  onClose,
  onInsertItem,
  onNavigateToSource,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'highlight' | 'note'>('all');
  const [query, setQuery] = useState<string>('');
  const [items, setItems] = useState<IKnowledgeBridgeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<IKnowledgeBridgeItem | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadKnowledge() {
      setIsLoading(true);
      let typeFilter: KnowledgeBridgeTypeFilter = 'all';
      if (activeTab === 'highlight') typeFilter = 'highlight';
      if (activeTab === 'note') typeFilter = 'note';

      const res = await KnowledgeIntegrationService.searchKnowledge({
        typeFilter,
        query: query.trim(),
      });

      if (isMounted) {
        setItems(res.items);
        setIsLoading(false);
      }
    }

    loadKnowledge();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, query]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, item: IKnowledgeBridgeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <>
      <motion.aside
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="w-80 sm:w-96 h-full border-r flex flex-col shrink-0 select-none overflow-hidden z-20 shadow-lg"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2 text-xs font-serif font-semibold tracking-wide uppercase">
            <GitBranch className="w-4 h-4 text-amber-500" />
            <span>BİLGİ PARÇALARI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Paneli Kapat"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center border-b font-mono text-[11px] shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <span>Tümü</span>
          </button>
          <button
            onClick={() => setActiveTab('highlight')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'highlight'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Vurgular</span>
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'note'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Okuma Notları</span>
          </button>
        </div>

        {/* Search Bar */}
        <div
          className="p-3 border-b flex items-center gap-2 shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
            style={{
              backgroundColor: 'var(--color-bg-base)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <Search className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bilgi arayın veya filtreleryin..."
              className="w-full bg-transparent outline-none placeholder:opacity-30"
            />
            {query && (
              <button onClick={() => setQuery('')} className="cursor-pointer">
                <X className="w-3 h-3 opacity-40 hover:opacity-80" />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono opacity-50">
              Bilgi parçaları yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-2 opacity-50">
              <Quote className="w-6 h-6 opacity-30" />
              <span className="text-xs font-mono">Uygun bilgi parçası bulunamadı.</span>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="p-3 rounded-xl border flex flex-col gap-2 transition-all hover:border-amber-500/50 hover:shadow-sm group cursor-grab active:cursor-grabbing"
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
                  <div className="flex items-center gap-1.5 truncate">
                    {item.type === 'highlight' ? (
                      <Highlighter className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[150px] font-medium">{item.materialTitle}</span>
                  </div>
                  <span>Sayfa {item.pageNumber}</span>
                </div>

                {/* Content text */}
                <p className="text-xs font-serif leading-relaxed line-clamp-3 opacity-90">
                  {item.preview}
                </p>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-1 rounded text-[10px] font-mono flex items-center gap-1 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Önizle</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {onNavigateToSource && (
                      <button
                        onClick={() => onNavigateToSource(item)}
                        className="p-1 rounded text-[10px] font-mono flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-amber-500 cursor-pointer"
                        title="Kaynağa Git"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Kaynağa Git</span>
                      </button>
                    )}

                    <button
                      onClick={() => onInsertItem(item)}
                      className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Yazıya Ekle</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.aside>

      {/* Preview Modal */}
      {previewItem && (
        <KnowledgeItemPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onAddToEssay={(item) => {
            onInsertItem(item);
            setPreviewItem(null);
          }}
        />
      )}
    </>
  );
};
