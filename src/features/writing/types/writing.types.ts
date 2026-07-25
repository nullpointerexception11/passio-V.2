/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INotebook, INotebookSettings } from '../../../core/notebooks/NotebookModel';
import { IKnowledgeBridgeItem } from '../../../entities/knowledge/KnowledgeBridgeModel';
import { INotebookReference } from '../../knowledge/ReferenceManager';

export type KnowledgePanelTab = 'all' | 'highlight' | 'note' | 'annotation';

export interface IWritingEditorState {
  notebook: INotebook;
  contentHtml: string;
  contentText: string;
  wordCount: number;
  readingTimeMinutes: number;
  settings: INotebookSettings;
  saveStatus: 'saved' | 'saving' | 'error';
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isSettingsOpen: boolean;
  references: INotebookReference[];
}
