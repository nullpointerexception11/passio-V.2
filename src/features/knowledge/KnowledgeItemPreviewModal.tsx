/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Quote, ExternalLink, Tag, User, Bookmark, Link as LinkIcon, FileText, BookOpen, Plus } from 'lucide-react';
import { IKnowledgeBridgeItem, IKnowledgeLink } from '../../entities/knowledge/KnowledgeBridgeModel';
import { PreviewService } from './PreviewService';
import { KnowledgeLinkService } from '../../core/knowledge/KnowledgeLinkService';
import { KnowledgeBridgeLinkModal } from '../../components/molecules/KnowledgeBridgeLinkModal';

interface KnowledgeItemPreviewModalProps {
  item: IKnowledgeBridgeItem | null;
  onClose: () => void;
  onAddToEssay: (item: IKnowledgeBridgeItem) => void;
  onNavigateToSource?: (item: IKnowledgeBridgeItem) => void;
}

export const KnowledgeItemPreviewModal: React.FC<KnowledgeItemPreviewModalProps> = ({
  item,
  onClose,
  onAddToEssay,
  onNavigateToSource,
}) => {
  const [links, setLinks] = useState<IKnowledgeLink[]>([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!item) return;
    setLinks(KnowledgeLinkService.getLinksForHighlight(item.id));
    const unsub = KnowledgeLinkService.subscribe(() => {
      setLinks(KnowledgeLinkService.getLinksForHighlight(item.id));
    });
    return () => unsub();
  }, [item]);

  if (!item) return null;

  const preview = PreviewService.generatePreview(item);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase border ${
                item.type === 'highlight' 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}>
                {preview.typeLabel}
              </span>
              <span className="text-xs font-mono opacity-50">•</span>
              <span className="text-xs font-serif font-medium truncate max-w-[200px]">
                {preview.materialTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono opacity-60">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{preview.author}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Sayfa {preview.pageNumber}</span>
              </span>
              <span>•</span>
              <span>{preview.createdAtFormatted}</span>
            </div>

            {item.title && (
              <h3 className="text-sm font-serif font-semibold text-amber-600 dark:text-amber-400">
                {item.title}
              </h3>
            )}

            <div 
              className="p-4 rounded-xl border bg-black/5 dark:bg-white/5 flex gap-3 text-xs font-serif leading-relaxed italic"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <Quote className="w-5 h-5 text-amber-500 shrink-0 opacity-60" />
              <p className="whitespace-pre-wrap">{preview.content}</p>
            </div>

            {preview.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[10px]">
                <Tag className="w-3 h-3 opacity-40 shrink-0" />
                {preview.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-70">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Knowledge Bridge: Simple Relationships List */}
            <div className="p-3 rounded-xl border bg-black/5 dark:bg-white/5 flex flex-col gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>BAĞLANTILAR ({links.length})</span>
                </span>
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium cursor-pointer transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Bağlantı Ekle</span>
                </button>
              </div>

              {links.length === 0 ? (
                <p className="text-[11px] font-mono opacity-40 italic py-1">
                  Bu alıntıya bağlı Not, PDF veya Yer İmi bulunmuyor.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 pt-1">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border flex items-center justify-between gap-2 text-xs font-mono"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {link.targetType === 'note' && <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {link.targetType === 'pdf' && <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        {link.targetType === 'bookmark' && <Bookmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        <div className="flex flex-col truncate">
                          <span className="font-serif font-medium truncate">{link.targetTitle}</span>
                          {link.targetSubtitle && (
                            <span className="text-[10px] font-mono opacity-50 truncate">{link.targetSubtitle}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => KnowledgeLinkService.removeLink(link.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 opacity-60 hover:opacity-100 cursor-pointer shrink-0"
                        title="Bağlantıyı Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div 
            className="px-6 py-4 border-t flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            {onNavigateToSource && (
              <button
                onClick={() => {
                  onNavigateToSource(item);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-mono border flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer opacity-80 hover:opacity-100"
                style={{ borderColor: 'var(--color-border-subtle)' }}
                title="Kütüphane PDF Okuyucusunda ilgili sayfaya git"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                <span>Kaynağa Git</span>
              </button>
            )}

            <button
              onClick={() => {
                onAddToEssay(item);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Bu metni alıntı olarak editöre ekle"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Yazıya Ekle</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <KnowledgeBridgeLinkModal
        isOpen={isLinkModalOpen}
        highlightId={item.id}
        highlightText={item.preview}
        onClose={() => setIsLinkModalOpen(false)}
        onLinkAdded={() => setLinks(KnowledgeLinkService.getLinksForHighlight(item.id))}
      />
    </div>
  );
};

export default KnowledgeItemPreviewModal;
