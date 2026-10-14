import { CHAR_MODEL, generate } from '../models/charModel';
import type { PuzzleDef } from './types';

export const TARGET = 'little star';
export const GEN_LENGTH = 11;
export const MAX_PROMPT = 40;

export interface Inside8State {
  prompt: string;
  temperature: number;
  seed: number;
}

export type Inside8Action =
  | { type: 'prompt'; value: string }
  | { type: 'temperature'; value: number }
  | { type: 'reroll' };

export function runInside8(s: Inside8State) {
  return generate(CHAR_MODEL, s.prompt, GEN_LENGTH, { temperature: s.temperature, topK: 0, topP: 1 }, s.seed);
}

export const inside8: PuzzleDef<Inside8State, Inside8Action> = {
  id: 'inside-8',
  instructions: `Using only the prompt and the temperature, make the model write "${TARGET}".`,
  goalText: `Output contains "${TARGET}"`,
  start: () => ({ prompt: 'the', temperature: 1, seed: 7 }),
  apply(state, action) {
    if (action.type === 'reroll') return { ...state, seed: state.seed + 1 };
    if (action.type === 'temperature') {
      return action.value === state.temperature ? state : { ...state, temperature: action.value };
    }
    const prompt = action.value.toLowerCase().slice(0, MAX_PROMPT);
    return prompt === state.prompt ? state : { ...state, prompt };
  },
  conditions: (s) => [
    { label: `The model writes "${TARGET}"`, met: runInside8(s).text.includes(TARGET) },
    { label: 'Your prompt does not contain "star" — the model has to come up with it', met: !s.prompt.includes('star') },
  ],
  par: 2,
  hints: [
    'This model memorized two short rhymes. Which one has "little star" in it?',
    'Start the prompt with the words that come right before "little star" in that rhyme. Then make the model stop gambling.',
    'Use the prompt "twinkle, twinkle, " (with the trailing space) and set temperature to 0.',
  ],
  solution: [
    { type: 'prompt', value: 'twinkle, twinkle, ' },
    { type: 'temperature', value: 0 },
  ],
};
