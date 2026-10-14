import { whoGotHurt, type HurtAnswer } from '../models/order';
import type { PuzzleDef } from './types';

export const CONFIDENCE = 0.8;
export const SENTENCE_A = ['dog', 'bites', 'man'];
export const SENTENCE_B = ['man', 'bites', 'dog'];

export interface Inside6State {
  usePositions: boolean;
  scale: number;
}

export type Inside6Action = { type: 'togglePositions' } | { type: 'scale'; value: number };

function describe(a: HurtAnswer): string {
  return `${a.answer}, ${a.confidence.toFixed(2)}`;
}

export const inside6: PuzzleDef<Inside6State, Inside6Action> = {
  id: 'inside-6',
  instructions: 'Help the model answer "who got hurt?" correctly for both sentences, with confidence of at least 0.80.',
  goalText: 'dog bites man → man · man bites dog → dog',
  start: () => ({ usePositions: false, scale: 1 }),
  apply(state, action) {
    if (action.type === 'togglePositions') return { ...state, usePositions: !state.usePositions };
    if (action.value === state.scale) return state;
    return { ...state, scale: action.value };
  },
  conditions: (s) => {
    const a = whoGotHurt(SENTENCE_A, s.usePositions, s.scale);
    const b = whoGotHurt(SENTENCE_B, s.usePositions, s.scale);
    return [
      {
        label: `"dog bites man" → man, confidence ≥ ${CONFIDENCE.toFixed(2)} (now: ${describe(a)})`,
        met: a.answer === 'man' && a.confidence >= CONFIDENCE,
      },
      {
        label: `"man bites dog" → dog, confidence ≥ ${CONFIDENCE.toFixed(2)} (now: ${describe(b)})`,
        met: b.answer === 'dog' && b.confidence >= CONFIDENCE,
      },
    ];
  },
  par: 2,
  hints: [
    'Without positions, the three words look identical to attention.',
    'Turn on the position signals, then make them stronger.',
    'Turn positions on and set the strength to 3.',
  ],
  solution: [{ type: 'togglePositions' }, { type: 'scale', value: 3 }],
};
