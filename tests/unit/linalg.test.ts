import { describe, expect, it } from 'vitest';
import { addVec, dot, matmul, norm, scaleVec, subVec, transpose, vecMat, zeros } from '../../src/models/linalg';

describe('linalg', () => {
  it('dot multiplies and sums', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
  });
  it('dot rejects mismatched lengths', () => {
    expect(() => dot([1], [1, 2])).toThrow(/Length mismatch/);
  });
  it('adds, subtracts and scales vectors', () => {
    expect(addVec([1, 2], [3, 4])).toEqual([4, 6]);
    expect(subVec([1, 2], [3, 4])).toEqual([-2, -2]);
    expect(scaleVec([1, -2], 3)).toEqual([3, -6]);
  });
  it('norm is the Euclidean length', () => {
    expect(norm([3, 4])).toBe(5);
  });
  it('transpose swaps rows and columns', () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    expect(transpose([])).toEqual([]);
  });
  it('matmul multiplies matrices', () => {
    expect(matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
  });
  it('vecMat multiplies a row vector by a matrix', () => {
    expect(vecMat([1, 2], [[1, 0, 2], [0, 1, 3]])).toEqual([1, 2, 8]);
  });
  it('zeros makes a zero vector', () => {
    expect(zeros(3)).toEqual([0, 0, 0]);
  });
});
