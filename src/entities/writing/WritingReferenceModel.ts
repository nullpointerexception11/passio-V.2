/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLocator } from '../material/MaterialModel';

/**
 * Domain Entity: Writing Reference
 * Connects Knowledge Units & Materials to Writing Notebooks in Yazıhane.
 */
export interface IWritingReference {
  id: string;
  notebookId: string;
  knowledgeUnitId?: string;
  materialId: string;
  materialTitle: string;
  author: string;
  locator?: IKnowledgeLocator;
  quotedText: string;
  citationText: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pure Domain Contract: Writing Reference Repository
 */
export interface IWritingReferenceRepository {
  getByNotebookId(notebookId: string): Promise<IWritingReference[]>;
  save(reference: IWritingReference): Promise<IWritingReference>;
  delete(id: string): Promise<void>;
}
