import { statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { forward, paramsFromWeights } from '../../scripts/lib/charModelTrain';
import { CHAR_MODEL, encodeText, generate, lastLogits } from '../../src/models/charModel';

const greedy = { temperature: 0, topK: 0, topP: 1 };

describe('browser character model', () => {
  it('matches the training forward pass exactly', () => {
    const ids = encodeText(CHAR_MODEL, 'twinkle, twinkle');
    expect(ids).toHaveLength(16);
    const V = CHAR_MODEL.vocab.length;
    const train = forward(paramsFromWeights(CHAR_MODEL), ids);
    const lastRow = Array.from(train.data.subarray((ids.length - 1) * V, ids.length * V));
    const browser = lastLogits(CHAR_MODEL, ids);
    browser.forEach((v, i) => expect(v).toBeCloseTo(lastRow[i], 9));
  });
  it('continues the rhymes it learned', () => {
    expect(generate(CHAR_MODEL, 'twinkle, twinkle, ', 11, greedy, 1).text).toBe('little star');
    expect(generate(CHAR_MODEL, 'mary had a little ', 4, greedy, 1).text).toBe('lamb');
  });
  it('lower-cases input and drops characters it does not know', () => {
    expect(encodeText(CHAR_MODEL, 'TWINKLE 🌟')).toEqual(encodeText(CHAR_MODEL, 'twinkle '));
  });
  it('can start from an empty prompt', () => {
    expect(generate(CHAR_MODEL, '', 5, greedy, 1).text).toHaveLength(5);
  });
  it('is reproducible for a given seed', () => {
    const s = { temperature: 1, topK: 0, topP: 1 };
    expect(generate(CHAR_MODEL, 'the ', 20, s, 42).text).toBe(generate(CHAR_MODEL, 'the ', 20, s, 42).text);
  });
  it('ships a weights file under 500 KB', () => {
    expect(statSync('src/models/weights/char-model.json').size).toBeLessThan(500_000);
  });
});
