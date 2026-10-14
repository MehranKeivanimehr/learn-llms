import { countPairs, merge, toChars, type PairCount } from '../models/tokenizer';
import type { PuzzleDef } from './types';

export const TARGET_TEXT = 'low lower lowest';
export const MAX_TOKENS = 8;
export const MAX_MERGES = 4;

export interface Inside2State {
  tokens: string[];
  merges: [string, string][];
}

export type Inside2Action = { type: 'merge'; pair: [string, string] };

export function candidatePairs(tokens: string[], n = 6): PairCount[] {
  return countPairs(tokens).slice(0, n);
}

export const inside2: PuzzleDef<Inside2State, Inside2Action> = {
  id: 'inside-2',
  instructions: `Choose merges so "${TARGET_TEXT}" fits in ${MAX_TOKENS} tokens or fewer, using at most ${MAX_MERGES} merges.`,
  goalText: `${MAX_TOKENS} tokens or fewer, with ${MAX_MERGES} merges or fewer`,
  start: () => ({ tokens: toChars(TARGET_TEXT), merges: [] }),
  apply(state, action) {
    if (state.merges.length >= MAX_MERGES) return state;
    const next = merge(state.tokens, action.pair);
    if (next.length === state.tokens.length) return state;
    return { tokens: next, merges: [...state.merges, action.pair] };
  },
  conditions: (s) => [
    { label: `At most ${MAX_TOKENS} tokens (now ${s.tokens.length})`, met: s.tokens.length <= MAX_TOKENS },
    { label: `At most ${MAX_MERGES} merges used (now ${s.merges.length})`, met: s.merges.length <= MAX_MERGES },
  ],
  par: 3,
  hints: [
    'Merging the most common pair first usually saves the most tokens.',
    '"l" followed by "o" appears three times. Start there.',
    'Merge l+o, then lo+w, then low+e.',
  ],
  solution: [
    { type: 'merge', pair: ['l', 'o'] },
    { type: 'merge', pair: ['lo', 'w'] },
    { type: 'merge', pair: ['low', 'e'] },
  ],
};
