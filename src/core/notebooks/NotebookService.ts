/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotebookRepository } from './NotebookRepository';
import { 
  INotebook, 
  NotebookType, 
  INotebookSettings, 
  DEFAULT_NOTEBOOK_SETTINGS 
} from './NotebookModel';
import { Logger } from '../logger/Logger';

class NotebookDomainService {
  /**
   * Helper to count words accurately in text
   */
  public countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    return cleanText.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Retrieves all notebooks for listing
   */
  async getNotebooks(): Promise<INotebook[]> {
    return await NotebookRepository.getAllNotebooks();
  }

  /**
   * Retrieves a single notebook by ID
   */
  async getNotebookById(id: string): Promise<INotebook | null> {
    return await NotebookRepository.getNotebookById(id);
  }

  /**
   * Creates a brand new Notebook
   */
  async createNotebook(title: string, type: NotebookType): Promise<INotebook> {
    Logger.info('NotebookService', `Creating new notebook: "${title}" [${type}]`);
    const now = new Date().toISOString();
    const id = `nb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newNotebook: INotebook = {
      metadata: {
        id,
        title: title.trim() || 'Yeni Defter',
        type,
        wordCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      content: {
        text: '',
      },
      settings: { ...DEFAULT_NOTEBOOK_SETTINGS },
    };

    await NotebookRepository.saveNotebook(newNotebook);
    return newNotebook;
  }

  /**
   * Auto-saves notebook content and updates metadata (wordCount, updatedAt)
   */
  async updateContent(id: string, text: string): Promise<INotebook | null> {
    const notebook = await NotebookRepository.getNotebookById(id);
    if (!notebook) {
      Logger.warn('NotebookService', `Cannot update content: Notebook [${id}] not found`);
      return null;
    }

    const wordCount = this.countWords(text);
    const updatedNotebook: INotebook = {
      ...notebook,
      content: { text },
      metadata: {
        ...notebook.metadata,
        wordCount,
        updatedAt: new Date().toISOString(),
      },
    };

    await NotebookRepository.saveNotebook(updatedNotebook);
    Logger.debug('NotebookService', `Auto-saved content for notebook [${id}] (${wordCount} words)`);
    return updatedNotebook;
  }

  /**
   * Updates notebook settings (font, size, line height, max width)
   */
  async updateSettings(id: string, settings: Partial<INotebookSettings>): Promise<INotebook | null> {
    const notebook = await NotebookRepository.getNotebookById(id);
    if (!notebook) return null;

    const updatedNotebook: INotebook = {
      ...notebook,
      settings: {
        ...notebook.settings,
        ...settings,
      },
      metadata: {
        ...notebook.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    await NotebookRepository.saveNotebook(updatedNotebook);
    Logger.debug('NotebookService', `Updated settings for notebook [${id}]`);
    return updatedNotebook;
  }

  /**
   * Deletes a notebook
   */
  async deleteNotebook(id: string): Promise<void> {
    Logger.info('NotebookService', `Deleting notebook [${id}]`);
    await NotebookRepository.deleteNotebook(id);
  }
}

export const NotebookService = new NotebookDomainService();
export default NotebookService;
