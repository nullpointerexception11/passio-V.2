/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap } from 'lucide-react';
import { ReadingNoteService } from '../../../core/notes/ReadingNoteService';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId?: string;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  notebookId = 'quick-notes-global',
}) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus textarea when modal opens & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } else {
      setTitle('');
      setContent('');
      setSaveStatus('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto save quick note as user types
  const handleTextChange = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);

    if (!newTitle.trim() && !newContent.trim()) {
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await ReadingNoteService.saveNote(
          notebookId,
          newTitle || 'Hızlı Not',
          newContent,
          ['hızlı-not']
        );
        setSaveStatus('saved');
      } catch {
        setSaveStatus('idle');
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
            style={{
              borderColor: 'var(--color-border-subtle)',
              boxShadow: 'var(--shadows-large)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-serif font-semibold tracking-wide">
                  HIZLI NOT
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  CTRL + N
                </span>
              </div>

              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <span className="text-[10px] font-mono text-amber-500">Kaydediliyor...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Saklandı
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-stone-500"
                  title="Kapat (Escape)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTextChange(e.target.value, content)}
                placeholder="Başlık (Opsiyonel)"
                className="w-full text-xs font-serif font-medium bg-transparent border-b pb-1.5 outline-none"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              />

              <textarea
                ref={textareaRef}
                rows={5}
                value={content}
                onChange={(e) => handleTextChange(title, e.target.value)}
                placeholder="Düşüncelerinizi hızlıca buraya yazın..."
                className="w-full text-xs font-serif bg-transparent outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t flex items-center justify-between text-[10px] font-mono opacity-60"
              style={{ borderColor: 'var(--color-border-subtle)' }}
            >
              <span>Otomatik olarak kaydedilir</span>
              <span>Çıkmak için <strong>Escape</strong> tuşuna basın</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickNoteModal;
