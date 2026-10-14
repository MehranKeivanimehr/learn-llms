import { describe, expect, it } from 'vitest';
import { allPuzzleDefs } from '../../src/puzzles/defs';
import { isSolved } from '../../src/puzzles/types';

describe('puzzle definitions', () => {
  it('have unique ids', () => {
    const ids = allPuzzleDefs.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const def of allPuzzleDefs) {
    describe(def.id, () => {
      it('does not start solved', () => {
        expect(isSolved(def, def.start())).toBe(false);
      });
      it('is solved by its reference solution, and every step is a real move', () => {
        let s = def.start();
        for (const action of def.solution) {
          const next = def.apply(s, action);
          expect(next, `action ${JSON.stringify(action)} changed nothing`).not.toBe(s);
          s = next;
        }
        expect(def.conditions(s).filter((c) => !c.met)).toEqual([]);
      });
      it('has a par between 1 and the solution length', () => {
        expect(def.par).toBeGreaterThanOrEqual(1);
        expect(def.solution.length).toBeGreaterThanOrEqual(def.par);
      });
      it('has instructions, a goal and hints', () => {
        expect(def.instructions.length).toBeGreaterThan(0);
        expect(def.goalText.length).toBeGreaterThan(0);
        expect(def.hints.length).toBeGreaterThan(0);
      });
      it('returns a fresh start state each time', () => {
        expect(def.start()).not.toBe(def.start());
      });
    });
  }
});
