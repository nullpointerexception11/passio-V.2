/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, X, Check, CornerDownLeft } from 'lucide-react';
import { InboxService } from '../../core/inbox/InboxService';

interface InboxQuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInboxManager?: () => void;
}

export const InboxQuickCaptureModal: React.FC<InboxQuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onOpenInboxManager,
}) => {
  const [content, setContent] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSavedSuccess(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    const trimmed = content.trim();
    if (trimmed) {
      InboxService.addNote(trimmed);
      setSavedSuccess(true);
      setTimeout(() => {
        setContent('');
        setSavedSuccess(false);
        onClose();
      }, 200);
    } else {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveAndClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs select-none animate-fade-in"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div
            className="px-4 py-2.5 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-serif font-semibold tracking-wider">
                Gelen Kutusu (Inbox)
              </span>
              <span className="text-[10px] font-mono opacity-40">Ctrl + Shift + Space</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenInboxManager && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenInboxManager();
                  }}
                  className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline cursor-pointer opacity-80 hover:opacity-100"
                >
                  Tüm Notlar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-50 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tiny Floating Note Input Area */}
          <div className="p-4 relative flex flex-col gap-2">
            <textarea
              ref={inputRef}
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hızlı düşünce veya not yazın... (Enter ile kaydet)"
              className="w-full bg-transparent text-sm font-serif outline-none resize-none placeholder:opacity-40 leading-relaxed"
            />

            {/* Footer Prompt */}
            <div className="flex items-center justify-between text-[10px] font-mono opacity-50 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3 text-amber-500" />
                <span>Kaydetmek için Enter'a basın</span>
              </span>

              {savedSuccess ? (
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Otomatik Kaydedildi
                </span>
              ) : (
                <span>Shift+Enter: Yeni Satır</span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InboxQuickCaptureModal;
