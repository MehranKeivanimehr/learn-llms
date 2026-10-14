import { describe, expect, it } from 'vitest';
import { whoGotHurt } from '../../src/models/order';

const A = ['dog', 'bites', 'man'];
const B = ['man', 'bites', 'dog'];

describe('who got hurt?', () => {
  it('cannot tell the sentences apart without positions', () => {
    expect(whoGotHurt(A, false, 3).answer).toBe('unsure');
    expect(whoGotHurt(B, false, 3).answer).toBe('unsure');
    expect(whoGotHurt(A, false, 3).weights).toEqual(whoGotHurt(B, false, 3).weights);
  });
  it('answers correctly with strong position signals', () => {
    const a = whoGotHurt(A, true, 3);
    const b = whoGotHurt(B, true, 3);
    expect(a.answer).toBe('man');
    expect(b.answer).toBe('dog');
    expect(a.confidence).toBeGreaterThan(0.8);
    expect(b.confidence).toBeGreaterThan(0.8);
  });
  it('is right but unsure with weak position signals', () => {
    const a = whoGotHurt(A, true, 1);
    expect(a.answer).toBe('man');
    expect(a.confidence).toBeLessThan(0.8);
  });
});
