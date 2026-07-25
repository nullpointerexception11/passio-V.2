/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLocator } from '../material/MaterialModel';

export type AnnotationType = 'highlight' | 'excerpt' | 'bookmark' | 'audio_clip' | 'timestamp' | 'note';

/**
 * Domain Entity: Annotation
 * Represents an extracted fragment, excerpt, highlight, or bookmark anchored in a Material.
 */
export interface IAnnotation {
  id: string;
  materialId: string;
  type: AnnotationType;
  locator: IKnowledgeLocator;
  content: string; // The selected text, transcript, or content snippet
  note?: string; // Optional user reflection attached to this annotation
  color?: string; // Color code/tag
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Pure Domain Contract: Annotation Repository
 */
export interface IAnnotationRepository {
  getByMaterialId(materialId: string): Promise<IAnnotation[]>;
  save(annotation: IAnnotation): Promise<IAnnotation>;
  delete(id: string): Promise<void>;
}
