/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLocator } from '../material/MaterialModel';

export type KnowledgeKind = 'annotation' | 'note' | 'insight' | 'reference' | 'highlight';
export type KnowledgeBridgeType = 'highlight' | 'note' | 'annotation' | 'insight';
export type KnowledgeBridgeTypeFilter = 'all' | 'highlight' | 'note' | 'annotation' | 'insight';

/**
 * Core Domain Entity: Knowledge Unit ("Bilgi Parçası")
 * Unified knowledge model connecting Material -> Annotation -> Knowledge -> Writing.
 */
export interface IKnowledgeUnit {
  id: string;
  kind: KnowledgeKind;
  materialId: string;
  materialTitle: string;
  author: string;
  locator?: IKnowledgeLocator;
  pageNumber?: number;
  title?: string;
  content: string;
  tags: string[];
  color?: string;
  annotationId?: string;
  readingNoteId?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Unified model for Knowledge Bridge items combining Highlights & Reading Notes
 */
export interface IKnowledgeBridgeItem {
  id: string;
  type: KnowledgeBridgeType;
  materialId: string;
  materialTitle: string;
  author: string;
  pageNumber: number;
  locator?: IKnowledgeLocator;
  tags: string[];
  title?: string;
  preview: string;
  color?: string;
  createdAt: string;
}

export interface IKnowledgeBridgeFilter {
  query?: string;
  typeFilter?: KnowledgeBridgeTypeFilter;
  tag?: string;
  materialId?: string;
}

export interface IKnowledgeBridgeSearchResult {
  items: IKnowledgeBridgeItem[];
  totalCount: number;
  highlightCount: number;
  noteCount: number;
  availableTags: string[];
}

/**
 * Pure Domain Contract: Knowledge Core Repository
 */
export interface IKnowledgeRepository {
  getAllItems(): Promise<IKnowledgeUnit[]>;
  getItemsByMaterial(materialId: string): Promise<IKnowledgeUnit[]>;
  searchItems(filter: IKnowledgeBridgeFilter): Promise<IKnowledgeBridgeSearchResult>;
}
