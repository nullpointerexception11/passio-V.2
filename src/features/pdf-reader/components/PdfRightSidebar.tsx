/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Highlighter, Bookmark, Plus, Search, Trash2, X, Edit2, ArrowLeft, Check, Link as LinkIcon, BookOpen, Quote } from 'lucide-react';
import { IReadingNote } from '../../../core/notes/ReadingNoteModel';
import { IHighlightFragment, HIGHLIGHT_COLOR_MAP } from '../../../core/highlight/HighlightModel';
import { IBookmark, BookmarkService } from '../../../core/bookmark/BookmarkService';
import { ReadingNoteService } from '../../../core/notes/ReadingNoteService';
import { HighlightService } from '../../../core/highlight/HighlightService';
import { KnowledgeLinkService } from '../../../core/knowledge/KnowledgeLinkService';
import { NavigationService } from '../../../core/knowledge/NavigationService';
import { KnowledgeBridgeLinkModal } from '../../../components/molecules/KnowledgeBridgeLinkModal';
import { IKnowledgeLink } from '../../../entities/knowledge/KnowledgeBridgeModel';
import { formatRelativeTime } from '../../library/components/PdfHoverCard';

export type SidebarTab = 'notes' | 'highlights' | 'bookmarks';

interface PdfRightSidebarProps {
  docId: string;
  currentPage: number;
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  onClose: () => void;
  onJumpToPage: (pageNumber: number) => void;
}

export const PdfRightSidebar: React.FC<PdfRightSidebarProps> = ({
  docId,
  currentPage,
  activeTab,
  onChangeTab,
  onClose,
  onJumpToPage,
}) => {
  const navigate = useNavigate();

  // Notes State
  const [notes, setNotes] = useState<IReadingNote[]>([]);
  const [noteSearch, setNoteSearch] = useState<string>('');
  const [editingNote, setEditingNote] = useState<IReadingNote | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTags, setNoteTags] = useState<string>('');

  // Highlights State
  const [highlights, setHighlights] = useState<IHighlightFragment[]>([]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);

  // Links State
  const [allLinks, setAllLinks] = useState<IKnowledgeLink[]>(() => KnowledgeLinkService.getAllLinks());
  const [linkingHighlight, setLinkingHighlight] = useState<{ id: string; text: string } | null>(null);

  // Load & subscribe to data
  useEffect(() => {
    ReadingNoteService.loadNotes(docId).then((loaded) => setNotes(loaded));
    const unsubNotes = ReadingNoteService.subscribe(() => {
      setNotes(ReadingNoteService.getNotesForMaterial(docId));
    });

    HighlightService.loadHighlights(docId).then(() => {
      setHighlights(HighlightService.getHighlightsForMaterial(docId));
    });
    const unsubHighlights = HighlightService.subscribe(() => {
      setHighlights(HighlightService.getHighlightsForMaterial(docId));
    });

    setBookmarks(BookmarkService.getBookmarksForMaterial(docId));
    const unsubBookmarks = BookmarkService.subscribe(() => {
      setBookmarks(BookmarkService.getBookmarksForMaterial(docId));
    });

    const unsubLinks = KnowledgeLinkService.subscribe(() => {
      setAllLinks(KnowledgeLinkService.getAllLinks());
    });

    return () => {
      unsubNotes();
      unsubHighlights();
      unsubBookmarks();
      unsubLinks();
    };
  }, [docId]);

  const handleNavigateLink = (link: IKnowledgeLink) => {
    if (link.targetType === 'pdf' || link.targetType === 'bookmark') {
      if (link.materialId === docId && link.pageNumber) {
        onJumpToPage(link.pageNumber);
      } else if (link.materialId) {
        NavigationService.navigateToSource(navigate, link.materialId, link.pageNumber || 1);
      }
    } else if (link.targetType === 'note') {
      navigate('/focus', { state: { notebookId: link.targetId } });
    }
  };

  // Open inline note creation/edit form
  const handleStartEditNote = (note?: IReadingNote) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteTags(note.tags.join(', '));
      setIsCreatingNote(false);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setIsCreatingNote(true);
    }
  };

  const handleSaveInlineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const tagsArray = noteTags.split(',').map((t) => t.trim()).filter(Boolean);
    await ReadingNoteService.saveNote(
      docId,
      noteTitle || 'Not',
      noteContent,
      tagsArray,
      editingNote?.id
    );

    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleDeleteInlineNote = async (noteId: string) => {
    await ReadingNoteService.deleteNote(docId, noteId);
    if (editingNote?.id === noteId) {
      setEditingNote(null);
      setIsCreatingNote(false);
    }
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  const filteredNotes = notes.filter((n) => {
    if (!noteSearch.trim()) return true;
    const q = noteSearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const isHtml = (content: string) => {
    return /<blockquote|<div|<p/i.test(content);
  };

  const renderNoteContent = (content: string) => {
    if (isHtml(content)) {
      return content;
    }
    // Simple markdown quote block replacement
    return content.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-2 border-amber-500 pl-2.5 italic my-1.5 opacity-80">$1</blockquote>');
  };

  return (
    <aside
      className="h-full w-full border-l shrink-0 z-50 shadow-sm overflow-hidden flex flex-col bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
      style={{ borderColor: 'var(--color-border-subtle)' }}
    >
      {/* Sidebar Header & 3 Tabs */}
      <div className="flex flex-col border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between p-3 pb-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            BELGE PANELLERİ
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-stone-500"
            title="Paneli Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The 3 Tabs: Notes | Highlights | Bookmarks */}
        <div className="grid grid-cols-3 gap-1 px-3 pb-3">
          <button
            onClick={() => onChangeTab('notes')}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'notes'
                ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notlar ({notes.length})</span>
          </button>

          <button
            onClick={() => onChangeTab('highlights')}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'highlights'
                ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Alıntılar ({highlights.length})</span>
          </button>

          <button
            onClick={() => onChangeTab('bookmarks')}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Yer İmleri ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ========================================================
            TAB 1: NOTES
           ======================================================== */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-4">
            {isCreatingNote || editingNote ? (
              /* Inline Note Form (No Extra Window!) */
              <form onSubmit={handleSaveInlineNote} className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null);
                      setIsCreatingNote(false);
                    }}
                    className="text-xs font-mono flex items-center gap-1 opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Listeye Dön</span>
                  </button>
                  <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
                    {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono opacity-60 uppercase">Başlık</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Not başlığı..."
                    autoFocus
                    className="p-2 text-xs font-serif rounded border bg-transparent outline-none"
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono opacity-60 uppercase">Not İçeriği</label>
                  <textarea
                    rows={6}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Düşüncelerinizi buraya yazın..."
                    className="p-2 text-xs font-serif rounded border bg-transparent outline-none resize-none leading-relaxed"
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  />
                </div>

                {highlights.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono opacity-60 uppercase flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <Quote className="w-3 h-3" />
                      <span>Belgeden Alıntı Ekle</span>
                    </label>
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto border rounded-xl p-1.5 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      {highlights.map((hl) => (
                        <button
                          key={hl.id}
                          type="button"
                          onClick={() => {
                            let colorHex = '#eab308';
                            let bgHex = 'rgba(234, 179, 8, 0.08)';
                            
                            switch (hl.color) {
                              case 'blue':
                                colorHex = '#3b82f6';
                                bgHex = 'rgba(59, 130, 246, 0.08)';
                                break;
                              case 'green':
                                colorHex = '#22c55e';
                                bgHex = 'rgba(34, 197, 94, 0.08)';
                                break;
                              case 'red':
                                colorHex = '#ef4444';
                                bgHex = 'rgba(239, 68, 68, 0.08)';
                                break;
                              case 'purple':
                                colorHex = '#a855f7';
                                bgHex = 'rgba(168, 85, 247, 0.08)';
                                break;
                              case 'orange':
                                colorHex = '#f97316';
                                bgHex = 'rgba(249, 115, 22, 0.08)';
                                break;
                            }

                            const quoteHtml = `<blockquote class="passio-quote-block" data-highlight-color="${hl.color || 'yellow'}" data-book="${docId}" data-page="${hl.pageNumber}" style="border-left: 3px solid ${colorHex}; padding: 10px 14px; margin: 12px 0; background-color: ${bgHex}; border-radius: 0 6px 6px 0; border-top: none; border-right: none; border-bottom: none; font-style: normal; display: block; text-align: left;">
  <p style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 1.05em; font-style: italic; line-height: 1.5; color: inherit;">"${hl.selectedText.trim()}"</p>
  <cite style="font-family: monospace; font-size: 0.72em; opacity: 0.6; display: flex; align-items: center; gap: 4px; font-style: normal; border: none; padding: 0; margin: 0; color: inherit;">
    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${colorHex}; margin-right: 4px; vertical-align: middle;"></span>
    <span>Sayfa ${hl.pageNumber}</span>
  </cite>
</blockquote>`;

                            setNoteContent(prev => prev ? `${prev}\n\n${quoteHtml}\n\n` : `${quoteHtml}\n\n`);
                          }}
                          className="text-left text-[11px] font-serif p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer truncate flex items-center justify-between border-b last:border-b-0 border-black/5 dark:border-white/5"
                          title="Tıkla ve Alıntı Bloğu Ekle"
                        >
                          <span className="truncate opacity-80 italic font-medium">"${hl.selectedText}"</span>
                          <span className="text-[9px] font-mono opacity-55 shrink-0 ml-2 font-medium">s. {hl.pageNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono opacity-60 uppercase">Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="felsefe, önemli, kavram"
                    className="p-2 text-xs font-mono rounded border bg-transparent outline-none"
                    style={{ borderColor: 'var(--color-border-subtle)' }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editingNote && (
                    <button
                      type="button"
                      onClick={() => handleDeleteInlineNote(editingNote.id)}
                      className="px-3 py-1.5 rounded text-xs font-mono text-red-500 border border-red-500/20 hover:bg-red-500/10 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sil</span>
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNote(null);
                        setIsCreatingNote(false);
                      }}
                      className="px-3 py-1.5 rounded text-xs font-mono border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded text-xs font-mono bg-amber-500 text-white hover:bg-amber-600 font-medium cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Notes List View */
              <>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Notlarda ara..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded border bg-transparent outline-none"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    />
                  </div>
                  <button
                    onClick={() => handleStartEditNote()}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-amber-500 text-white font-medium flex items-center gap-1 shrink-0 hover:bg-amber-600 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Not</span>
                  </button>
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono opacity-50 border border-dashed rounded-xl p-4">
                    {noteSearch ? 'Aramayla eşleşen not bulunamadı.' : 'Henüz not eklenmedi. "Yeni Not" butonuna tıklayarak ilk notunuzu ekleyin.'}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl border flex flex-col gap-2 hover:border-amber-500/50 transition-all cursor-pointer group"
                        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-surface)' }}
                        onClick={() => handleStartEditNote(note)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-medium text-xs leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400">
                            {note.title || 'İsimsiz Not'}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditNote(note);
                              }}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-stone-500"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInlineNote(note.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div 
                          className="text-xs font-serif opacity-75 leading-relaxed overflow-hidden prose prose-stone dark:prose-invert max-w-full"
                          dangerouslySetInnerHTML={{ __html: renderNoteContent(note.content) }}
                        />

                        <div className="flex items-center justify-between text-[10px] font-mono opacity-50 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <span>{formatRelativeTime(note.createdAt)}</span>
                          {note.tags.length > 0 && (
                            <div className="flex items-center gap-1 truncate max-w-[120px]">
                              {note.tags.map((tag) => (
                                <span key={tag} className="px-1 py-0.2 rounded bg-stone-500/10">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: HIGHLIGHTS
           ======================================================== */}
        {activeTab === 'highlights' && (
          <div className="flex flex-col gap-3">
            {highlights.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono opacity-50 border border-dashed rounded-xl p-4">
                Henüz alıntı bulunmuyor. Belge üzerinde bir metne çift tıklayarak veya seçerek alıntı ekleyebilirsiniz.
              </div>
            ) : (
              highlights
                .sort((a, b) => a.pageNumber - b.pageNumber)
                .map((hl) => {
                  const colorConfig = HIGHLIGHT_COLOR_MAP[hl.color || 'yellow'] || HIGHLIGHT_COLOR_MAP.yellow;

                  return (
                    <div
                      key={hl.id}
                      className="p-3 rounded-xl border flex flex-col gap-2 hover:border-amber-500/50 transition-all cursor-pointer group"
                      style={{
                        borderColor: 'var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-surface)',
                      }}
                      onClick={() => onJumpToPage(hl.pageNumber)}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onJumpToPage(hl.pageNumber);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium hover:bg-amber-500/20 cursor-pointer"
                        >
                          Sayfa {hl.pageNumber}
                        </button>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await HighlightService.deleteHighlight(docId, hl.id);
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Alıntıyı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <blockquote
                        className="text-xs font-serif italic border-l-2 pl-2.5 py-0.5 leading-relaxed opacity-90"
                        style={{ borderColor: colorConfig.accentHex }}
                      >
                        "{hl.selectedText}"
                      </blockquote>

                      {hl.note && (
                        <p className="text-[11px] font-serif opacity-70 bg-black/5 dark:bg-white/5 p-2 rounded">
                          {hl.note}
                        </p>
                      )}

                      {/* Knowledge Bridge: Simple Relationships List */}
                      {(() => {
                        const hlLinks = allLinks.filter((l) => l.highlightId === hl.id);
                        return (
                          <div
                            className="mt-1 pt-2 border-t flex flex-col gap-1.5"
                            style={{ borderColor: 'var(--color-border-subtle)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
                              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                <LinkIcon className="w-3 h-3" />
                                <span>BAĞLANTILAR ({hlLinks.length})</span>
                              </span>
                              <button
                                onClick={() =>
                                  setLinkingHighlight({ id: hl.id, text: hl.selectedText })
                                }
                                className="hover:text-amber-500 font-medium cursor-pointer"
                              >
                                + Bağlantı Ekle
                              </button>
                            </div>

                            {hlLinks.length > 0 ? (
                              <div className="flex flex-col gap-1 mt-0.5">
                                {hlLinks.map((link) => (
                                  <div
                                    key={link.id}
                                    onClick={() => handleNavigateLink(link)}
                                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border hover:border-amber-500/40 flex items-center justify-between gap-2 text-[11px] font-mono cursor-pointer transition-all"
                                    style={{ borderColor: 'var(--color-border-subtle)' }}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      {link.targetType === 'note' && (
                                        <FileText className="w-3 h-3 text-amber-500 shrink-0" />
                                      )}
                                      {link.targetType === 'pdf' && (
                                        <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                                      )}
                                      {link.targetType === 'bookmark' && (
                                        <Bookmark className="w-3-3 text-emerald-500 shrink-0" />
                                      )}
                                      <span className="truncate font-medium">{link.targetTitle}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        KnowledgeLinkService.removeLink(link.id);
                                      }}
                                      className="p-0.5 rounded hover:bg-red-500/10 text-red-500 opacity-60 hover:opacity-100 cursor-pointer shrink-0"
                                      title="Bağlantıyı Kaldır"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}

                      <span className="text-[10px] font-mono opacity-40 self-end">
                        {formatRelativeTime(hl.createdAt)}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: BOOKMARKS
           ======================================================== */}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col gap-3">
            {/* Single Click Add Bookmark for Current Page Button */}
            <button
              onClick={() => {
                BookmarkService.toggleBookmark(docId, currentPage);
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-sm ${
                isCurrentPageBookmarked
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 font-medium'
                  : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentPageBookmarked ? 'fill-amber-500' : ''}`} />
              <span>
                {isCurrentPageBookmarked
                  ? `Sayfa ${currentPage} Yer İmlerinden Çıkar`
                  : `Sayfa ${currentPage} Yer İmlerine Ekle`}
              </span>
            </button>

            {bookmarks.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono opacity-50 border border-dashed rounded-xl p-4">
                Henüz yer imi bulunmuyor. Güncel sayfayı eklemek için yukarıdaki butona veya başlık çubuğundaki yer imi simgesine tıklayın.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {bookmarks.map((bm) => {
                  const isCurrent = bm.pageNumber === currentPage;

                  return (
                    <div
                      key={bm.id}
                      onClick={() => onJumpToPage(bm.pageNumber)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 hover:border-amber-500/50 transition-all cursor-pointer group ${
                        isCurrent ? 'border-amber-500/60 bg-amber-500/5' : ''
                      }`}
                      style={{
                        borderColor: isCurrent ? undefined : 'var(--color-border-subtle)',
                        backgroundColor: isCurrent ? undefined : 'var(--color-bg-surface)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                          <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-mono font-medium text-xs text-amber-600 dark:text-amber-400">
                            Sayfa {bm.pageNumber}
                          </span>
                          <span className="text-[10px] font-mono opacity-50 truncate">
                            {formatRelativeTime(bm.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onJumpToPage(bm.pageNumber);
                          }}
                          className="px-2 py-1 rounded text-[10px] font-mono border hover:bg-amber-500/10 cursor-pointer"
                          style={{ borderColor: 'var(--color-border-subtle)' }}
                        >
                          Git →
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            BookmarkService.deleteBookmark(docId, bm.id);
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                          title="Yer İmini Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {linkingHighlight && (
        <KnowledgeBridgeLinkModal
          isOpen={!!linkingHighlight}
          highlightId={linkingHighlight.id}
          highlightText={linkingHighlight.text}
          onClose={() => setLinkingHighlight(null)}
          onLinkAdded={() => setAllLinks(KnowledgeLinkService.getAllLinks())}
        />
      )}
    </aside>
  );
};
