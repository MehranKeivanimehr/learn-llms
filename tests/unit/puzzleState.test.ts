import { describe, expect, it } from 'vitest';
import { currentState, hostReducer, initHost } from '../../src/engine/puzzleState';
import type { PuzzleDef } from '../../src/puzzles/types';

type Action = 'inc' | 'noop';
const counter: PuzzleDef<{ n: number }, Action> = {
  id: 'counter',
  instructions: 'Count to 2.',
  goalText: 'n = 2',
  start: () => ({ n: 0 }),
  apply: (s, a) => (a === 'inc' ? { n: s.n + 1 } : s),
  conditions: (s) => [{ label: 'n is 2', met: s.n === 2 }],
  par: 2,
  hints: ['Press inc.', 'Press it twice.'],
  solution: ['inc', 'inc'],
};
const reduce = hostReducer(counter);

describe('host reducer', () => {
  it('counts real moves and ignores no-ops', () => {
    let h = initHost(counter);
    h = reduce(h, { type: 'act', action: 'inc' });
    h = reduce(h, { type: 'act', action: 'noop' });
    expect(currentState(h)).toEqual({ n: 1 });
    expect(h.moves).toBe(1);
  });
  it('undo steps back and does nothing at the start', () => {
    let h = initHost(counter);
    expect(reduce(h, { type: 'undo' })).toBe(h);
    h = reduce(h, { type: 'act', action: 'inc' });
    h = reduce(h, { type: 'undo' });
    expect(currentState(h)).toEqual({ n: 0 });
    expect(h.moves).toBe(0);
  });
  it('reset restarts but keeps revealed hints', () => {
    let h = initHost(counter);
    h = reduce(h, { type: 'hint' });
    h = reduce(h, { type: 'act', action: 'inc' });
    h = reduce(h, { type: 'reset' });
    expect(currentState(h)).toEqual({ n: 0 });
    expect(h.moves).toBe(0);
    expect(h.hintsShown).toBe(1);
  });
  it('hints stop at the last one', () => {
    let h = initHost(counter);
    for (let i = 0; i < 5; i++) h = reduce(h, { type: 'hint' });
    expect(h.hintsShown).toBe(2);
  });
  it('ignores learner input during a solution replay, but applies replay steps', () => {
    let h = initHost(counter);
    h = reduce(h, { type: 'act', action: 'inc' });
    h = reduce(h, { type: 'startReplay' });
    expect(currentState(h)).toEqual({ n: 0 });
    expect(h.usedSolution).toBe(true);
    expect(reduce(h, { type: 'act', action: 'inc' })).toBe(h);
    expect(reduce(h, { type: 'undo' })).toBe(h);
    expect(reduce(h, { type: 'reset' })).toBe(h);
    h = reduce(h, { type: 'act', action: 'inc', replay: true });
    expect(currentState(h)).toEqual({ n: 1 });
    h = reduce(h, { type: 'endReplay' });
    h = reduce(h, { type: 'act', action: 'inc' });
    expect(currentState(h)).toEqual({ n: 2 });
  });
  it('demo mode locks input, keeps usedSolution false and resets when it ends', () => {
    let h = initHost(counter);
    h = reduce(h, { type: 'act', action: 'inc' });
    h = reduce(h, { type: 'startDemo' });
    expect(currentState(h)).toEqual({ n: 0 });
    expect(h.replaying).toBe(true);
    expect(h.usedSolution).toBe(false);
    expect(reduce(h, { type: 'act', action: 'inc' })).toBe(h);
    h = reduce(h, { type: 'act', action: 'inc', replay: true });
    h = reduce(h, { type: 'act', action: 'inc', replay: true });
    expect(currentState(h)).toEqual({ n: 2 });
    h = reduce(h, { type: 'endDemo' });
    expect(currentState(h)).toEqual({ n: 0 });
    expect(h.moves).toBe(0);
    expect(h.replaying).toBe(false);
    expect(h.usedSolution).toBe(false);
  });
});
