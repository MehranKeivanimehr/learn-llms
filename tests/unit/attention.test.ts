import { describe, expect, it } from 'vitest';
import { attend, attentionWeights, selfAttention } from '../../src/models/attention';
import { positionalEncoding } from '../../src/models/positional';

const close = (a: number[], b: number[], tol = 1e-6) =>
  a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tol);
const I2 = [[1, 0], [0, 1]];

describe('attention', () => {
  it('gives equal weight to identical keys', () => {
    expect(close(attentionWeights([1, 1], [[1, 0], [1, 0]]), [0.5, 0.5])).toBe(true);
  });
  it('scales scores by 1/sqrt(d) before the softmax', () => {
    const { weights, output } = attend([1, 0], [[1, 0], [0, 1]], [[1, 2], [3, 4]]);
    expect(close(weights, [0.669762, 0.330238], 1e-5)).toBe(true);
    expect(close(output, [1.660477, 2.660477], 1e-5)).toBe(true);
  });
  it('a single key returns its value', () => {
    expect(attend([5, 5], [[1, 1]], [[7, 8]]).output).toEqual([7, 8]);
  });
  it('self-attention with a causal mask only looks backwards', () => {
    const X = [[1, 0], [0, 1]];
    const causal = selfAttention(X, { Wq: I2, Wk: I2, Wv: I2 }, true);
    expect(causal.weights[0]).toEqual([1, 0]);
    expect(causal.output[0]).toEqual([1, 0]);
    const full = selfAttention(X, { Wq: I2, Wk: I2, Wv: I2 });
    expect(close(full.weights[0], [0.669762, 0.330238], 1e-5)).toBe(true);
  });
});

describe('positionalEncoding', () => {
  it('position 0 is sin(0)=0 and cos(0)=1 in every pair', () => {
    expect(positionalEncoding(0, 4)).toEqual([0, 1, 0, 1]);
  });
  it('matches the sinusoidal formula', () => {
    expect(close(positionalEncoding(1, 2), [0.841471, 0.540302], 1e-6)).toBe(true);
    expect(close(positionalEncoding(2, 4), [0.909297, -0.416147, 0.019999, 0.9998], 1e-6)).toBe(true);
  });
});
