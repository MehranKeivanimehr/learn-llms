import { describe, expect, it } from 'vitest';
import { argmax, distribution, mulberry32, sampleIndex, softmax, topK, topP } from '../../src/models/sampling';

const close = (a: number[], b: number[], tol = 1e-6) =>
  a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tol);

describe('argmax', () => {
  it('returns the index of the largest value, first on ties', () => {
    expect(argmax([0.1, 0.7, 0.2])).toBe(1);
    expect(argmax([0.5, 0.5])).toBe(0);
  });
  it('throws on an empty array', () => {
    expect(() => argmax([])).toThrow();
  });
});

describe('softmax', () => {
  it('sums to 1 and matches known values', () => {
    const p = softmax([1, 2, 3]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(close(p, [0.09003057, 0.24472847, 0.66524096])).toBe(true);
  });
  it('divides logits by the temperature', () => {
    expect(close(softmax([1, 2], 0.5), [0.11920292, 0.88079708])).toBe(true);
  });
  it('is one-hot on the argmax when temperature is 0 or less', () => {
    expect(softmax([1, 3, 2], 0)).toEqual([0, 1, 0]);
  });
  it('is numerically stable for large logits', () => {
    expect(close(softmax([1000, 1000]), [0.5, 0.5])).toBe(true);
  });
  it('returns [] for no logits', () => {
    expect(softmax([])).toEqual([]);
  });
});

describe('topK', () => {
  it('keeps the k most likely tokens and renormalizes', () => {
    expect(close(topK([0.5, 0.3, 0.2], 2), [0.625, 0.375, 0])).toBe(true);
  });
  it('treats k <= 0 or k >= length as "off"', () => {
    expect(topK([0.5, 0.3, 0.2], 0)).toEqual([0.5, 0.3, 0.2]);
    expect(topK([0.5, 0.3, 0.2], 3)).toEqual([0.5, 0.3, 0.2]);
  });
});

describe('topP', () => {
  it('keeps the smallest set whose probability reaches p', () => {
    expect(close(topP([0.5, 0.3, 0.2], 0.7), [0.625, 0.375, 0])).toBe(true);
    expect(close(topP([0.5, 0.3, 0.2], 0.5), [1, 0, 0])).toBe(true);
  });
  it('treats p >= 1 as "off"', () => {
    expect(topP([0.5, 0.3, 0.2], 1)).toEqual([0.5, 0.3, 0.2]);
  });
});

describe('distribution', () => {
  it('applies temperature, then top-k, then top-p', () => {
    const d = distribution([3, 2, 1], { temperature: 1, topK: 1, topP: 1 });
    expect(d).toEqual([1, 0, 0]);
  });
});

describe('mulberry32 and sampleIndex', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  it('always picks a token with all the probability', () => {
    const rand = mulberry32(1);
    for (let i = 0; i < 20; i++) expect(sampleIndex([0, 1, 0], rand)).toBe(1);
  });
  it('samples roughly in proportion to the probabilities', () => {
    const rand = mulberry32(7);
    const counts = [0, 0, 0];
    for (let i = 0; i < 10000; i++) counts[sampleIndex([0.5, 0.3, 0.2], rand)]++;
    expect(Math.abs(counts[0] / 10000 - 0.5)).toBeLessThan(0.03);
    expect(Math.abs(counts[1] / 10000 - 0.3)).toBeLessThan(0.03);
    expect(Math.abs(counts[2] / 10000 - 0.2)).toBeLessThan(0.03);
  });
});
