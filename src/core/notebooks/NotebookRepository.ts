/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db/connection';
import { Logger } from '../logger/Logger';
import { 
  INotebook, 
  NotebookType, 
  DEFAULT_NOTEBOOK_SETTINGS, 
  DBNotebookRow 
} from './NotebookModel';

class NotebookRepositoryService {
  /**
   * Helper to map raw DB row to domain INotebook
   */
  private mapRowToDomain(row: DBNotebookRow): INotebook {
    let settings = DEFAULT_NOTEBOOK_SETTINGS;
    const rawSettingsJson = row.settings_json || row.settingsJson || '{}';
    try {
      settings = { ...DEFAULT_NOTEBOOK_SETTINGS, ...JSON.parse(rawSettingsJson) };
    } catch {
      settings = DEFAULT_NOTEBOOK_SETTINGS;
    }

    return {
      metadata: {
        id: row.id,
        title: row.title || 'İsimsiz Defter',
        type: (row.type as NotebookType) || 'serbest',
        wordCount: row.word_count ?? row.wordCount ?? 0,
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
      },
      content: {
        text: row.content || '',
      },
      settings,
    };
  }

  /**
   * Fetches all notebooks sorted by updatedAt desc
   */
  async getAllNotebooks(): Promise<INotebook[]> {
    try {
      Logger.debug('NotebookRepository', 'Fetching all notebooks');
      const rows = await db.select<DBNotebookRow>('notebooks');
      
      // If empty, seed initial sample notebooks for a clean first impression
      if (rows.length === 0) {
        return await this.seedInitialNotebooks();
      }

      const domainItems = rows.map(r => this.mapRowToDomain(r));
      return domainItems.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      );
    } catch (err) {
      Logger.error('NotebookRepository', 'Failed to fetch notebooks', err);
      return [];
    }
  }

  /**
   * Seed initial sample notebooks
   */
  private async seedInitialNotebooks(): Promise<INotebook[]> {
    Logger.info('NotebookRepository', 'Seeding initial sample notebooks...');
    const now = new Date().toISOString();
    
    const sample1: INotebook = {
      metadata: {
        id: 'nb-sample-deneme',
        title: 'Sessizlik ve Yazı Üzerine Notlar',
        type: 'deneme',
        wordCount: 84,
        createdAt: now,
        updatedAt: now,
      },
      content: {
        text: 'Yazıhane, zihnin gürültüden arındığı yerdir. Buraya sadece düşünceler girmeli, kalabalık değil.\n\n"Sessizlik, kelimelerin kök saldığı topraktır."',
      },
      settings: DEFAULT_NOTEBOOK_SETTINGS,
    };

    const sample2: INotebook = {
      metadata: {
        id: 'nb-sample-gunluk',
        title: 'Okuma ve Düşünce Günlüğü',
        type: 'gunluk',
        wordCount: 42,
        createdAt: now,
        updatedAt: now,
      },
      content: {
        text: 'Bugün Dostoyevski okurken altını çizdiğim paragraflar üzerine düşündüm. İnsanın kendi iç derinlikleri en zor keşfedilen coğrafya.',
      },
      settings: DEFAULT_NOTEBOOK_SETTINGS,
    };

    await this.saveNotebook(sample1);
    await this.saveNotebook(sample2);

    return [sample1, sample2];
  }

  /**
   * Fetches a notebook by ID
   */
  async getNotebookById(id: string): Promise<INotebook | null> {
    try {
      const rows = await db.select<DBNotebookRow>('notebooks', { id });
      if (rows.length === 0) return null;
      return this.mapRowToDomain(rows[0]);
    } catch (err) {
      Logger.error('NotebookRepository', `Failed to fetch notebook [${id}]`, err);
      return null;
    }
  }

  /**
   * Saves or updates a notebook
   */
  async saveNotebook(notebook: INotebook): Promise<void> {
    try {
      const dbRow: Record<string, unknown> = {
        id: notebook.metadata.id,
        title: notebook.metadata.title,
        type: notebook.metadata.type,
        content: notebook.content.text,
        word_count: notebook.metadata.wordCount,
        settings_json: JSON.stringify(notebook.settings),
        created_at: notebook.metadata.createdAt,
        updated_at: notebook.metadata.updatedAt,
      };

      const existing = await this.getNotebookById(notebook.metadata.id);
      if (existing) {
        await db.update('notebooks', dbRow, { id: notebook.metadata.id });
        Logger.debug('NotebookRepository', `Updated notebook [${notebook.metadata.id}]`);
      } else {
        await db.insert('notebooks', dbRow);
        Logger.debug('NotebookRepository', `Inserted new notebook [${notebook.metadata.id}]`);
      }
    } catch (err) {
      Logger.error('NotebookRepository', `Failed to save notebook [${notebook.metadata.id}]`, err);
    }
  }

  /**
   * Deletes a notebook
   */
  async deleteNotebook(id: string): Promise<void> {
    try {
      await db.delete('notebooks', { id });
      Logger.debug('NotebookRepository', `Deleted notebook [${id}]`);
    } catch (err) {
      Logger.error('NotebookRepository', `Failed to delete notebook [${id}]`, err);
    }
  }
}

export const NotebookRepository = new NotebookRepositoryService();
export default NotebookRepository;
