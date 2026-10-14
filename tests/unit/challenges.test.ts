import { describe, expect, it } from 'vitest';
import { challenges } from '../../src/challenges/registry';
import { runTests } from '../../src/engine/runChallenge';

// A deliberately wrong solution for every challenge. Each must fail at least one test.
const wrong: Record<string, string> = {
  'inside-1': 'function argmax(probs) { return 0; }',
  'inside-2': 'function merge(tokens, pair) { return tokens; }',
  'inside-3': 'function cosineSimilarity(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }',
  'inside-4':
    'function softmax(logits, t) { const m = Math.max(...logits); const e = logits.map((l) => Math.exp(l - m)); const s = e.reduce((a, b) => a + b, 0); return e.map((x) => x / s); }',
  'inside-8': 'function generate(model, prompt, n) { return prompt; }',
  'inside-7':'function addAndNorm(x, s) { return x.map((v, i) => v + s[i]); }',
  'inside-6':
    'function positionalEncoding(pos, d) { const out = []; for (let i = 0; i < d / 2; i++) { const a = pos / Math.pow(10000, (2 * i) / d); out.push(Math.cos(a), Math.sin(a)); } return out; }',
  'inside-5':
    'function attention(q, keys, values) { const s = keys.map((k) => k.reduce((a, kj, j) => a + kj * q[j], 0)); const m = Math.max(...s); const e = s.map((x) => Math.exp(x - m)); const t = e.reduce((a, b) => a + b, 0); const out = new Array(values[0].length).fill(0); e.forEach((x, i) => values[i].forEach((v, j) => (out[j] += (x / t) * v))); return out; }',
};

describe('code challenges', () => {
  it('every challenge has a wrong implementation to check its tests against', () => {
    for (const id of Object.keys(challenges)) {
      expect(wrong[id], `missing wrong implementation for ${id}`).toBeTypeOf('string');
    }
  });

  for (const [key, def] of Object.entries(challenges)) {
    describe(def.id, () => {
      it('is registered under its own id', () => {
        expect(key).toBe(def.id);
      });
      it('reference solution passes every test', () => {
        const failed = runTests(def.reference, def.functionName, def.tests).filter((r) => !r.passed);
        expect(failed).toEqual([]);
      });
      it('a wrong solution fails at least one test', () => {
        expect(runTests(wrong[def.id], def.functionName, def.tests).some((r) => !r.passed)).toBe(true);
      });
      it('starter code does not already pass', () => {
        expect(runTests(def.starterCode, def.functionName, def.tests).every((r) => r.passed)).toBe(false);
      });
    });
  }
});
