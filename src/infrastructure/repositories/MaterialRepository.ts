/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IMaterial, IMaterialRepository } from '../../entities/material/MaterialModel';
import { IStorageAdapter } from '../storage/StorageAdapter';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';

export class MaterialRepository implements IMaterialRepository {
  private adapter: IStorageAdapter<IMaterial>;

  constructor(adapter?: IStorageAdapter<IMaterial>) {
    this.adapter = adapter || new LocalStorageAdapter<IMaterial>('passio_materials_');
  }

  async getById(id: string): Promise<IMaterial | null> {
    return this.adapter.get(id);
  }

  async save(material: IMaterial): Promise<void> {
    await this.adapter.set(material.id, material);
  }

  async getAll(): Promise<IMaterial[]> {
    return this.adapter.getAll();
  }

  async updateLastReadPage(id: string, pageNumber: number): Promise<void> {
    const existing = await this.getById(id);
    if (existing) {
      existing.lastReadPage = pageNumber;
      existing.lastReadAt = new Date().toISOString();
      await this.save(existing);
    }
  }

  async delete(id: string): Promise<void> {
    await this.adapter.remove(id);
  }
}

export const materialRepository = new MaterialRepository();
export default MaterialRepository;
