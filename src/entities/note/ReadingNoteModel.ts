/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKnowledgeLocator } from '../material/MaterialModel';

/**
 * Reading Note Entity Model
 * Represents a discrete thought, insight, or annotation created during reading.
 */
export interface IReadingNote {
  id: string;
  materialId: string; // Document/Source ID
  title: string;      // Optional note title
  content: string;    // Plain text content
  tags: string[];     // Categorization tags
  locator?: IKnowledgeLocator;
  createdAt: string;  // ISO string timestamp
  updatedAt: string;  // ISO string timestamp
}

export interface INoteFilter {
  query?: string;
  tag?: string;
}

/**
 * Pure Domain Contract: Reading Note Repository
 */
export interface IReadingNoteRepository {
  getAllNotes(): Promise<IReadingNote[]>;
  getNotesByMaterial(materialId: string): Promise<IReadingNote[]>;
  saveNote(note: IReadingNote): Promise<IReadingNote>;
  deleteNote(id: string): Promise<void>;
}
