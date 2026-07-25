/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';

interface ReadingNoteDialogProps {
  note?: IReadingNote | null;
  onSave: (title: string, content: string, tags: string[], existingId?: string) => void;
  onClose: () => void;
}

export const ReadingNoteDialog: React.FC<ReadingNoteDialogProps> = ({
  note,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [note]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(title, content, tags, note?.id);
  };

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div 
        className="px-4 py-3.5 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <h2 className="text-xs font-serif font-medium tracking-wide">
          {note ? 'Okuma Notunu Düzenle' : 'Yeni Okuma Notu'}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          title="Kapat"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider opacity-60 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-500" />
            Etiketler
          </label>
          <div 
            className="p-2 border rounded-lg flex flex-wrap items-center gap-1.5 min-h-[38px]"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              onBlur={handleAddTag}
              placeholder={tags.length === 0 ? 'Etiket ekle (ör. felsefe)...' : ''}
              className="flex-1 bg-transparent border-none text-xs outline-none min-w-[80px] font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider opacity-60">
            Not Başlığı <span className="opacity-50 font-normal text-[9px]">(isteğe bağlı)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık girin..."
            className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none transition-all"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-1.5 min-h-[160px]">
          <label className="text-[10px] font-mono uppercase tracking-wider opacity-60">
            Not İçeriği <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Düşüncenizi buraya yazın..."
            className="w-full flex-1 p-3 border rounded-lg text-xs leading-relaxed outline-none resize-none transition-all font-sans"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
          />
        </div>

        <div 
          className="pt-3 border-t flex items-center justify-end gap-2 shrink-0 mt-auto"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
            style={{
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingNoteDialog;
