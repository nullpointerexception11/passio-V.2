import { describe, it, expect, vi } from 'vitest';
import PdfEngine from './PdfService';

// Mock pdfjs-dist as it requires browser environment
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
}));

describe('PdfService', () => {
  it('should cache text content', async () => {
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({ items: [] }),
    } as any;

    // First call
    const result1 = await PdfEngine.getCachedTextContent(mockPage);
    
    // Second call
    const result2 = await PdfEngine.getCachedTextContent(mockPage);

    expect(result1).toBe(result2);
    expect(mockPage.getTextContent).toHaveBeenCalledTimes(1);
  });
});
