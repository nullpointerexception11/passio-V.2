/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  X, 
  Highlighter, 
  FileText, 
  GitBranch, 
  Search, 
  Quote, 
  ExternalLink, 
  Eye, 
  Filter,
  BookOpen
} from 'lucide-react';
import { KnowledgeIntegrationService } from '../../core/knowledge/KnowledgeIntegrationService';
import { IKnowledgeBridgeItem, KnowledgeBridgeTypeFilter } from '../../core/knowledge/KnowledgeBridgeModel';
import { KnowledgeItemPreviewModal } from './KnowledgeItemPreviewModal';

interface NotebookRightPanelProps {
  isOpen: boolean;
  notebookId: string;
  onClose: () => void;
  onInsertText: (text: string) => void;
}

export const NotebookRightPanel: React.FC<NotebookRightPanelProps> = ({
  isOpen,
  notebookId,
  onClose,
  onInsertText,
}) => {
  const navigate = useNavigate();

  // Active Tab: 'vurgular' | 'notlar' | 'arama'
  const [activeTab, setActiveTab] = useState<'vurgular' | 'notlar' | 'arama'>('vurgular');

  // Search Query & Filters
  const [query, setQuery] = useState<string>('');
  const [searchFieldFilter, setSearchFieldFilter] = useState<'all' | 'tag' | 'book' | 'author' | 'content'>('all');
  
  // Results State
  const [items, setItems] = useState<IKnowledgeBridgeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preview Modal Item
  const [previewItem, setPreviewItem] = useState<IKnowledgeBridgeItem | null>(null);

  // Fetch items whenever tab, query or filters change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchKnowledge() {
      setIsLoading(true);

      let typeFilter: KnowledgeBridgeTypeFilter = 'all';
      if (activeTab === 'vurgular') typeFilter = 'highlight';
      if (activeTab === 'notlar') typeFilter = 'note';

      const res = await KnowledgeIntegrationService.searchKnowledge({
        typeFilter,
        query: query.trim(),
      });

      if (isMounted) {
        // Apply secondary field filters if in search tab
        let finalItems = res.items;
        if (activeTab === 'arama' && searchFieldFilter !== 'all' && query.trim()) {
          const q = query.trim().toLowerCase();
          finalItems = res.items.filter((item) => {
            if (searchFieldFilter === 'tag') return item.tags.some(t => t.toLowerCase().includes(q));
            if (searchFieldFilter === 'book') return item.materialTitle.toLowerCase().includes(q);
            if (searchFieldFilter === 'author') return item.author.toLowerCase().includes(q);
            if (searchFieldFilter === 'content') return item.preview.toLowerCase().includes(q);
            return true;
          });
        }

        setItems(finalItems);
        setIsLoading(false);
      }
    }

    fetchKnowledge();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, query, searchFieldFilter]);

  if (!isOpen) return null;

  /**
   * "Yazıya Ekle" Handler
   * Inserts formatted quote citation into the editor
   */
  const handleAddToEssay = (item: IKnowledgeBridgeItem) => {
    const citationText = KnowledgeIntegrationService.buildCitation(item);
    KnowledgeIntegrationService.registerReference(notebookId, item);
    onInsertText(`\n\n${citationText}\n\n`);
  };

  /**
   * "Kaynağa Git" Handler
   * Navigates to target PDF page in Library Reader
   */
  const handleNavigateToSource = (item: IKnowledgeBridgeItem) => {
    KnowledgeIntegrationService.navigateToSource(navigate, item.materialId, item.pageNumber);
  };

  return (
    <>
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="w-80 sm:w-96 h-full border-l flex flex-col shrink-0 select-none overflow-hidden z-20 shadow-lg"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Panel Header */}
        <div 
          className="px-4 py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2 text-xs font-serif font-semibold tracking-wide uppercase">
            <GitBranch className="w-4 h-4 text-amber-500" />
            <span>BİLGİ VE NOT PANENLİ</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Paneli Kapat"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Tabs Row: Vurgular | Okuma Notları | Arama */}
        <div 
          className="flex items-center border-b font-mono text-[11px] shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <button
            onClick={() => { setActiveTab('vurgular'); setQuery(''); }}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'vurgular'
                ? 'border-amber-500 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Vurgular</span>
          </button>

          <button
            onClick={() => { setActiveTab('notlar'); setQuery(''); }}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'notlar'
                ? 'border-amber-500 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Okuma Notları</span>
          </button>

          <button
            onClick={() => setActiveTab('arama')}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'arama'
                ? 'border-amber-500 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Arama</span>
          </button>
        </div>

        {/* Search Bar & Multi-Field Filter Controls */}
        <div className="p-3 border-b flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div 
            className="flex items-center gap-2 px-2.5 py-1.5 border rounded-lg text-xs"
            style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)' }}
          >
            <Search className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === 'vurgular' 
                  ? 'Vurgularda ara...' 
                  : activeTab === 'notlar' 
                  ? 'Notlarda ara...' 
                  : 'Etiket, Kitap, Yazar, İçerik ara...'
              }
              className="w-full bg-transparent border-none outline-none text-[11px] font-mono placeholder:opacity-40"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-0.5 opacity-50 hover:opacity-100 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Field Filters in Arama Tab */}
          {activeTab === 'arama' && (
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono opacity-80 pt-1 pb-0.5 no-scrollbar">
              <Filter className="w-3 h-3 opacity-40 shrink-0" />
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'tag', label: 'Etiket' },
                { id: 'book', label: 'Kitap/Materyal' },
                { id: 'author', label: 'Yazar' },
                { id: 'content', label: 'İçerik' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSearchFieldFilter(f.id as any)}
                  className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-all cursor-pointer ${
                    searchFieldFilter === f.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-medium'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Section - SADE SATIR GÖRÜNÜMÜ */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 text-xs font-mono">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px]">Bilgiler taranıyor...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center opacity-50 gap-2">
              <BookOpen className="w-8 h-8 font-light text-amber-500/50" />
              <p className="text-[11px] font-medium">Kayıtlı bilgi parçası bulunamadı.</p>
              <p className="text-[10px] opacity-70">Arama terimini değiştirmeyi veya kütüphanede yeni okuma yapmayı deneyin.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className="p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer hover:border-amber-500/60 hover:bg-amber-500/5 group relative"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'rgba(0, 0, 0, 0.01)',
                }}
              >
                {/* Header Row: Tür | Materyal | Sayfa */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase border shrink-0 ${
                      item.type === 'highlight' 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.type === 'highlight' ? 'Vurgu' : 'Not'}
                    </span>
                    <span className="font-medium truncate opacity-80" title={item.materialTitle}>
                      {item.materialTitle}
                    </span>
                  </div>
                  <span className="opacity-50 shrink-0 font-mono text-[10px]">
                    s.{item.pageNumber}
                  </span>
                </div>

                {/* Başlık / Alıntı Metni Excerpt */}
                <div className="text-[11px] font-serif font-normal leading-snug line-clamp-2 italic opacity-90 pl-1 border-l-2 border-amber-500/30">
                  {item.title ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400 not-italic block mb-0.5">
                      {item.title}
                    </span>
                  ) : null}
                  "{item.preview}"
                </div>

                {/* Footer Row: Etiketler + Quick Hover Action Buttons */}
                <div className="flex items-center justify-between text-[9px] pt-1 border-t opacity-70 group-hover:opacity-100" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  {/* Etiketler */}
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    {item.tags.map(tag => (
                      <span key={tag} className="opacity-60 hover:opacity-100">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Inline Action Buttons: Yazıya Ekle & Kaynağa Git */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleAddToEssay(item)}
                      className="px-2 py-0.5 rounded border bg-amber-600 text-white font-mono text-[9px] flex items-center gap-1 hover:bg-amber-700 transition-all shadow-2xs cursor-pointer"
                      title="Metni Alıntı Olarak Editöre Ekle"
                    >
                      <Quote className="w-2.5 h-2.5" />
                      <span>Ekle</span>
                    </button>

                    <button
                      onClick={() => handleNavigateToSource(item)}
                      className="p-1 rounded border hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer opacity-80 hover:opacity-100"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                      title="PDF Kaynağına Git"
                    >
                      <ExternalLink className="w-2.5 h-2.5 text-amber-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div 
          className="p-2.5 border-t text-[10px] font-mono text-center opacity-40 shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          {items.length} Kayıt Gösteriliyor • Passio Sprint 11
        </div>
      </motion.aside>

      {/* Preview Modal Popup when a row is clicked */}
      <KnowledgeItemPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onAddToEssay={handleAddToEssay}
        onNavigateToSource={handleNavigateToSource}
      />
    </>
  );
};

export default NotebookRightPanel;
