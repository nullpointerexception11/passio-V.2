/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Highlighter, FileText, Bookmark, Check, Plus, Tag } from 'lucide-react';
import { ReadingStatus, ICollection } from '../services/libraryMetadataService';

interface PdfHoverCardProps {
  docId: string;
  title: string;
  author?: string;
  currentPage: number;
  totalPages: number;
  lastOpenedAt?: string;
  status: ReadingStatus;
  highlightCount: number;
  noteCount: number;
  assignedCollectionIds: string[];
  allCollections: ICollection[];
  onToggleStatus: (e: React.MouseEvent) => void;
  onToggleCollection: (collectionId: string, e: React.MouseEvent) => void;
}

export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Henüz açılmadı';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Henüz açılmadı';
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSec < 60) return 'Az önce';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat önce`;
  if (diffSec < 172800) return 'Dün';
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export const PdfHoverCard: React.FC<PdfHoverCardProps> = ({
  currentPage,
  totalPages,
  lastOpenedAt,
  status,
  highlightCount,
  noteCount,
  assignedCollectionIds,
  allCollections,
  onToggleStatus,
  onToggleCollection,
}) => {
  const percent = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  const getStatusBadge = () => {
    switch (status) {
      case 'reading':
        return { symbol: '◐', label: 'Okunuyor', colorClass: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10' };
      case 'finished':
        return { symbol: '●', label: 'Tamamlandı', colorClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
      case 'new':
      default:
        return { symbol: '○', label: 'Yeni', colorClass: 'text-neutral-500 border-neutral-500/20 bg-neutral-500/5' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-xl border shadow-2xl backdrop-blur-md z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-left flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
        color: 'var(--color-text-primary)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header: Last Opened & Reading Status */}
      <div className="flex items-center justify-between text-[11px] font-mono border-b pb-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-1.5 opacity-70">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>{formatRelativeTime(lastOpenedAt)}</span>
        </div>

        <button
          onClick={onToggleStatus}
          className={`px-2 py-0.5 rounded-full border text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${statusInfo.colorClass}`}
          title="Okuma durumunu değiştirmek için tıklayın"
        >
          <span>{statusInfo.symbol}</span>
          <span>{statusInfo.label}</span>
        </button>
      </div>

      {/* Progress Bar & Page Ratio */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="opacity-60 text-[11px]">Okuma İlerlemesi</span>
          <span className="font-medium text-amber-600 dark:text-amber-400 text-[11px]">
            %{percent} ({currentPage}/{totalPages} Sayfa)
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
          <div
            className="h-full bg-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Highlights & Notes Counts */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
        <div className="flex items-center gap-1.5 p-2 rounded-lg border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-amber-500 font-bold">{highlightCount}</span>
          <span className="opacity-70 text-[10px]">Alıntı</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-lg border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-purple-500 font-bold">{noteCount}</span>
          <span className="opacity-70 text-[10px]">Not</span>
        </div>
      </div>

      {/* Collections Selection */}
      {allCollections.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-50 flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            <span>Koleksiyonlar</span>
          </span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {allCollections.map((col) => {
              const isAssigned = assignedCollectionIds.includes(col.id);
              return (
                <button
                  key={col.id}
                  onClick={(e) => onToggleCollection(col.id, e)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all border ${
                    isAssigned
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 font-medium'
                      : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {isAssigned ? <Check className="w-2.5 h-2.5 text-amber-500" /> : <Plus className="w-2.5 h-2.5" />}
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
