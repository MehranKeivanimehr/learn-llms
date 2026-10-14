import { describe, expect, it } from 'vitest';
import { addAndNorm, layerNorm, linear, mlp, relu, runPipeline, transformerBlock, type BlockParams } from '../../src/models/block';

const close = (a: number[], b: number[], tol = 1e-6) =>
  a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tol);
const matClose = (a: number[][], b: number[][], tol = 1e-9) =>
  a.length === b.length && a.every((row, i) => close(row, b[i], tol));

const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const params: BlockParams = {
  attention: { Wq: I3, Wk: I3, Wv: [[0, 1, 0], [1, 0, 0], [0, 0, 1]] },
  mlp: {
    W1: [[1, 0, -1], [0, 1, 0], [1, 0, 1]],
    b1: [0, 0, 0],
    W2: [[1, 0, 0], [0, -1, 0], [0, 0, 0.5]],
    b2: [0, 0.1, 0],
  },
};
const X = [[1, 0, 0], [0, 2, 1]];

describe('block pieces', () => {
  it('layerNorm gives mean 0 and variance ~1', () => {
    expect(close(layerNorm([1, 2, 3]), [-1.2247357, 0, 1.2247357])).toBe(true);
  });
  it('layerNorm of a constant vector is all zeros', () => {
    expect(layerNorm([5, 5, 5])).toEqual([0, 0, 0]);
  });
  it('layerNorm applies gamma and beta', () => {
    expect(close(layerNorm([1, 3], [2, 2], [1, 1]), [-1, 3], 1e-4)).toBe(true);
  });
  it('relu zeroes negatives', () => {
    expect(relu([-1, 0, 2])).toEqual([0, 0, 2]);
  });
  it('linear multiplies and adds a bias', () => {
    expect(linear([1, 2], [[1, 0], [0, 1]], [1, 1])).toEqual([2, 3]);
  });
  it('mlp is linear → relu → linear', () => {
    expect(mlp([2], { W1: [[1, -1]], b1: [0, 0], W2: [[1], [1]], b2: [0.5] })).toEqual([2.5]);
  });
  it('addAndNorm adds the residual before normalizing', () => {
    expect(close(addAndNorm([1, 1], [1, 3]), [-1, 1], 1e-4)).toBe(true);
  });
});

describe('transformer block', () => {
  it('runPipeline in the correct order equals transformerBlock', () => {
    const goal = transformerBlock(X, params);
    expect(matClose(runPipeline(X, ['attention', 'addnorm', 'mlp', 'addnorm'], params), goal)).toBe(true);
  });
  it('a different order gives a different output', () => {
    const goal = transformerBlock(X, params);
    expect(matClose(runPipeline(X, ['mlp', 'addnorm', 'attention', 'addnorm'], params), goal, 1e-6)).toBe(false);
    expect(matClose(runPipeline(X, ['attention', 'mlp', 'addnorm', 'addnorm'], params), goal, 1e-6)).toBe(false);
  });
  it('an addnorm with nothing pending just normalizes the stream', () => {
    const out = runPipeline(X, ['addnorm'], params);
    expect(matClose(out, X.map((r) => layerNorm(r)))).toBe(true);
  });
});
