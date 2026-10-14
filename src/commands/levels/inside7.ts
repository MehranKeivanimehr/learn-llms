import { inside7, PIECES, type Inside7Action, type Inside7State, type PieceId } from '../../puzzles/inside7';
import { error, actions, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside7State, Inside7Action>;

const KIND: Record<string, 'attention' | 'mlp' | 'norm'> = {
  attention: 'attention',
  'self-attention': 'attention',
  mlp: 'mlp',
  norm: 'norm',
  addnorm: 'norm',
  'add&norm': 'norm',
  'add-norm': 'norm',
};

const labelOf = (id: PieceId) => PIECES.find((p) => p.id === id)?.label ?? id;

function parseStep(raw: string | undefined): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 4 ? n : null;
}

const place: Cmd = {
  name: 'place',
  usage: 'place <attention|mlp|norm> <step 1–4>',
  help: 'Put a piece into a step of the block.',
  run(args, s) {
    if (args.length !== 2) return usageError(place);
    const kind = KIND[args[0].toLowerCase()];
    if (!kind) return error('Pieces are: attention, mlp, norm.');
    const step = parseStep(args[1]);
    if (step === null) return error('Steps are numbered 1 to 4.');
    let piece: PieceId;
    if (kind === 'norm') piece = !s.slots.includes('norm1') ? 'norm1' : !s.slots.includes('norm2') ? 'norm2' : 'norm1';
    else piece = kind;
    return actions({ type: 'place', piece, slot: step - 1 });
  },
  complete: (i, prefix) =>
    (i === 0 ? ['attention', 'mlp', 'norm'] : i === 1 ? ['1', '2', '3', '4'] : []).filter((o) => o.startsWith(prefix)),
};

const clear: Cmd = {
  name: 'empty',
  aliases: ['clear-step'],
  usage: 'empty <step 1–4>',
  help: 'Take the piece out of a step.',
  run(args, s) {
    const step = parseStep(args[0]);
    if (args.length !== 1 || step === null) return usageError(clear);
    if (s.slots[step - 1] === null) return error(`Step ${step} is already empty.`);
    return actions({ type: 'clear', slot: step - 1 });
  },
};

const pieces: Cmd = {
  name: 'pieces',
  usage: 'pieces',
  help: 'List the pieces that are not placed yet.',
  run: (_args, s) => {
    const left = PIECES.filter((p) => !s.slots.includes(p.id as PieceId)).map((p) => p.label);
    return text(left.length ? `Not placed yet: ${left.join(', ')}` : 'All pieces are placed.');
  },
};

export const inside7Commands: LevelCommandSet<Inside7State, Inside7Action> = {
  commands: [place, clear, pieces],
  summarize: (s) => {
    const steps = s.slots.map((p, i) => `${i + 1} ${p ? labelOf(p) : '—'}`).join(' · ');
    const [filled, matches] = inside7.conditions(s);
    return `${steps} → ${matches.met ? 'output matches the goal ✔' : filled.met ? 'output does not match yet' : 'fill all 4 steps'}`;
  },
};
