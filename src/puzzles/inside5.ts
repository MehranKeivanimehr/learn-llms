import { attentionWeights } from '../models/attention';
import { ANIMAL, KEYS, STREET } from '../models/data/attention5Data';
import type { PuzzleDef } from './types';

export interface Inside5State {
  q: [number, number];
}

export type Inside5Action = { type: 'qx' | 'qy'; value: number };

export function itWeights(q: [number, number]): number[] {
  return attentionWeights(q, KEYS);
}

export const inside5: PuzzleDef<Inside5State, Inside5Action> = {
  id: 'inside-5',
  instructions: 'Tune the query of the word "it" so it pays attention to "animal", not "street".',
  goalText: 'it → animal above 0.50 · it → street below 0.20',
  start: () => ({ q: [0, 1] }),
  apply(state, action) {
    const i = action.type === 'qx' ? 0 : 1;
    if (state.q[i] === action.value) return state;
    const q: [number, number] = [state.q[0], state.q[1]];
    q[i] = action.value;
    return { q };
  },
  conditions: (s) => {
    const w = itWeights(s.q);
    return [
      { label: `"it" → "animal" is above 0.50 (now ${w[ANIMAL].toFixed(2)})`, met: w[ANIMAL] > 0.5 },
      { label: `"it" → "street" is below 0.20 (now ${w[STREET].toFixed(2)})`, met: w[STREET] < 0.2 },
    ];
  },
  par: 2,
  hints: [
    "Each word's score is the dot product of the query with that word's key.",
    '"animal" has key (2, 1) and "street" has key (1, 2). Make x large and y small.',
    'Set query x to 3 and query y to −1.5.',
  ],
  solution: [
    { type: 'qx', value: 3 },
    { type: 'qy', value: -1.5 },
  ],
};
