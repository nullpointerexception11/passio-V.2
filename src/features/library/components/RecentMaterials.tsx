/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Eye, Trash2, Bookmark, Clock } from 'lucide-react';
import { IDocumentMetadata } from '../types/material.types';
import { ICollection, ReadingStatus } from '../services/libraryMetadataService';

interface RecentMaterialsProps {
  customPdfs: IDocumentMetadata[];
  collections: ICollection[];
  docCollectionMap: Record<string, string[]>;
  highlightsMap: Record<string, number>;
  notesMap: Record<string, number>;
  statuses: Record<string, ReadingStatus>;
  lastOpenedMap: Record<string, string>;
  lastReadPages: Record<string, number>;
  selectedCollectionId: string | null;
  selectedStatus: ReadingStatus | null;
  onSelect: (metadata: IDocumentMetadata) => void;
  onDelete: (docId: string, e: React.MouseEvent) => void;
  onCycleStatus: (docId: string, e?: React.MouseEvent) => void;
  onToggleCollection: (docId: string, collectionId: string, e: React.MouseEvent) => void;
}

export const RecentMaterials: React.FC<RecentMaterialsProps> = ({
  customPdfs,
  collections,
  docCollectionMap,
  highlightsMap,
  notesMap,
  statuses,
  lastOpenedMap,
  lastReadPages,
  selectedCollectionId,
  selectedStatus,
  onSelect,
  onDelete,
  onCycleStatus,
  onToggleCollection,
}) => {
  const filteredCustomPdfs = customPdfs.filter((pdf) => {
    const assignedCols = docCollectionMap[pdf.docId] || [];
    const currentStatus = statuses[pdf.docId] || 'new';

    if (selectedCollectionId && !assignedCols.includes(selectedCollectionId)) {
      return false;
    }
    if (selectedStatus && currentStatus !== selectedStatus) {
      return false;
    }
    return true;
  });

  if (filteredCustomPdfs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-80">
        YÜKLENEN BELGELER ({filteredCustomPdfs.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomPdfs.map((pdf) => {
          const savedPage = lastReadPages[pdf.docId] || 1;
          const assignedColIds = docCollectionMap[pdf.docId] || [];
          const assignedCols = collections.filter((c) => assignedColIds.includes(c.id));
          const currentStatus = statuses[pdf.docId] || 'new';
          const hCount = highlightsMap[pdf.docId] || 0;
          const nCount = notesMap[pdf.docId] || 0;
          const lastOpened = lastOpenedMap[pdf.docId];

          const getStatusInfo = () => {
            switch (currentStatus) {
              case 'reading':
                return { symbol: '◐', label: 'Okunuyor', color: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10' };
              case 'finished':
                return { symbol: '●', label: 'Tamamlandı', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
              case 'new':
              default:
                return { symbol: '○', label: 'Yeni', color: 'text-neutral-500 border-neutral-500/20 bg-neutral-500/5' };
            }
          };

          const statusInfo = getStatusInfo();

          return (
            <div
              key={pdf.docId}
              onClick={() => onSelect(pdf)}
              className="p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-lg group relative"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-serif font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {pdf.title}
                    </span>
                    <span className="text-[10px] font-mono opacity-50 tracking-wide">Yerel Cihaz Dosyası • PDF</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => onCycleStatus(pdf.docId, e)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${statusInfo.color}`}
                    title="Okuma durumunu değiştir"
                  >
                    <span>{statusInfo.symbol}</span>
                    <span>{statusInfo.label}</span>
                  </button>

                  <button
                    onClick={(e) => onDelete(pdf.docId, e)}
                    className="p-1.5 rounded-lg border text-red-500 hover:bg-red-500/10 border-red-500/20 transition-all cursor-pointer"
                    title="Belgeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collections Tags */}
              {assignedCols.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {assignedCols.map((col) => (
                    <span
                      key={col.id}
                      className="px-2 py-0.5 rounded text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1"
                    >
                      <Bookmark className="w-2.5 h-2.5" />
                      <span>{col.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
