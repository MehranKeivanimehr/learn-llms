import { cosineSimilarity } from '../../models/embeddings';
import { FIXED, GRID_SIZE, rankings, type Inside3Action, type Inside3State } from '../../puzzles/inside3';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside3State, Inside3Action>;

const move: Cmd = {
  name: 'move',
  usage: 'move queen <x> <y>',
  help: `Move "queen" to a grid point (whole numbers 0–${GRID_SIZE}).`,
  run(args) {
    let rest = args;
    if (rest[0]?.toLowerCase() === 'queen') rest = rest.slice(1);
    else if (rest.length === 3) return error('Only "queen" can move in this puzzle.');
    if (rest.length !== 2) return usageError(move);
    const [x, y] = rest.map(Number);
    const ok = (v: number) => Number.isInteger(v) && v >= 0 && v <= GRID_SIZE;
    if (!ok(x) || !ok(y)) return error(`x and y must be whole numbers from 0 to ${GRID_SIZE}.`);
    return actions({ type: 'move', to: [x, y] });
  },
  complete: (i, prefix) => (i === 0 ? ['queen'].filter((w) => w.startsWith(prefix.toLowerCase())) : []),
};

const similar: Cmd = {
  name: 'similar',
  usage: 'similar <word> <word>',
  help: 'Print the cosine similarity of two words.',
  run(args, s) {
    if (args.length !== 2) return usageError(similar);
    const table: Record<string, number[]> = { ...FIXED, queen: s.queen };
    const [a, b] = args.map((w) => w.toLowerCase());
    for (const w of [a, b]) if (!table[w]) return error(`"${w}" isn't on the map. Words: ${Object.keys(table).join(', ')}.`);
    return text(`cosine(${a}, ${b}) = ${cosineSimilarity(table[a], table[b]).toFixed(2)}`);
  },
  complete: (i, prefix) =>
    i < 2 ? [...Object.keys(FIXED), 'queen'].filter((w) => w.startsWith(prefix.toLowerCase())) : [],
};

export const inside3Commands: LevelCommandSet<Inside3State, Inside3Action> = {
  commands: [move, similar],
  summarize: (s) => {
    const best = rankings(s)[0];
    return `queen at (${s.queen[0]}, ${s.queen[1]}) · nearest to king − man + woman: ${best.word} (${best.similarity.toFixed(2)})`;
  },
};
