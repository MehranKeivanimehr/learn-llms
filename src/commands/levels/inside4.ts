import { LOGITS, TOKENS } from '../../models/data/sampling4Data';
import { distribution, mulberry32, sampleIndex, type SamplerSettings } from '../../models/sampling';
import type { Inside4Action, Inside4State } from '../../puzzles/inside4';
import { parseNumber } from '../parse';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside4State, Inside4Action>;
type Key = keyof SamplerSettings;

const NAMES: Record<string, Key> = {
  temperature: 'temperature',
  temp: 'temperature',
  't': 'temperature',
  'top-k': 'topK',
  topk: 'topK',
  k: 'topK',
  'top-p': 'topP',
  topp: 'topP',
  p: 'topP',
};

function validate(key: Key, v: number): string | null {
  if (key === 'temperature' && (v < 0 || v > 2)) return 'Temperature must be between 0 and 2.';
  if (key === 'topK' && (!Number.isInteger(v) || v < 0 || v > TOKENS.length)) {
    return `Top-k must be a whole number from 0 (off) to ${TOKENS.length}.`;
  }
  if (key === 'topP' && (v <= 0 || v > 1)) return 'Top-p must be above 0 and at most 1 (1 = off).';
  return null;
}

const set: Cmd = {
  name: 'set',
  usage: 'set <temperature|top-k|top-p> <value>',
  help: 'Change a sampling setting.',
  run(args) {
    if (args.length !== 2) return usageError(set);
    const key = NAMES[args[0].toLowerCase()];
    const v = parseNumber(args[1]);
    if (!key || v === null) return usageError(set);
    const problem = validate(key, v);
    if (problem) return error(problem);
    return actions({ type: key, value: v });
  },
  complete: (i, prefix) => (i === 0 ? ['temperature', 'top-k', 'top-p'].filter((n) => n.startsWith(prefix.toLowerCase())) : []),
};

let sampleSeed = 1;

const sample: Cmd = {
  name: 'sample',
  usage: 'sample [count]',
  help: 'Draw tokens with the current settings (default 10).',
  run(args, s) {
    const n = args.length === 0 ? 10 : Number(args[0]);
    if (!Number.isInteger(n) || n < 1 || n > 50) return error('Count must be a whole number from 1 to 50.');
    const dist = distribution(LOGITS, s.settings);
    const rand = mulberry32(sampleSeed++);
    return text(Array.from({ length: n }, () => TOKENS[sampleIndex(dist, rand)]).join(' · '));
  },
};

function describeSettings(st: SamplerSettings): string {
  const k = st.topK === 0 || st.topK >= TOKENS.length ? 'off' : String(st.topK);
  const p = st.topP >= 1 ? 'off' : st.topP.toFixed(2);
  return `T=${st.temperature.toFixed(1)} · top-k ${k} · top-p ${p}`;
}

export const inside4Commands: LevelCommandSet<Inside4State, Inside4Action> = {
  commands: [set, sample],
  summarize: (s) => {
    const dist = distribution(LOGITS, s.settings);
    const top = TOKENS.map((t, i) => ({ t, p: dist[i] }))
      .filter((x) => x.p > 0)
      .sort((a, b) => b.p - a.p)
      .slice(0, 3)
      .map((x) => `${x.t} ${(x.p * 100).toFixed(0)}%`)
      .join(', ');
    return `${describeSettings(s.settings)} → ${top}`;
  },
};
