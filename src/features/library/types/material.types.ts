/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MaterialType = 'pdf' | 'epub' | 'text' | 'demo';

export interface IMaterial {
  id: string;
  title: string;
  author?: string;
  description?: string;
  type: MaterialType;
  pageCount?: number;
  fileSize?: string;
  content?: string[];
  createdAt?: number;
  isCustom?: boolean;
}

export interface IMaterialActiveSession {
  docId: string;
  title: string;
  buffer: ArrayBuffer;
  targetPage?: number;
}
