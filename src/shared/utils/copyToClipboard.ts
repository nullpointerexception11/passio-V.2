/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sanitizes raw PDF text selection to fix line-breaks and extra hyphenations
 */
export function sanitizePdfText(text: string): string {
  if (!text) return '';
  return text
    // Fix hyphenated line breaks e.g. "met-\nin" -> "metin"
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    // Convert multiple line breaks / tabs to single clean spaces or newlines
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Robust copy-to-clipboard function with automatic iframe fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const sanitized = sanitizePdfText(text);
  if (!sanitized) return false;

  // 1. Primary Modern API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(sanitized);
      return true;
    } catch {
      // Fallback below if permission denied or iframe sandboxed
    }
  }

  // 2. Fallback for iFrame or older browser environments
  try {
    const textArea = document.createElement('textarea');
    textArea.value = sanitized;
    // Hide off-screen
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
