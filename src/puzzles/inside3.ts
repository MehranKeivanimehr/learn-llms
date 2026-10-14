import { analogy, nearest, type Neighbor } from '../models/embeddings';
import type { PuzzleDef } from './types';

export const GRID_SIZE = 8;

/** Word vectors that stay put. */
export const FIXED: Record<string, [number, number]> = {
  man: [1, 1],
  woman: [1, 3],
  king: [4, 1],
  prince: [5, 1],
  apple: [1, 7],
};

/** king − man + woman = (4, 3) */
export const RESULT = analogy(FIXED, 'king', 'man', 'woman') as [number, number];

export interface Inside3State {
  queen: [number, number];
}

export type Inside3Action = { type: 'move'; to: [number, number] };

const clamp = (v: number) => Math.max(0, Math.min(GRID_SIZE, Math.round(v)));

export function rankings(state: Inside3State): Neighbor[] {
  return nearest(RESULT, { queen: state.queen, prince: FIXED.prince, apple: FIXED.apple });
}

function onItsOwnSpot([x, y]: [number, number]): boolean {
  if (x === 0 && y === 0) return false;
  return !Object.values(FIXED).some(([a, b]) => a === x && b === y);
}

export const inside3: PuzzleDef<Inside3State, Inside3Action> = {
  id: 'inside-3',
  instructions: 'Move "queen" so that the nearest word to king − man + woman is "queen".',
  goalText: 'nearest(king − man + woman) = queen',
  start: () => ({ queen: [1, 6] }),
  apply(state, action) {
    const to: [number, number] = [clamp(action.to[0]), clamp(action.to[1])];
    if (to[0] === state.queen[0] && to[1] === state.queen[1]) return state;
    return { queen: to };
  },
  conditions: (s) => [
    { label: 'The nearest word to king − man + woman is "queen"', met: rankings(s)[0].word === 'queen' },
    { label: '"queen" has its own spot (not on another word or the origin)', met: onItsOwnSpot(s.queen) },
  ],
  par: 1,
  hints: [
    'Similarity here is about direction: words pointing the same way from the origin are similar.',
    'The orange dashed arrow shows where king − man + woman points.',
    'Put "queen" right on the end of the orange arrow, at (4, 3).',
  ],
  solution: [{ type: 'move', to: [4, 3] }],
};
