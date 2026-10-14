import type { PuzzleModule } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPuzzleModule = PuzzleModule<any, any>;

/**
 * Each level's puzzle is loaded on demand, so a page only downloads its own stage
 * (and, for level 8, the model weights).
 */
export const puzzleLoaders: Record<string, () => Promise<AnyPuzzleModule>> = {
  'inside-1': async () => ({ def: (await import('./inside1')).inside1, Stage: (await import('./Inside1Stage')).default }),
  'inside-2': async () => ({ def: (await import('./inside2')).inside2, Stage: (await import('./Inside2Stage')).default }),
  'inside-3': async () => ({ def: (await import('./inside3')).inside3, Stage: (await import('./Inside3Stage')).default }),
  'inside-4': async () => ({ def: (await import('./inside4')).inside4, Stage: (await import('./Inside4Stage')).default }),
  'inside-5': async () => ({ def: (await import('./inside5')).inside5, Stage: (await import('./Inside5Stage')).default }),
  'inside-6': async () => ({ def: (await import('./inside6')).inside6, Stage: (await import('./Inside6Stage')).default }),
  'inside-7': async () => ({ def: (await import('./inside7')).inside7, Stage: (await import('./Inside7Stage')).default }),
  'inside-8': async () => ({ def: (await import('./inside8')).inside8, Stage: (await import('./Inside8Stage')).default }),
};
