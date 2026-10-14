import { ANIMAL, KEYS, STREET, TOKENS } from '../../models/data/attention5Data';
import { dot } from '../../models/linalg';
import { itWeights, type Inside5Action, type Inside5State } from '../../puzzles/inside5';
import { parseNumber } from '../parse';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside5State, Inside5Action>;
const RANGE = 3;

const query: Cmd = {
  name: 'query',
  usage: 'query it [--x <value>] [--y <value>]',
  help: `Set the query vector for "it" (values from -${RANGE} to ${RANGE}).`,
  run(args) {
    const rest = args[0]?.toLowerCase() === 'it' ? args.slice(1) : args;
    const out: Inside5Action[] = [];
    for (let i = 0; i < rest.length; i += 2) {
      const flag = rest[i].toLowerCase();
      const type = flag === '--x' || flag === '-x' ? 'qx' : flag === '--y' || flag === '-y' ? 'qy' : null;
      const v = parseNumber(rest[i + 1]);
      if (!type || v === null) return usageError(query);
      if (Math.abs(v) > RANGE) return error(`Query values must be between -${RANGE} and ${RANGE}.`);
      out.push({ type, value: v });
    }
    if (out.length === 0) return usageError(query);
    out.sort((a, b) => (a.type < b.type ? -1 : 1));
    return actions(...out);
  },
  complete: (i, prefix) => (i === 0 ? ['it', '--x', '--y'] : ['--x', '--y']).filter((o) => o.startsWith(prefix)),
};

const scores: Cmd = {
  name: 'scores',
  usage: 'scores',
  help: 'Print each word’s score q·k/√2 before softmax.',
  run: (_args, s) => text(TOKENS.map((t, i) => `${t.padEnd(8)} ${(dot(s.q, KEYS[i]) / Math.SQRT2).toFixed(2)}`).join('\n')),
};

export const inside5Commands: LevelCommandSet<Inside5State, Inside5Action> = {
  commands: [query, scores],
  summarize: (s) => {
    const w = itWeights(s.q);
    return `query (${s.q[0]}, ${s.q[1]}) → animal ${w[ANIMAL].toFixed(2)} · street ${w[STREET].toFixed(2)}`;
  },
};
