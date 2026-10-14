import { describe, expect, it } from 'vitest';
import { countPairs, decode, encode, merge, toChars, trainBPE } from '../../src/models/tokenizer';

describe('tokenizer', () => {
  it('splits text into characters and shows spaces as _', () => {
    expect(toChars('ab c')).toEqual(['a', 'b', '_', 'c']);
  });
  it('decode turns _ back into spaces', () => {
    expect(decode(['lo', 'w', '_', 'cat'])).toBe('low cat');
  });
  it('merge replaces each adjacent pair, left to right, without overlaps', () => {
    expect(merge(['a', 'b', 'a', 'b'], ['a', 'b'])).toEqual(['ab', 'ab']);
    expect(merge(['a', 'a', 'a'], ['a', 'a'])).toEqual(['aa', 'a']);
    expect(merge(['x', 'y'], ['a', 'b'])).toEqual(['x', 'y']);
    expect(merge(['l', 'o', 'w'], ['o', 'w'])).toEqual(['l', 'ow']);
  });
  it('countPairs sorts by count, ties by first appearance', () => {
    const pairs = countPairs(toChars('low low'));
    expect(pairs[0]).toEqual({ pair: ['l', 'o'], count: 2 });
    expect(pairs[1]).toEqual({ pair: ['o', 'w'], count: 2 });
  });
  it('trainBPE learns the most frequent merges in order', () => {
    expect(trainBPE('low lower lowest', 3)).toEqual([
      ['l', 'o'],
      ['lo', 'w'],
      ['_', 'low'],
    ]);
  });
  it('trainBPE stops when no pair appears twice', () => {
    expect(trainBPE('abc', 5)).toEqual([]);
  });
  it('encode then decode returns the original text', () => {
    const merges = trainBPE('the cat sat on the mat', 6);
    expect(decode(encode('the cat sat on the mat', merges))).toBe('the cat sat on the mat');
  });
});
