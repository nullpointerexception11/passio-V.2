/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  X, 
  GitBranch, 
  Highlighter, 
  FileText, 
  BookOpen, 
  Calendar, 
  Tag, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { KnowledgeIntegrationService } from './KnowledgeIntegrationService';
import { 
  IKnowledgeBridgeItem, 
  KnowledgeBridgeTypeFilter, 
  IKnowledgeBridgeSearchResult 
} from '../../entities/knowledge/KnowledgeBridgeModel';

interface KnowledgeBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: IKnowledgeBridgeItem) => void;
  initialMaterialId?: string;
}

export const KnowledgeBridgeModal: React.FC<KnowledgeBridgeModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  initialMaterialId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<KnowledgeBridgeTypeFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchResult, setSearchResult] = useState<IKnowledgeBridgeSearchResult>({
    items: [],
    totalCount: 0,
    highlightCount: 0,
    noteCount: 0,
    availableTags: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    async function executeSearch() {
      setIsLoading(true);
      const res = await KnowledgeIntegrationService.searchKnowledge({
        query: searchTerm,
        typeFilter,
        tag: selectedTag,
        materialId: initialMaterialId,
      });
      if (!isCancelled) {
        setSearchResult(res);
        setIsLoading(false);
      }
    }

    executeSearch();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, searchTerm, typeFilter, selectedTag, initialMaterialId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-subtle)',
          boxShadow: 'var(--shadows-large)',
          color: 'var(--color-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-serif font-semibold tracking-wide">
                BİLGİ KÖPRÜSÜ
              </h2>
              <p className="text-[11px] font-mono opacity-50">
                Vurgular, notlar ve fikir parçaları arasında ortak arama ve geçiş
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            title="Kapat (Esc)"
          >
            <X className="w-5 h-5 opacity-60" />
          </button>
        </div>

        <div 
          className="p-5 border-b flex flex-col gap-3 shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
        >
          <div 
            className="flex items-center gap-3 px-3.5 py-2.5 border rounded-xl shadow-inner transition-all focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/20"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-surface)',
            }}
          >
            <Search className="w-4 h-4 text-amber-500 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Etiket, materyal adı, yazar, içerik veya tarih ara..."
              className="w-full bg-transparent border-none text-xs font-sans outline-none placeholder:opacity-40"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-xs opacity-40 hover:opacity-100 p-0.5 rounded cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase opacity-40 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filtre:
              </span>

              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === 'all' 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-semibold' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                }`}
                style={typeFilter !== 'all' ? { borderColor: 'var(--color-border-subtle)' } : {}}
              >
                <span>Tümü</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${typeFilter === 'all' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                  {searchResult.totalCount}
                </span>
              </button>

              <button
                onClick={() => setTypeFilter('highlight')}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === 'highlight' 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-semibold' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                }`}
                style={typeFilter !== 'highlight' ? { borderColor: 'var(--color-border-subtle)' } : {}}
              >
                <Highlighter className="w-3 h-3" />
                <span>Sadece Vurgular</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${typeFilter === 'highlight' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                  {searchResult.highlightCount}
                </span>
              </button>

              <button
                onClick={() => setTypeFilter('note')}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  typeFilter === 'note' 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-semibold' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                }`}
                style={typeFilter !== 'note' ? { borderColor: 'var(--color-border-subtle)' } : {}}
              >
                <FileText className="w-3 h-3" />
                <span>Sadece Notlar</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${typeFilter === 'note' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                  {searchResult.noteCount}
                </span>
              </button>
            </div>

            {searchResult.availableTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 scrollbar-none">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="px-2 py-0.5 rounded text-[10px] border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer flex items-center gap-1"
                  >
                    <span>Filtreyi Temizle</span>
                    <span>×</span>
                  </button>
                )}
                {searchResult.availableTags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer flex items-center gap-0.5 ${
                      selectedTag === tag 
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50 font-medium' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={selectedTag !== tag ? { borderColor: 'var(--color-border-subtle)' } : {}}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-50">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Bilgi parçaları aranıyor...</span>
            </div>
          ) : searchResult.items.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center opacity-50 gap-3">
              <GitBranch className="w-10 h-10 font-light" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-mono font-medium">Aramanıza uygun bilgi parçası bulunamadı.</p>
                <p className="text-[11px] font-mono opacity-60">
                  Farklı anahtar kelimeler veya etiketler ile tekrar aramayı deneyin.
                </p>
              </div>
            </div>
          ) : (
            searchResult.items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="group p-4 border rounded-xl transition-all cursor-pointer hover:border-amber-500/60 hover:shadow-md flex flex-col gap-2.5 relative"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'rgba(0, 0, 0, 0.01)',
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    {item.type === 'highlight' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Highlighter className="w-3 h-3" />
                        Vurgu
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Okuma Notu
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md border text-[10px] opacity-70" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      Sayfa {item.pageNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-50 text-[10px]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {item.title && (
                    <h3 className="text-xs font-serif font-semibold text-amber-600 dark:text-amber-400">
                      {item.title}
                    </h3>
                  )}
                  <p className={`text-xs leading-relaxed font-serif ${item.type === 'highlight' ? 'italic border-l-2 border-amber-500/50 pl-2.5 py-0.5 my-0.5' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                    "{item.preview}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 mt-1 text-[10px] font-mono opacity-70" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-3 truncate pr-4">
                    <span className="flex items-center gap-1 text-accent font-medium truncate">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.materialTitle}</span>
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="opacity-60 truncate">{item.author}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.tags.length > 0 && (
                      <div className="flex items-center gap-1 hidden sm:flex">
                        {item.tags.map(t => (
                          <span key={t} className="text-amber-600 dark:text-amber-400 opacity-80">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>PDF'e Git</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KnowledgeBridgeModal;
