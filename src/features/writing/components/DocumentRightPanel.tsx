/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Sliders, ExternalLink, Target, Clock, Hash, Trash2 } from 'lucide-react';
import { INotebook } from '../../../core/notebooks/NotebookModel';
import { INotebookReference } from '../../knowledge/ReferenceManager';

interface DocumentRightPanelProps {
  isOpen: boolean;
  notebook: INotebook;
  references: INotebookReference[];
  wordCount: number;
  readingTimeMinutes: number;
  onClose: () => void;
  onOpenSettings: () => void;
  onNavigateToSource: (materialId: string, pageNumber: number) => void;
  onRemoveReference?: (id: string) => void;
}

export const DocumentRightPanel: React.FC<DocumentRightPanelProps> = ({
  isOpen,
  notebook,
  references,
  wordCount,
  readingTimeMinutes,
  onClose,
  onOpenSettings,
  onNavigateToSource,
  onRemoveReference,
}) => {
  if (!isOpen) return null;

  const targetWordCount = 1000;
  const progressPercent = Math.min(100, Math.round((wordCount / targetWordCount) * 100));

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="w-80 sm:w-86 h-full border-l flex flex-col shrink-0 select-none overflow-hidden z-20 shadow-lg"
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
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>BELGE BİLGİLERİ</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Paneli Kapat"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Document Stats Card */}
        <div
          className="p-4 rounded-xl border flex flex-col gap-3"
          style={{
            backgroundColor: 'var(--color-bg-base)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-semibold">{notebook.metadata.title}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {notebook.metadata.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/5 dark:border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-amber-500" />
              <div>
                <div className="text-[10px] opacity-50">Kelime</div>
                <div className="font-semibold">{wordCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <div>
                <div className="text-[10px] opacity-50">Tahmini Okuma</div>
                <div className="font-semibold">{readingTimeMinutes} dk</div>
              </div>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-amber-500" />
                Hedef: 1000 Kelime
              </span>
              <span>%{progressPercent}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* References Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              KULLANILAN KAYNAKLAR ({references.length})
            </h3>
          </div>

          {references.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed text-center text-xs font-mono opacity-50">
              Henüz bir kaynak eklenmedi. Sol panelden bir bilgi parçası eklediğinizde kaynakça buraya otomatik işlenir.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 rounded-xl border flex items-center justify-between text-xs transition-all hover:border-amber-500/50"
                  style={{
                    backgroundColor: 'var(--color-bg-base)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-serif font-medium truncate">{ref.materialTitle}</span>
                    <span className="text-[10px] font-mono opacity-50">Sayfa {ref.pageNumber}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onNavigateToSource(ref.materialTitle, ref.pageNumber)}
                      className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-amber-500 cursor-pointer"
                      title="Kaynağa Git"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {onRemoveReference && (
                      <button
                        onClick={() => onRemoveReference(ref.id)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-red-400 cursor-pointer"
                        title="Kaynağı Kaldır"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formatting / Settings Button */}
        <div className="pt-4 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onOpenSettings}
            className="w-full py-2 px-3 rounded-xl border font-mono text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sayfa ve Tipografi Ayarları</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
