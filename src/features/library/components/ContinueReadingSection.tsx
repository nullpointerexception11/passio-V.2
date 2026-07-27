/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';
import { IMaterial } from '../types/material.types';
import { formatRelativeTime } from './PdfHoverCard';

export interface IContinueReadingItem {
  material: IMaterial;
  lastReadPage: number;
  totalPages: number;
  lastOpenedAt?: string;
}

interface ContinueReadingSectionProps {
  items: IContinueReadingItem[];
  onSelect: (material: IMaterial, page: number) => void;
}

export const ContinueReadingSection: React.FC<ContinueReadingSectionProps> = ({ items, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-90 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>DEVAM EDEN OKUMALAR</span>
        </h2>
        <span className="text-[10px] font-mono opacity-50">{items.length} Belge</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(({ material, lastReadPage, totalPages, lastOpenedAt }) => {
          const percent = totalPages > 0 ? Math.min(100, Math.round((lastReadPage / totalPages) * 100)) : 0;

          return (
            <div
              key={material.id}
              onClick={() => onSelect(material, lastReadPage)}
              className="p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-lg group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-mono tracking-wider uppercase opacity-50 truncate">
                      {material.author || 'Yazar Belirtilmedi'}
                    </span>
                    <h3 className="font-serif font-medium text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {material.title}
                    </h3>
                  </div>
                </div>

                <button
                  className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 bg-amber-500 text-white border-amber-500 shadow-sm group-hover:scale-105 transition-all shrink-0 cursor-pointer"
                  title="Okumaya Devam Et"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Devam Et</span>
                </button>
              </div>

              {/* Progress & Last Opened */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
                  <span>Sayfa {lastReadPage} / {totalPages} (%{percent})</span>
                  <span>{formatRelativeTime(lastOpenedAt)}</span>
                </div>

                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
