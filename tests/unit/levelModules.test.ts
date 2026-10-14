import { describe, expect, it } from 'vitest';
import { levelModules } from '../../src/arcade/levelModules';
import { allPuzzleDefs } from '../../src/puzzles/defs';

describe('level modules', () => {
  it('has a loader for every puzzle and nothing else', () => {
    expect(Object.keys(levelModules).sort()).toEqual(allPuzzleDefs.map((d) => d.id).sort());
  });
  for (const def of allPuzzleDefs) {
    it(`${def.id} loads its definition, scene and commands`, async () => {
      const m = await levelModules[def.id]();
      expect(m.def.id).toBe(def.id);
      expect(typeof m.Scene).toBe('function');
      expect(m.commands.commands.length).toBeGreaterThan(0);
      expect(typeof m.commands.summarize(m.def.start())).toBe('string');
    });
  }
});
