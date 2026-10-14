import { describe, expect, it } from 'vitest';
import { allPuzzleDefs } from '../../src/puzzles/defs';
import { puzzleLoaders } from '../../src/puzzles/registry';

describe('lazy puzzle registry', () => {
  it('has a loader for every puzzle and nothing else', () => {
    expect(Object.keys(puzzleLoaders).sort()).toEqual(allPuzzleDefs.map((d) => d.id).sort());
  });
  for (const def of allPuzzleDefs) {
    it(`${def.id} loads its own definition and a stage component`, async () => {
      const module = await puzzleLoaders[def.id]();
      expect(module.def.id).toBe(def.id);
      expect(typeof module.Stage).toBe('function');
    });
  }
});
