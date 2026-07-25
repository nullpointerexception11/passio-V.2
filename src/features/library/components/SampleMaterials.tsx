/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { IMaterial } from '../types/material.types';

interface SampleMaterialsProps {
  materials: IMaterial[];
  lastReadPages: Record<string, number>;
  onSelect: (material: IMaterial) => void;
}

export const SampleMaterials: React.FC<SampleMaterialsProps> = ({
  materials,
  lastReadPages,
  onSelect,
}) => {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-80">
        KÜTÜPHANE KOLEKSİYONU
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((doc) => {
          const savedPage = lastReadPages[doc.id] || 1;
          return (
            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              className="p-6 rounded-2xl border flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-xl group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">
                    {doc.author}
                  </span>
                  {savedPage > 1 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Kaldığı Sayfa: {savedPage}</span>
                    </span>
                  )}
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
