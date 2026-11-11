import { describe, it, expect } from 'vitest';
import { compressImage } from './imageCompressor';

describe('imageCompressor', () => {
  it('should return null or non-image files untouched without crashing', async () => {
    const textFile = new File(['hello world'], 'sample.txt', { type: 'text/plain' });
    const result = await compressImage(textFile);
    expect(result).toBe(textFile);

    const nullResult = await compressImage(null);
    expect(nullResult).toBeNull();
  });
});
