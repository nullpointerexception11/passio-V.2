/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookPlus } from 'lucide-react';
import { NotebookType, NOTEBOOK_TYPE_LABELS } from '../../core/notebooks/NotebookModel';

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, type: NotebookType) => Promise<void>;
}

export const NewNotebookModal: React.FC<NewNotebookModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<NotebookType>('serbest');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(title.trim(), type);
      setTitle('');
      setType('serbest');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const notebookTypes = Object.entries(NOTEBOOK_TYPE_LABELS) as [NotebookType, string][];

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
          className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BookPlus className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-serif font-semibold tracking-wide">
                YENİ DEFTER
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Defter Adı */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider opacity-60">
                Defter Adı
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Sessizlik Denemeleri, Roman Taslağı..."
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-serif outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-base)',
                  color: 'var(--color-text-primary)',
                }}
                required
              />
            </div>

            {/* Tür */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase tracking-wider opacity-60">
                Tür
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotebookType)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all focus:border-amber-500 cursor-pointer"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {notebookTypes.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-80"
                style={{ borderColor: 'var(--color-border-subtle)' }}
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-mono font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
