/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, X, FileText, PenTool, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { InboxService, IInboxNote } from '../../core/inbox/InboxService';
import { formatRelativeTime } from '../../features/library/components/PdfHoverCard';

interface InboxManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InboxManagerModal: React.FC<InboxManagerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<IInboxNote[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'converted'>('all');

  useEffect(() => {
    if (!isOpen) return;
    setNotes(InboxService.getNotes());
    const unsub = InboxService.subscribe(() => {
      setNotes(InboxService.getNotes());
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter((n) => {
    if (filter === 'pending') return !n.isConverted;
    if (filter === 'converted') return !!n.isConverted;
    return true;
  });

  const handleConvertToReadingNote = async (id: string) => {
    try {
      await InboxService.convertToReadingNote(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToNotebook = async (id: string) => {
    try {
      const notebook = await InboxService.convertToNotebook(id);
      onClose();
      navigate('/focus', { state: { notebookId: notebook.metadata.id } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    InboxService.deleteNote(id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-fade-in"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-semibold">Gelen Kutusu (Inbox)</h3>
                <p className="text-[11px] font-mono opacity-50">
                  Hızlı alınan notlar ve dönüştürme listesi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs Filter */}
          <div className="px-6 py-3 border-b flex items-center gap-2 shrink-0 text-xs font-mono" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer border transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              Tümü ({notes.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg cursor-pointer border transition-all ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              Bekleyenler ({notes.filter((n) => !n.isConverted).length})
            </button>
            <button
              onClick={() => setFilter('converted')}
              className={`px-3 py-1 rounded-lg cursor-pointer border transition-all ${
                filter === 'converted'
                  ? 'bg-amber-500 text-white border-amber-500 font-medium'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              Dönüştürülenler ({notes.filter((n) => n.isConverted).length})
            </button>
          </div>

          {/* List of Inbox Notes */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 min-h-[220px]">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono opacity-50 border border-dashed rounded-2xl p-6">
                Gelen kutusunda kayıtlı not bulunmuyor.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border flex flex-col gap-3 transition-all"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-base)',
                  }}
                >
                  <p className="text-xs font-serif leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t text-[11px] font-mono opacity-70" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="opacity-50">{formatRelativeTime(note.createdAt)}</span>

                    <div className="flex items-center gap-2">
                      {note.isConverted ? (
                        <span className="text-emerald-500 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {note.convertedToType === 'notebook' ? 'Deftere Dönüştü' : 'Okuma Notuna Dönüştü'}
                          </span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleConvertToReadingNote(note.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium cursor-pointer transition-all flex items-center gap-1 border border-amber-500/20"
                            title="Okuma Notuna Dönüştür"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Okuma Notu Yap</span>
                          </button>

                          <button
                            onClick={() => handleConvertToNotebook(note.id)}
                            className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-500 font-medium cursor-pointer transition-all flex items-center gap-1 border"
                            style={{ borderColor: 'var(--color-border-subtle)' }}
                            title="Yazıhane Defterine Dönüştür"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>Defter Yap</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 opacity-60 hover:opacity-100 cursor-pointer transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InboxManagerModal;
