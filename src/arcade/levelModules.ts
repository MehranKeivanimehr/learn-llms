import type { ComponentType } from 'react';
import type { LevelCommandSet } from '../commands/types';
import type { PuzzleDef, StageProps } from '../puzzles/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LevelModule {
  def: PuzzleDef<any, any>;
  Scene: ComponentType<StageProps<any, any>>;
  commands: LevelCommandSet<any, any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Each level's rules, scene and commands load on demand, so a page downloads only its own level. */
export const levelModules: Record<string, () => Promise<LevelModule>> = {
  'inside-1': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside1'), import('../scenes/Inside1Scene'), import('../commands/levels/inside1')]);
    return { def: d.inside1, Scene: s.default, commands: c.inside1Commands };
  },
  'inside-2': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside2'), import('../scenes/Inside2Scene'), import('../commands/levels/inside2')]);
    return { def: d.inside2, Scene: s.default, commands: c.inside2Commands };
  },
  'inside-3': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside3'), import('../scenes/Inside3Scene'), import('../commands/levels/inside3')]);
    return { def: d.inside3, Scene: s.default, commands: c.inside3Commands };
  },
  'inside-4': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside4'), import('../scenes/Inside4Scene'), import('../commands/levels/inside4')]);
    return { def: d.inside4, Scene: s.default, commands: c.inside4Commands };
  },
  'inside-5': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside5'), import('../scenes/Inside5Scene'), import('../commands/levels/inside5')]);
    return { def: d.inside5, Scene: s.default, commands: c.inside5Commands };
  },
  'inside-6': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside6'), import('../scenes/Inside6Scene'), import('../commands/levels/inside6')]);
    return { def: d.inside6, Scene: s.default, commands: c.inside6Commands };
  },
  'inside-7': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside7'), import('../scenes/Inside7Scene'), import('../commands/levels/inside7')]);
    return { def: d.inside7, Scene: s.default, commands: c.inside7Commands };
  },
  'inside-8': async () => {
    const [d, s, c] = await Promise.all([import('../puzzles/inside8'), import('../scenes/Inside8Scene'), import('../commands/levels/inside8')]);
    return { def: d.inside8, Scene: s.default, commands: c.inside8Commands };
  },
};
