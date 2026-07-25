/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Bilinmiyor';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
