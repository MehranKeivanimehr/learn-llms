import { CONTEXT, LOGITS, OFF_TOPIC, TOKENS } from '../models/data/sampling4Data';
import { distribution, type SamplerSettings } from '../models/sampling';
import type { PuzzleDef } from './types';

export interface Inside4State {
  settings: SamplerSettings;
  /** Latched: true once the learner has made the output fully predictable. */
  predictable: boolean;
  /** Latched: true once the learner has allowed variety without off-topic tokens. */
  variedOnTopic: boolean;
}

export type Inside4Action = { type: 'temperature' | 'topK' | 'topP'; value: number };

export function isPredictable(dist: number[]): boolean {
  return Math.max(...dist) >= 1 - 1e-12;
}

export function isVariedOnTopic(dist: number[], settings: SamplerSettings): boolean {
  const live = dist.filter((p) => p > 0).length;
  const noOffTopic = TOKENS.every((t, i) => !OFF_TOPIC.has(t) || dist[i] === 0);
  return settings.temperature > 0 && live >= 3 && noOffTopic;
}

export const inside4: PuzzleDef<Inside4State, Inside4Action> = {
  id: 'inside-4',
  instructions: `After "${CONTEXT}…", first make the model completely predictable. Then let it vary — but never say anything silly.`,
  goalText: '1) one token gets 100% · 2) at least 3 sensible tokens possible, no silly ones',
  start: () => ({ settings: { temperature: 1, topK: 0, topP: 1 }, predictable: false, variedOnTopic: false }),
  apply(state, action) {
    if (state.settings[action.type] === action.value) return state;
    const settings: SamplerSettings = { ...state.settings, [action.type]: action.value };
    const dist = distribution(LOGITS, settings);
    return {
      settings,
      predictable: state.predictable || isPredictable(dist),
      variedOnTopic: state.variedOnTopic || isVariedOnTopic(dist, settings),
    };
  },
  conditions: (s) => [
    { label: 'Make the output 100% predictable (one token gets all the probability)', met: s.predictable },
    { label: 'Allow variety: at least 3 possible tokens, none off-topic, temperature above 0', met: s.variedOnTopic },
  ],
  par: 2,
  hints: [
    'Top-k keeps only the k most likely tokens and throws the rest away.',
    'Set top-k to 1 — only one token survives.',
    'Then set top-k to 3: mat, sofa and floor survive, and the silly tokens are cut.',
  ],
  solution: [
    { type: 'topK', value: 1 },
    { type: 'topK', value: 3 },
  ],
};
