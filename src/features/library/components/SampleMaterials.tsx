/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Bookmark } from 'lucide-react';
import { IMaterial } from '../types/material.types';
import { ICollection, ReadingStatus } from '../services/libraryMetadataService';

interface SampleMaterialsProps {
  materials: IMaterial[];
  lastReadPages: Record<string, number>;
  collections: ICollection[];
  docCollectionMap: Record<string, string[]>;
  highlightsMap: Record<string, number>;
  notesMap: Record<string, number>;
  statuses: Record<string, ReadingStatus>;
  lastOpenedMap: Record<string, string>;
  selectedCollectionId: string | null;
  selectedStatus: ReadingStatus | null;
  onSelect: (material: IMaterial) => void;
  onCycleStatus: (docId: string, e?: React.MouseEvent) => void;
  onToggleCollection: (docId: string, collectionId: string, e: React.MouseEvent) => void;
}

export const SampleMaterials: React.FC<SampleMaterialsProps> = ({
  materials,
  lastReadPages,
  collections,
  docCollectionMap,
  highlightsMap,
  notesMap,
  statuses,
  lastOpenedMap,
  selectedCollectionId,
  selectedStatus,
  onSelect,
  onCycleStatus,
  onToggleCollection,
}) => {
  // Filter materials based on selected collection or status
  const filteredMaterials = materials.filter((doc) => {
    const assignedCols = docCollectionMap[doc.id] || [];
    const currentStatus = statuses[doc.id] || 'new';

    if (selectedCollectionId && !assignedCols.includes(selectedCollectionId)) {
      return false;
    }
    if (selectedStatus && currentStatus !== selectedStatus) {
      return false;
    }
    return true;
  });

  if (filteredMaterials.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-80">
        KÜTÜPHANE KOLEKSİYONU
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMaterials.map((doc) => {
          const savedPage = lastReadPages[doc.id] || 1;
          const assignedColIds = docCollectionMap[doc.id] || [];
          const assignedCols = collections.filter((c) => assignedColIds.includes(c.id));
          const currentStatus = statuses[doc.id] || 'new';
          const hCount = highlightsMap[doc.id] || 0;
          const nCount = notesMap[doc.id] || 0;
          const lastOpened = lastOpenedMap[doc.id];

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
              key={doc.id}
              onClick={() => onSelect(doc)}
              className="p-6 rounded-2xl border flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-xl group relative"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-50 truncate">
                    {doc.author}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reading Status Pill (1-click cycle) */}
                    <button
                      onClick={(e) => onCycleStatus(doc.id, e)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${statusInfo.color}`}
                      title="Okuma durumunu değiştirmek için tıklayın"
                    >
                      <span>{statusInfo.symbol}</span>
                      <span>{statusInfo.label}</span>
                    </button>

                    {savedPage > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>S. {savedPage}</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-serif font-medium leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {doc.title}
                </h3>
                <p
                  className="text-xs leading-relaxed opacity-70 line-clamp-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {doc.description}
                </p>

                {/* Collection Tags */}
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

              <div
                className="flex items-center justify-between border-t pt-3.5 mt-2"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="flex items-center gap-3 text-[11px] font-mono opacity-60">
                  <span>{doc.pageCount} Sayfa</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                </div>
                <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Oku</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
