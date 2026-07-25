/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Arama...',
  onClear,
  autoFocus = false,
}) => {
  return (
    <div className="relative w-full flex items-center">
      <Search className="w-4 h-4 absolute left-3 opacity-40 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-mono border bg-transparent transition-all outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
        style={{
          borderColor: 'var(--color-border-subtle)',
          color: 'var(--color-text-primary)',
        }}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-2.5 p-1 rounded-lg opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
