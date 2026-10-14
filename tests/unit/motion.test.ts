import { describe, expect, it } from 'vitest';
import { easeOutCubic, lerp, lerpArray } from '../../src/motion/tween';

describe('tween math', () => {
  it('easeOutCubic starts at 0, ends at 1 and only rises', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    let prev = 0;
    for (let t = 0.1; t <= 1; t += 0.1) {
      const v = easeOutCubic(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
  it('lerp blends two numbers', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });
  it('lerpArray blends element-wise', () => {
    expect(lerpArray([0, 10], [10, 20], 0.5)).toEqual([5, 15]);
  });
  it('lerpArray jumps to the target when lengths differ', () => {
    const target = [1, 2, 3];
    const out = lerpArray([0], target, 0.5);
    expect(out).toEqual([1, 2, 3]);
    expect(out).not.toBe(target);
  });
});
