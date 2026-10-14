import { runInside8, type Inside8Action, type Inside8State } from '../../puzzles/inside8';
import { parseNumber } from '../parse';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../types';

type Cmd = LevelCommand<Inside8State, Inside8Action>;

const show = (t: string) => t.replace(/\n/g, '↵');

const prompt: Cmd = {
  name: 'prompt',
  usage: 'prompt "<text>"',
  help: 'Set the prompt. Use quotes to keep spaces, e.g. prompt "the lamb ".',
  run(args) {
    if (args.length === 0) return usageError(prompt);
    return actions({ type: 'prompt', value: args.join(' ') });
  },
};

const temperature: Cmd = {
  name: 'temperature',
  aliases: ['temp'],
  usage: 'temperature <0–2>',
  help: 'Set the sampling temperature (0 = always the top character).',
  run(args) {
    const v = parseNumber(args[0]);
    if (args.length !== 1 || v === null) return usageError(temperature);
    if (v < 0 || v > 2) return error('Temperature must be between 0 and 2.');
    return actions({ type: 'temperature', value: v });
  },
};

const reroll: Cmd = {
  name: 'reroll',
  usage: 'reroll',
  help: 'Roll the dice again for a different random output.',
  run(_args, s) {
    if (s.temperature === 0) return text('At temperature 0 the model always picks the top character, so re-rolling changes nothing.');
    return actions({ type: 'reroll' });
  },
};

const generate: Cmd = {
  name: 'generate',
  usage: 'generate',
  help: 'Print what the model writes now.',
  run: (_args, s) => text(`"${show(s.prompt)}" → "${show(runInside8(s).text)}"`),
};

export const inside8Commands: LevelCommandSet<Inside8State, Inside8Action> = {
  commands: [prompt, temperature, reroll, generate],
  summarize: (s) => `T=${s.temperature.toFixed(1)} · "${show(s.prompt)}" → "${show(runInside8(s).text)}"`,
};
