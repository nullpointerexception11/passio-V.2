/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Supported Material Source Types in Passio Domain Core
 */
export type MaterialSourceType =
  | 'pdf'
  | 'epub'
  | 'markdown'
  | 'web'
  | 'video'
  | 'audio'
  | 'text'
  | 'custom';

/**
 * Source Location Anchor (Polymorphic Locator)
 */
export interface IKnowledgeLocator {
  pageNumber?: number;
  rects?: Array<{ x: number; y: number; width: number; height: number }>;
  timestampSeconds?: number;
  lineRange?: { start: number; end: number };
  elementId?: string;
  chapterId?: string;
  textOffset?: { start: number; end: number };
}

/**
 * Domain Material Metadata
 */
export interface IMaterialMetadata {
  publisher?: string;
  isbn?: string;
  url?: string;
  language?: string;
  durationSeconds?: number;
  wordCount?: number;
  [key: string]: unknown;
}

/**
 * Central Domain Entity: Material
 * Represents any readable or consumable content source in Passio.
 * Material only represents the source; knowledge units emerge inside/from Material.
 */
export interface IMaterial {
  id: string; // Unique document/resource ID
  title: string;
  author: string;
  description?: string;
  sourceType: MaterialSourceType;
  fileType?: 'pdf' | 'epub' | 'txt' | 'custom'; // Backwards compatibility
  fileSize?: string;
  pageCount?: number;
  lastReadLocation?: IKnowledgeLocator;
  lastReadPage?: number; // Backwards compatibility
  lastReadAt?: string;
  tags?: string[];
  isCustom?: boolean;
  metadata?: IMaterialMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Active session state when rendering a material
 */
export interface IMaterialActiveSession {
  docId: string;
  title: string;
  buffer?: ArrayBuffer;
  url?: string;
  targetPage?: number;
  targetLocator?: IKnowledgeLocator;
}

/**
 * Pure Domain Contract: Material Repository
 */
export interface IMaterialRepository {
  getById(id: string): Promise<IMaterial | null>;
  save(material: IMaterial): Promise<void>;
  getAll(): Promise<IMaterial[]>;
  updateLastReadPage(id: string, pageNumber: number): Promise<void>;
  delete(id: string): Promise<void>;
}
