import { VOCAB } from '../models/data/nextTokenData';
import { topPrediction } from '../models/nextToken';
import type { PuzzleDef } from './types';

export const MAX_WORDS = 8;

export interface Inside1State {
  context: string[];
}

export type Inside1Action = { type: 'add'; word: string } | { type: 'remove'; index: number };

export const inside1: PuzzleDef<Inside1State, Inside1Action> = {
  id: 'inside-1',
  instructions: 'Edit the context so the model\'s most likely next word is "Paris".',
  goalText: 'Top prediction: Paris',
  start: () => ({ context: ['The', 'capital', 'of', 'Germany', 'is'] }),
  apply(state, action) {
    if (action.type === 'add') {
      if (!VOCAB.includes(action.word) || state.context.length >= MAX_WORDS) return state;
      return { context: [...state.context, action.word] };
    }
    if (action.index < 0 || action.index >= state.context.length) return state;
    return { context: state.context.filter((_, i) => i !== action.index) };
  },
  conditions: (state) => [
    { label: 'The top prediction is "Paris"', met: state.context.length > 0 && topPrediction(state.context) === 'Paris' },
    { label: `The context has at most ${MAX_WORDS} words`, met: state.context.length <= MAX_WORDS },
  ],
  par: 2,
  hints: [
    'Which word in the context is pulling the model toward "Berlin"?',
    'Remove "Germany", then add a word that is strongly linked to "Paris".',
    'Remove "Germany", then add "France".',
  ],
  solution: [
    { type: 'remove', index: 3 },
    { type: 'add', word: 'France' },
  ],
};
