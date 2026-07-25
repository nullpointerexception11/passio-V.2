/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Tag, Calendar, Trash2, Edit2, FileText } from 'lucide-react';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';

interface ReadingNoteSearchDialogProps {
  notes: IReadingNote[];
  onSelectNote: (note: IReadingNote) => void;
  onDeleteNote: (noteId: string) => void;
  onClose: () => void;
}

export const ReadingNoteSearchDialog: React.FC<ReadingNoteSearchDialogProps> = ({
  notes,
  onSelectNote,
  onDeleteNote,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    const query = searchTerm.toLowerCase().trim();

    return notes.filter((note) => {
      const matchTitle = note.title.toLowerCase().includes(query);
      const matchContent = note.content.toLowerCase().includes(query);
      const matchTag = note.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchTitle || matchContent || matchTag;
    });
  }, [notes, searchTerm]);

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div 
        className="p-3.5 border-b flex flex-col gap-2.5 shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-serif font-medium tracking-wide flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-500" />
            Not Ara
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 border rounded-lg"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Search className="w-3.5 h-3.5 opacity-40 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Etiket, başlık, içerik..."
            className="w-full bg-transparent border-none text-xs outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs opacity-40 hover:opacity-100">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-2">
        {filteredNotes.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 gap-2">
            <FileText className="w-8 h-8 font-light" />
            <p className="text-xs font-mono">
              {searchTerm ? 'Sonuç bulunamadı.' : 'Henüz not yok.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="group p-2.5 border rounded-lg transition-all cursor-pointer hover:border-amber-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] flex flex-col gap-1.5 relative"
              style={{
                borderColor: 'var(--color-border-subtle)',
                backgroundColor: 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <div className="flex items-start justify-between gap-1.5 pr-12">
                <h3 className="text-xs font-serif font-semibold truncate">
                  {note.title || 'Başlıksız Not'}
                </h3>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNote(note);
                    }}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500"
                    title="Düzenle"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded hover:bg-red-500/10 text-red-500"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] opacity-75 line-clamp-3 leading-relaxed font-sans">
                {note.content}
              </p>

              <div className="flex items-center justify-between pt-1 text-[9px] opacity-60 font-mono">
                <div className="flex items-center gap-1 flex-wrap">
                  {note.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                      <Tag className="w-2.5 h-2.5" />
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-0.5 ml-auto">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReadingNoteSearchDialog;
