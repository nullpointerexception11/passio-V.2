/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLocator } from '../material/MaterialModel';

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'red';

export interface IHighlightRect {
  x: number;      // 0..1 relative to page viewport width
  y: number;      // 0..1 relative to page viewport height
  width: number;  // 0..1 relative to page viewport width
  height: number; // 0..1 relative to page viewport height
}

/**
 * Knowledge Fragment Model
 * Represents a highlighted text segment extracted from a source document.
 */
export interface IHighlightFragment {
  id: string;
  materialId: string;    // Document/Source ID
  pageNumber: number;
  selectedText: string;
  rects: IHighlightRect[];
  color: HighlightColor;
  createdAt: string;    // ISO Date string
  updatedAt: string;    // ISO Date string
  tags?: string[];
  note?: string;
  locator?: IKnowledgeLocator;
}

export interface IHighlightColorStyle {
  bg: string;
  border: string;
  accentHex: string;
  label: string;
}

export const HIGHLIGHT_COLOR_MAP: Record<HighlightColor, IHighlightColorStyle> = {
  yellow: {
    bg: 'rgba(234, 179, 8, 0.35)',
    border: 'rgba(202, 138, 4, 0.7)',
    accentHex: '#eab308',
    label: 'Sarı',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.35)',
    border: 'rgba(37, 99, 235, 0.7)',
    accentHex: '#3b82f6',
    label: 'Mavi',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.35)',
    border: 'rgba(22, 163, 74, 0.7)',
    accentHex: '#22c55e',
    label: 'Yeşil',
  },
  red: {
    bg: 'rgba(239, 68, 68, 0.35)',
    border: 'rgba(220, 38, 38, 0.7)',
    accentHex: '#ef4444',
    label: 'Kırmızı',
  },
};

/**
 * Pure Domain Contract: Highlight Repository
 */
export interface IHighlightRepository {
  getAllHighlights(): Promise<IHighlightFragment[]>;
  getHighlightsByMaterial(materialId: string): Promise<IHighlightFragment[]>;
  saveHighlight(fragment: IHighlightFragment): Promise<IHighlightFragment>;
  deleteHighlight(id: string): Promise<void>;
}
