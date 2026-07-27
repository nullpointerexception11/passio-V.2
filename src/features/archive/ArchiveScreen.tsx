/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Archive, 
  Download, 
  FileText, 
  Search, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Highlighter, 
  Bookmark, 
  Calendar,
  Flame,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Header } from '../../shared/ui/Header';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_PDF_DOCUMENTS } from '../library/samplePdfs';
import { ReadingNoteRepository } from '../../core/notes/ReadingNoteRepository';
import { ReadingNoteService } from '../../core/notes/ReadingNoteService';
import { NotebookRepository } from '../../core/notebooks/NotebookRepository';
import { NotebookService } from '../../core/notebooks/NotebookService';
import { HighlightRepository } from '../../core/highlight/HighlightRepository';
import { HighlightService } from '../../core/highlight/HighlightService';
import { BookmarkService } from '../../core/bookmark/BookmarkService';
import { MaterialService } from '../library/services/materialService';
import { InboxService } from '../../core/inbox/InboxService';
import { AccessTrackingService, IAccessRecord } from '../../core/access/AccessTrackingService';
import { IReadingNote } from '../../entities/note/ReadingNoteModel';
import { ExportDocumentModal } from '../../components/molecules/ExportDocumentModal';
import { DocumentExportService, ExportFormat } from '../../core/export/DocumentExportService';

export type ArchiveFilterType = 'all' | 'note' | 'pdf' | 'highlight' | 'bookmark' | 'notebook';
export type ArchiveViewTab = 'timeline' | 'frequently_accessed';

export interface IArchiveItem {
  id: string;
  type: 'note' | 'notebook' | 'pdf' | 'highlight' | 'bookmark';
  subtype?: 'notebook' | 'reading_note' | 'inbox';
  title: string;
  subtitle?: string;
  date: string;
  materialId?: string;
  pageNumber?: number;
  color?: string;
  accessCount: number;
  raw?: any;
}

export interface ITimelineGroups {
  today: IArchiveItem[];
  yesterday: IArchiveItem[];
  thisWeek: IArchiveItem[];
  thisMonth: IArchiveItem[];
  older: IArchiveItem[];
}

export function groupItemsByTimeline(items: IArchiveItem[]): ITimelineGroups {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();

  const dayOfWeek = now.getDay();
  const distToMon = (dayOfWeek + 6) % 7;
  const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon).getTime();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const groups: ITimelineGroups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  for (const item of items) {
    const itemTime = new Date(item.date).getTime();
    if (isNaN(itemTime)) {
      groups.older.push(item);
      continue;
    }

    if (itemTime >= startOfToday) {
      groups.today.push(item);
    } else if (itemTime >= startOfYesterday) {
      groups.yesterday.push(item);
    } else if (itemTime >= startOfThisWeek) {
      groups.thisWeek.push(item);
    } else if (itemTime >= startOfThisMonth) {
      groups.thisMonth.push(item);
    } else {
      groups.older.push(item);
    }
  }

  return groups;
}

export const ArchiveScreen: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [items, setItems] = useState<IArchiveItem[]>([]);
  const [allNotes, setAllNotes] = useState<IReadingNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI States
  const [activeTab, setActiveTab] = useState<ArchiveViewTab>('timeline');
  const [activeFilter, setActiveFilter] = useState<ArchiveFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [selectedExportDoc, setSelectedExportDoc] = useState<{ id: string; title: string; notes: IReadingNote[] } | null>(null);
  const [isExportAllOpen, setIsExportAllOpen] = useState<boolean>(false);

  // Load Archive Items across Notebooks, Notes, PDFs, Highlights, Bookmarks
  const loadArchiveData = async () => {
    setIsLoading(true);
    try {
      const [notebooks, notes, highlights] = await Promise.all([
        NotebookRepository.getAllNotebooks(),
        ReadingNoteRepository.getAllNotes(),
        HighlightRepository.getAllHighlights(),
      ]);
      const bookmarks = BookmarkService.getAllBookmarks();
      const inboxNotes = InboxService.getNotes();
      setAllNotes(notes);

      const archiveItems: IArchiveItem[] = [];

      // Helper map for document titles
      const docTitleMap: Record<string, string> = {};
      for (const doc of SAMPLE_PDF_DOCUMENTS) {
        docTitleMap[doc.id] = doc.title;
      }

      // 1. Notebooks (Notes)
      for (const nb of notebooks) {
        archiveItems.push({
          id: nb.metadata.id,
          type: 'note',
          subtype: 'notebook',
          title: nb.metadata.title,
          subtitle: nb.content.text ? `${nb.metadata.wordCount} kelime • ${nb.content.text.substring(0, 60)}...` : 'Boş Defter',
          date: nb.metadata.updatedAt || nb.metadata.createdAt,
          accessCount: AccessTrackingService.getAccessCount(nb.metadata.id),
          raw: nb,
        });
      }

      // 2. Reading Notes (Notes)
      for (const rn of notes) {
        const docName = docTitleMap[rn.materialId] || 'Okuma Notu';
        archiveItems.push({
          id: rn.id,
          type: 'note',
          subtype: 'reading_note',
          title: rn.title,
          subtitle: `${docName} • ${rn.content.substring(0, 60)}...`,
          date: rn.updatedAt || rn.createdAt,
          materialId: rn.materialId,
          accessCount: AccessTrackingService.getAccessCount(rn.id),
          raw: rn,
        });
      }

      // 3. Inbox Notes (Notes)
      for (const ib of inboxNotes) {
        archiveItems.push({
          id: ib.id,
          type: 'note',
          subtype: 'inbox',
          title: ib.content.length > 50 ? `${ib.content.substring(0, 50)}...` : ib.content,
          subtitle: ib.isConverted ? 'Gelen Kutusu (Dönüştürüldü)' : 'Gelen Kutusu',
          date: ib.createdAt,
          accessCount: AccessTrackingService.getAccessCount(ib.id),
          raw: ib,
        });
      }

      // 4. PDFs
      for (const doc of SAMPLE_PDF_DOCUMENTS) {
        archiveItems.push({
          id: doc.id,
          type: 'pdf',
          title: doc.title,
          subtitle: `${doc.author} • ${doc.pageCount} Sayfa`,
          date: new Date().toISOString(), // recent
          accessCount: AccessTrackingService.getAccessCount(doc.id),
          raw: doc,
        });
      }

      // 5. Highlights
      for (const hl of highlights) {
        const docName = docTitleMap[hl.materialId] || 'Belge';
        archiveItems.push({
          id: hl.id,
          type: 'highlight',
          title: `"${hl.selectedText}"`,
          subtitle: `${docName} • Sayfa ${hl.pageNumber}`,
          date: hl.updatedAt || hl.createdAt,
          materialId: hl.materialId,
          pageNumber: hl.pageNumber,
          color: hl.color,
          accessCount: AccessTrackingService.getAccessCount(hl.id),
          raw: hl,
        });
      }

      // 6. Bookmarks
      for (const bm of bookmarks) {
        const docName = docTitleMap[bm.materialId] || 'Belge';
        archiveItems.push({
          id: bm.id,
          type: 'bookmark',
          title: bm.title || `Sayfa ${bm.pageNumber}`,
          subtitle: `${docName} • Sayfa ${bm.pageNumber}`,
          date: bm.createdAt,
          materialId: bm.materialId,
          pageNumber: bm.pageNumber,
          accessCount: AccessTrackingService.getAccessCount(bm.id),
          raw: bm,
        });
      }

      // Sort by modification date descending (Recently Modified requirement)
      archiveItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setItems(archiveItems);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchiveData();
  }, []);

  const handleDeleteItem = async (item: IArchiveItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`"${item.title || 'Bu öğeyi'}" silmek istediğinize emin misiniz?`)) return;
    try {
      if (item.subtype === 'reading_note') {
        await ReadingNoteService.deleteNote(item.materialId || (item.raw as any)?.materialId || '', item.id);
      } else if (item.subtype === 'notebook' || item.type === 'notebook') {
        await NotebookService.deleteNotebook(item.id);
      } else if (item.subtype === 'inbox') {
        InboxService.deleteNote(item.id);
      } else if (item.type === 'highlight') {
        await HighlightService.deleteHighlight(item.materialId || (item.raw as any)?.materialId || '', item.id);
      } else if (item.type === 'bookmark') {
        BookmarkService.deleteBookmark(item.materialId || (item.raw as any)?.materialId || '', item.id);
      } else if (item.type === 'pdf') {
        await MaterialService.deleteDocument(item.id);
      } else if (item.type === 'note') {
        await ReadingNoteService.deleteNote(item.materialId || (item.raw as any)?.materialId || '', item.id);
      }
      await loadArchiveData();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  // Filter & Search logic
  const filteredItems = items.filter((item) => {
    // Filter type check
    if (activeFilter !== 'all') {
      if (activeFilter === 'note' || activeFilter === 'notebook') {
        if (item.type !== 'note' && item.type !== 'notebook') return false;
      } else if (item.type !== activeFilter) {
        return false;
      }
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = (item.subtitle || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub) return false;
    }

    return true;
  });

  // Timeline groups
  const timelineGroups = groupItemsByTimeline(filteredItems);

  // Frequently accessed items (sorted by accessCount descending)
  const frequentlyAccessedItems = [...filteredItems].sort((a, b) => b.accessCount - a.accessCount);

  // Counts for filter tabs
  const typeCounts = {
    all: items.length,
    note: items.filter((i) => i.type === 'note' || i.type === 'notebook').length,
    pdf: items.filter((i) => i.type === 'pdf').length,
    highlight: items.filter((i) => i.type === 'highlight').length,
    bookmark: items.filter((i) => i.type === 'bookmark').length,
  };

  // Click / Open Item Handler (with Local Access Tracking)
  const handleItemClick = (item: IArchiveItem) => {
    AccessTrackingService.trackAccess(item.id, item.title, item.type, item.subtitle);

    if (item.type === 'note' || item.type === 'notebook') {
      if (item.subtype === 'notebook') {
        navigate('/writing', { state: { notebookId: item.id } });
      } else if (item.subtype === 'reading_note') {
        navigate('/library', { state: { materialId: item.materialId || 'dostoyevski-notes-from-underground', pageNumber: 1 } });
      } else {
        navigate('/desk');
      }
    } else if (item.type === 'pdf') {
      navigate('/library', { state: { materialId: item.id, pageNumber: 1 } });
    } else if (item.type === 'highlight' || item.type === 'bookmark') {
      if (item.materialId) {
        navigate('/library', { state: { materialId: item.materialId, pageNumber: item.pageNumber || 1 } });
      }
    }
  };

  // Export All Notes
  const handleExportAllNotes = (format: ExportFormat) => {
    const content = DocumentExportService.generateExportContent(
      {
        documentTitle: 'Passio Tüm Okuma Notları Arşivi',
        docId: 'all-archived-notes',
        notes: allNotes,
      },
      format
    );

    const extMap: Record<ExportFormat, { ext: string; mime: string }> = {
      markdown: { ext: 'md', mime: 'text/markdown' },
      html: { ext: 'html', mime: 'text/html' },
      json: { ext: 'json', mime: 'application/json' },
      txt: { ext: 'txt', mime: 'text/plain' },
    };

    const target = extMap[format];
    DocumentExportService.downloadFile(content, `passio_tum_notlar_arsivi.${target.ext}`, target.mime);
    setIsExportAllOpen(false);
  };

  // Helper to render type icons
  const renderItemTypeIcon = (type: IArchiveItem['type']) => {
    switch (type) {
      case 'note':
      case 'notebook':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'pdf':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'highlight':
        return <Highlighter className="w-4 h-4 text-emerald-500" />;
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-purple-500" />;
    }
  };

  const renderItemTypeName = (type: IArchiveItem['type'], subtype?: string) => {
    if (type === 'note' || type === 'notebook') {
      if (subtype === 'notebook') return 'Defter';
      if (subtype === 'reading_note') return 'Okuma Notu';
      if (subtype === 'inbox') return 'Gelen Kutusu';
      return 'Not';
    }
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'highlight':
        return 'Vurgu';
      case 'bookmark':
        return 'Yer İmi';
    }
  };

  // Helper to format date
  const formatDateLabel = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Geçmiş';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return 'Geçmiş';
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Header title="ARŞİV VE ZAMAN ÇİZELGESİ" onBack={() => navigate('/')} backLabel="Ana Salon" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 animate-fade-in">
        {/* Banner Section */}
        <section
          className="p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-serif font-medium">Yerel Arşiv ve Zaman Çizelgesi</h1>
              <p className="text-xs leading-relaxed opacity-70 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
                Tüm defterleriniz, PDF okuma oturumlarınız, alıntılarınız ve yer imleriniz tamamen yerel bellekte saklanır. 
                Sıfır analitik, %100 gizlilik.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsExportAllOpen(true)}
              className="w-full md:w-auto px-4 py-2 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 border-amber-500/40 text-amber-600 dark:text-amber-400"
              title="Tüm Notları ve Vurguları Toplu Dışa Aktar"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>Dışa Aktar ({allNotes.length})</span>
            </button>
          </div>
        </section>

        {/* Primary Tab Switcher: Timeline vs Frequently Accessed */}
        <div className="flex items-center justify-between border-b pb-3 gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'timeline'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Zaman Çizelgesi & Son Düzenlenenler</span>
            </button>

            <button
              onClick={() => setActiveTab('frequently_accessed')}
              className={`px-4 py-2 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'frequently_accessed'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>Sık Erişilenler</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono opacity-60">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>%100 Yerel Veri • Takip Yok</span>
          </div>
        </div>

        {/* Filter Pills Bar & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filters: Notes | PDFs | Highlights | Bookmarks */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {(
              [
                { id: 'all', label: 'Tümü', count: typeCounts.all },
                { id: 'note', label: 'Notlar', count: typeCounts.note },
                { id: 'pdf', label: 'PDF\'ler', count: typeCounts.pdf },
                { id: 'highlight', label: 'Vurgular', count: typeCounts.highlight },
                { id: 'bookmark', label: 'Yer İmleri', count: typeCounts.bookmark },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === filter.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
                }`}
              >
                <span>{filter.label}</span>
                <span className="opacity-50 text-[10px]">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arşivde ara..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-amber-500 transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>

        {/* Main Content View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin border-neutral-400" />
            <span className="text-xs font-mono opacity-50">Arşiv Yükleniyor...</span>
          </div>
        ) : activeTab === 'timeline' ? (
          /* TIMELINE VIEW (Grouped by Today, Yesterday, This Week, This Month, Older) */
          <div className="flex flex-col gap-8">
            {(
              [
                { key: 'today', title: 'Bugün', items: timelineGroups.today },
                { key: 'yesterday', title: 'Dün', items: timelineGroups.yesterday },
                { key: 'thisWeek', title: 'Bu Hafta', items: timelineGroups.thisWeek },
                { key: 'thisMonth', title: 'Bu Ay', items: timelineGroups.thisMonth },
                { key: 'older', title: 'Daha Eski', items: timelineGroups.older },
              ] as const
            ).map((group) => {
              if (group.items.length === 0) return null;

              return (
                <div key={group.key} className="flex flex-col gap-3">
                  {/* Section Timeline Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                      {group.title}
                    </span>
                    <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                    <span className="text-[10px] font-mono opacity-40">
                      {group.items.length} Öğe
                    </span>
                  </div>

                  {/* Items Grid/List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:border-amber-500 hover:shadow-md cursor-pointer group relative overflow-hidden"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          borderColor: 'var(--color-border-subtle)',
                        }}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20 flex items-center gap-1.5">
                              {renderItemTypeIcon(item.type)}
                              <span>{renderItemTypeName(item.type, item.subtype)}</span>
                            </span>

                            <span className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateLabel(item.date)}
                            </span>
                          </div>

                          <h3 className="text-sm font-serif font-medium leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                            {item.title}
                          </h3>

                          {item.subtitle && (
                            <p className="text-xs leading-relaxed opacity-60 line-clamp-2 font-sans" style={{ color: 'var(--color-text-secondary)' }}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t pt-2.5 mt-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <span className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span>{item.accessCount} kez açıldı</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDeleteItem(item, e)}
                              className="p-1 rounded text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              Aç <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center gap-2 opacity-50 font-mono text-xs">
                <Layers className="w-8 h-8 stroke-1" />
                <span>Bu filtrede hiçbir arşiv ögesi bulunamadı.</span>
              </div>
            )}
          </div>
        ) : (
          /* FREQUENTLY ACCESSED VIEW (Ranked by open count) */
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 text-xs font-mono opacity-80 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>En çok açılan malzemeler cihazınızda yerel olarak ölçülmektedir. Hiçbir analitik sunucusuna veri gönderilmez.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequentlyAccessedItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:border-amber-500 hover:shadow-md cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg border bg-stone-500/10 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-amber-600 dark:text-amber-400" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      #{index + 1}
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {renderItemTypeIcon(item.type)}
                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">{renderItemTypeName(item.type, item.subtype)}</span>
                      </div>
                      <h3 className="text-xs font-serif font-medium truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[11px] opacity-60 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {item.accessCount} Kez
                    </span>
                    <span className="text-[10px] font-mono opacity-40 flex items-center gap-0.5 group-hover:text-amber-500">
                      Görüntüle <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {frequentlyAccessedItems.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center gap-2 opacity-50 font-mono text-xs">
                <Flame className="w-8 h-8 stroke-1" />
                <span>Sık erişilen malzeme kaydı bulunamadı.</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Individual Document Export Modal */}
      {selectedExportDoc && (
        <ExportDocumentModal
          isOpen={!!selectedExportDoc}
          onClose={() => setSelectedExportDoc(null)}
          documentTitle={selectedExportDoc.title}
          docId={selectedExportDoc.id}
          notes={selectedExportDoc.notes}
        />
      )}

      {/* Bulk All Notes Export Modal */}
      {isExportAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all p-6 flex flex-col gap-6"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 font-serif font-medium text-sm">
                <Download className="w-4 h-4 text-amber-500" />
                <span>Tüm Arşiv Notlarını Dışa Aktar</span>
              </div>
              <button
                onClick={() => setIsExportAllOpen(false)}
                className="text-xs font-mono opacity-50 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs opacity-70 leading-relaxed">
              Kütüphane ve okuma oturumlarınızdan derlanan toplam <strong>{allNotes.length}</strong> adet okuma notu ve vurgu dışa aktarılacaktır.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportAllNotes('markdown')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-amber-600 dark:text-amber-400">Markdown (.md)</span>
                <span className="text-[10px] opacity-60">Notion, Obsidian</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('html')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">HTML (.html)</span>
                <span className="text-[10px] opacity-60">Web Tarayıcısı</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('json')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-blue-600 dark:text-blue-400">JSON (.json)</span>
                <span className="text-[10px] opacity-60">Ham Veri</span>
              </button>

              <button
                onClick={() => handleExportAllNotes('txt')}
                className="p-3 rounded-xl border text-left text-xs font-mono flex flex-col gap-1 transition-all hover:border-amber-500 cursor-pointer"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <span className="font-semibold text-purple-600 dark:text-purple-400">Düz Metin (.txt)</span>
                <span className="text-[10px] opacity-60">Sade Text</span>
              </button>
            </div>

            <div className="flex justify-end border-t pt-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                onClick={() => setIsExportAllOpen(false)}
                className="px-4 py-1.5 text-xs font-mono rounded-lg border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveScreen;
