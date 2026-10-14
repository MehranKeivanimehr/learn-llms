import { describe, expect, it } from 'vitest';
import { inside7, type PieceId } from '../../src/puzzles/inside7';

function placeAll(order: PieceId[]) {
  let s = inside7.start();
  order.forEach((piece, slot) => {
    s = inside7.apply(s, { type: 'place', piece, slot });
  });
  return s;
}

describe('level 7 block puzzle', () => {
  it('a wrong order fills every step but does not match the goal', () => {
    const [filled, matches] = inside7.conditions(placeAll(['mlp', 'norm1', 'attention', 'norm2']));
    expect(filled.met).toBe(true);
    expect(matches.met).toBe(false);
  });
  it('the two Add & Norm pieces are interchangeable', () => {
    const conditions = inside7.conditions(placeAll(['attention', 'norm2', 'mlp', 'norm1']));
    expect(conditions.every((c) => c.met)).toBe(true);
  });
  it('placing a piece that is already placed moves it', () => {
    let s = inside7.apply(inside7.start(), { type: 'place', piece: 'attention', slot: 0 });
    s = inside7.apply(s, { type: 'place', piece: 'attention', slot: 2 });
    expect(s.slots).toEqual([null, null, 'attention', null]);
  });
  it('ignores out-of-range slots', () => {
    const s = inside7.start();
    expect(inside7.apply(s, { type: 'place', piece: 'mlp', slot: 9 })).toBe(s);
  });
});
