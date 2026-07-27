/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bookmark, Plus, Check, X, Tag } from 'lucide-react';
import { ICollection, ReadingStatus } from '../services/libraryMetadataService';

interface CollectionsFilterBarProps {
  collections: ICollection[];
  selectedCollectionId: string | null;
  selectedStatus: ReadingStatus | null;
  onSelectCollection: (collectionId: string | null) => void;
  onSelectStatus: (status: ReadingStatus | null) => void;
  onCreateCollection: (name: string) => Promise<void>;
  onDeleteCollection?: (id: string) => Promise<void>;
}

export const CollectionsFilterBar: React.FC<CollectionsFilterBarProps> = ({
  collections,
  selectedCollectionId,
  selectedStatus,
  onSelectCollection,
  onSelectStatus,
  onCreateCollection,
  onDeleteCollection,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    await onCreateCollection(newCollectionName.trim());
    setNewCollectionName('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
      {/* All Documents Pill */}
      <button
        onClick={() => {
          onSelectCollection(null);
          onSelectStatus(null);
        }}
        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
          selectedCollectionId === null && selectedStatus === null
            ? 'bg-amber-500 text-white border-amber-500 font-medium shadow-sm'
            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
        }`}
      >
        Tüm Belgeler
      </button>

      {/* Reading Status Filter Pills */}
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

      <button
        onClick={() => onSelectStatus(selectedStatus === 'reading' ? null : 'reading')}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-1 ${
          selectedStatus === 'reading'
            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50 font-medium'
            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
        }`}
      >
        <span>◐</span>
        <span>Okunuyor</span>
      </button>

      <button
        onClick={() => onSelectStatus(selectedStatus === 'finished' ? null : 'finished')}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-1 ${
          selectedStatus === 'finished'
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 font-medium'
            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
        }`}
      >
        <span>●</span>
        <span>Tamamlandı</span>
      </button>

      <button
        onClick={() => onSelectStatus(selectedStatus === 'new' ? null : 'new')}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-1 ${
          selectedStatus === 'new'
            ? 'bg-neutral-500/20 text-neutral-700 dark:text-neutral-300 border-neutral-500/50 font-medium'
            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
        }`}
      >
        <span>○</span>
        <span>Yeni</span>
      </button>

      {/* Collections Chips */}
      {collections.length > 0 && (
        <>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          {collections.map((col) => {
            const isSelected = selectedCollectionId === col.id;
            return (
              <div key={col.id} className="relative group/col flex items-center">
                <button
                  onClick={() => onSelectCollection(isSelected ? null : col.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50 font-medium'
                      : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Bookmark className="w-3 h-3 text-amber-500" />
                  <span>{col.name}</span>
                </button>
                {onDeleteCollection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCollection(col.id);
                    }}
                    className="ml-1 p-1 rounded hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition-opacity"
                    title="Koleksiyonu Sil"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Create Collection Inline Form */}
      <div className="ml-auto">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Koleksiyon adı..."
              autoFocus
              className="px-2.5 py-1 text-xs font-mono rounded-lg border outline-none bg-transparent w-36"
              style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
              title="Kaydet"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="İptal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-dashed flex items-center gap-1 opacity-70 hover:opacity-100 transition-all cursor-pointer hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <Plus className="w-3 h-3" />
            <span>Koleksiyon Ekle</span>
          </button>
        )}
      </div>
    </div>
  );
};
