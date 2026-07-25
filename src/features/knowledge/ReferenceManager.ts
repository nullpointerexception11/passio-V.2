/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../infrastructure/logger/Logger';

export interface INotebookReference {
  id: string;
  notebookId: string;
  knowledgeItemId: string;
  materialTitle: string;
  pageNumber: number;
  addedAt: string;
}

class ReferenceManagerService {
  private referencesMap: Map<string, INotebookReference[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('passio_notebook_references');
      if (stored) {
        const parsed: Record<string, INotebookReference[]> = JSON.parse(stored);
        Object.entries(parsed).forEach(([nbId, refs]) => {
          this.referencesMap.set(nbId, refs);
        });
      }
    } catch (err) {
      Logger.warn('ReferenceManager', 'Failed to load notebook references from storage', err);
    }
  }

  private saveToStorage(): void {
    try {
      const obj: Record<string, INotebookReference[]> = {};
      this.referencesMap.forEach((refs, nbId) => {
        obj[nbId] = refs;
      });
      localStorage.setItem('passio_notebook_references', JSON.stringify(obj));
    } catch (err) {
      Logger.error('ReferenceManager', 'Failed to persist notebook references to storage', err);
    }
  }

  public addReference(notebookId: string, knowledgeItemId: string, materialTitle: string, pageNumber: number): INotebookReference {
    const refs = this.referencesMap.get(notebookId) || [];
    
    const existing = refs.find(r => r.knowledgeItemId === knowledgeItemId);
    if (existing) {
      return existing;
    }

    const newRef: INotebookReference = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      notebookId,
      knowledgeItemId,
      materialTitle,
      pageNumber,
      addedAt: new Date().toISOString(),
    };

    refs.push(newRef);
    this.referencesMap.set(notebookId, refs);
    this.saveToStorage();

    Logger.info('ReferenceManager', `Recorded reference [${knowledgeItemId}] for notebook [${notebookId}]`);
    return newRef;
  }

  public getReferences(notebookId: string): INotebookReference[] {
    return this.referencesMap.get(notebookId) || [];
  }

  public getReferencesForNotebook(notebookId: string): INotebookReference[] {
    return this.getReferences(notebookId);
  }
}

export const ReferenceManager = new ReferenceManagerService();
export default ReferenceManager;
