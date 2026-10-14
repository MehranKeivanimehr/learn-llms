import { VOCAB } from '../../models/data/nextTokenData';
import { nextTokenProbs } from '../../models/nextToken';
import { MAX_WORDS, type Inside1Action, type Inside1State } from '../../puzzles/inside1';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside1State, Inside1Action>;

const matchVocab = (word: string) =>
  VOCAB.find((w) => w === word) ?? VOCAB.find((w) => w.toLowerCase() === word.toLowerCase());

const startingWith = (list: string[], prefix: string) =>
  list.filter((w) => w.toLowerCase().startsWith(prefix.toLowerCase()));

function top3(context: string[]): string {
  const p = nextTokenProbs(context);
  return VOCAB.map((w, i) => ({ w, p: p[i] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
    .map((x) => `${x.w} ${(x.p * 100).toFixed(0)}%`)
    .join(' · ');
}

const add: Cmd = {
  name: 'add',
  usage: 'add <word>',
  help: 'Add a word to the end of the context.',
  run(args, s) {
    if (args.length !== 1) return usageError(add);
    const word = matchVocab(args[0]);
    if (!word) return error(`"${args[0]}" isn't in this model's vocabulary. Try one of: ${VOCAB.join(', ')}.`);
    if (s.context.length >= MAX_WORDS) return error(`The context is full (${MAX_WORDS} words). Remove a word first.`);
    return actions({ type: 'add', word });
  },
  complete: (i, prefix) => (i === 0 ? startingWith(VOCAB, prefix) : []),
};

const remove: Cmd = {
  name: 'remove',
  aliases: ['rm'],
  usage: 'remove <word>',
  help: 'Remove the last copy of a word from the context.',
  run(args, s) {
    if (args.length !== 1) return usageError(remove);
    const target = args[0].toLowerCase();
    let index = -1;
    s.context.forEach((w, i) => {
      if (w.toLowerCase() === target) index = i;
    });
    if (index < 0) return error(`"${args[0]}" isn't in the context.`);
    return actions({ type: 'remove', index });
  },
  complete: (i, prefix, s) => (i === 0 ? startingWith([...new Set(s.context)], prefix) : []),
};

const predict: Cmd = {
  name: 'predict',
  usage: 'predict',
  help: 'Show the three most likely next words.',
  run: (_args, s) => text(top3(s.context)),
};

export const inside1Commands: LevelCommandSet<Inside1State, Inside1Action> = {
  commands: [add, remove, predict],
  summarize: (s) => `"${s.context.join(' ')}" → ${top3(s.context)}`,
};
