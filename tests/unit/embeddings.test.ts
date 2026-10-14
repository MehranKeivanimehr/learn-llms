import { describe, expect, it } from 'vitest';
import { analogy, cosineSimilarity, nearest } from '../../src/models/embeddings';

describe('embeddings', () => {
  it('cosine similarity is 1 for the same direction, 0 for perpendicular, -1 for opposite', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1, 12);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 12);
    expect(cosineSimilarity([1, 2], [-1, -2])).toBeCloseTo(-1, 12);
    expect(cosineSimilarity([3, 4], [4, 3])).toBeCloseTo(0.96, 12);
  });
  it('cosine similarity with a zero vector is 0', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });
  it('analogy computes a - b + c', () => {
    const table = { king: [4, 1], man: [1, 1], woman: [1, 3] };
    expect(analogy(table, 'king', 'man', 'woman')).toEqual([4, 3]);
  });
  it('analogy throws for an unknown word', () => {
    expect(() => analogy({ a: [1] }, 'a', 'b', 'a')).toThrow(/Unknown word: b/);
  });
  it('nearest ranks words by cosine similarity and can exclude words', () => {
    const table = { queen: [4, 3], prince: [5, 1], apple: [1, 7] };
    const ranked = nearest([4, 3], table);
    expect(ranked[0].word).toBe('queen');
    expect(ranked[0].similarity).toBeCloseTo(1, 12);
    expect(nearest([4, 3], table, ['queen'])[0].word).toBe('prince');
  });
});
