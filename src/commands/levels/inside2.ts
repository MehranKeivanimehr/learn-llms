import { countPairs } from '../../models/tokenizer';
import { candidatePairs, MAX_MERGES, type Inside2Action, type Inside2State } from '../../puzzles/inside2';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside2State, Inside2Action>;

const merge: Cmd = {
  name: 'merge',
  usage: 'merge <a> <b>',
  help: 'Merge every "a" followed by "b" into one token (spaces are written _).',
  run(args, s) {
    if (args.length !== 2) return usageError(merge);
    if (s.merges.length >= MAX_MERGES) return error(`You've used all ${MAX_MERGES} merges. Type "undo" or "reset" to try again.`);
    const [a, b] = args;
    const exists = countPairs(s.tokens).some(({ pair }) => pair[0] === a && pair[1] === b);
    if (!exists) return error(`"${a}" and "${b}" never appear next to each other. Type "pairs" to see the options.`);
    return actions({ type: 'merge', pair: [a, b] });
  },
  complete(i, prefix, s, previous) {
    const pairs = countPairs(s.tokens).map((p) => p.pair);
    const pool = i === 0 ? pairs.map((p) => p[0]) : i === 1 ? pairs.filter((p) => p[0] === previous[0]).map((p) => p[1]) : [];
    return [...new Set(pool)].filter((t) => t.startsWith(prefix));
  },
};

const pairs: Cmd = {
  name: 'pairs',
  usage: 'pairs',
  help: 'List the most common neighbouring pairs.',
  run: (_args, s) => {
    const list = candidatePairs(s.tokens);
    return text(list.length ? list.map(({ pair: [a, b], count }) => `${a} + ${b} (×${count})`).join('\n') : 'No pairs left.');
  },
};

export const inside2Commands: LevelCommandSet<Inside2State, Inside2Action> = {
  commands: [merge, pairs],
  summarize: (s) => `${s.tokens.length} tokens: ${s.tokens.join(' | ')} · merges used ${s.merges.length}/${MAX_MERGES}`,
};
