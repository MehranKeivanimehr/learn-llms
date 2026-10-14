import { describe, expect, it } from 'vitest';
import { VOCAB } from '../../src/models/data/nextTokenData';
import { nextTokenLogits, nextTokenProbs, topPrediction } from '../../src/models/nextToken';

describe('toy next-token model', () => {
  it('predicts Berlin after "The capital of Germany is"', () => {
    expect(topPrediction(['The', 'capital', 'of', 'Germany', 'is'])).toBe('Berlin');
  });
  it('predicts Paris after "The capital of is France"', () => {
    expect(topPrediction(['The', 'capital', 'of', 'is', 'France'])).toBe('Paris');
  });
  it('falls back to the bias with an empty context', () => {
    expect(topPrediction([])).toBe('the');
  });
  it('returns one probability per vocabulary word, summing to 1', () => {
    const p = nextTokenProbs(['I', 'love']);
    expect(p).toHaveLength(VOCAB.length);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });
  it('ignores words it does not know', () => {
    expect(nextTokenLogits(['zzz'])).toEqual(nextTokenLogits([]));
  });
});
