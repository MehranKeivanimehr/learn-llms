import { whoGotHurt } from '../../models/order';
import { SENTENCE_A, SENTENCE_B, type Inside6Action, type Inside6State } from '../../puzzles/inside6';
import { parseNumber } from '../parse';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside6State, Inside6Action>;

const positions: Cmd = {
  name: 'positions',
  usage: 'positions <on|off>',
  help: 'Turn position signals on or off.',
  run(args, s) {
    const want = args[0]?.toLowerCase();
    if (args.length !== 1 || (want !== 'on' && want !== 'off')) return usageError(positions);
    if ((want === 'on') === s.usePositions) return text(`Position signals are already ${want}.`);
    return actions({ type: 'togglePositions' });
  },
  complete: (i, prefix) => (i === 0 ? ['on', 'off'].filter((o) => o.startsWith(prefix)) : []),
};

const strength: Cmd = {
  name: 'strength',
  usage: 'strength <0–4>',
  help: 'Set how strong the position signals are.',
  run(args) {
    const v = parseNumber(args[0]);
    if (args.length !== 1 || v === null) return usageError(strength);
    if (v < 0 || v > 4) return error('Strength must be between 0 and 4.');
    return actions({ type: 'scale', value: v });
  },
};

export const inside6Commands: LevelCommandSet<Inside6State, Inside6Action> = {
  commands: [positions, strength],
  summarize: (s) => {
    const a = whoGotHurt(SENTENCE_A, s.usePositions, s.scale);
    const b = whoGotHurt(SENTENCE_B, s.usePositions, s.scale);
    return `positions ${s.usePositions ? 'on' : 'off'} · strength ${s.scale} → "dog bites man": ${a.answer} (${a.confidence.toFixed(2)}) · "man bites dog": ${b.answer} (${b.confidence.toFixed(2)})`;
  },
};
