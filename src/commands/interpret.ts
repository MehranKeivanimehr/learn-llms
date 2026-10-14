import { GLOBAL_COMMANDS, parseGlobal, type GlobalCommand } from './global';
import { closest, tokenize } from './parse';
import type { LevelCommand, LevelCommandSet } from './types';

export type Interpretation<A> =
  | { kind: 'global'; command: GlobalCommand }
  | { kind: 'actions'; actions: A[] }
  | { kind: 'text'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'empty' };

function findCommand<S, A>(set: LevelCommandSet<S, A>, name: string): LevelCommand<S, A> | undefined {
  return set.commands.find((c) => c.name === name || c.aliases?.includes(name));
}

export function allNames<S, A>(set: LevelCommandSet<S, A>): string[] {
  return [...GLOBAL_COMMANDS.map((c) => c.name), ...set.commands.map((c) => c.name)];
}

export function interpret<S, A>(line: string, set: LevelCommandSet<S, A>, state: S, levelCount: number): Interpretation<A> {
  const tokens = tokenize(line);
  if (tokens.length === 0) return { kind: 'empty' };
  const global = parseGlobal(tokens, levelCount);
  if (global) return global.kind === 'error' ? { kind: 'error', text: global.text } : { kind: 'global', command: global };
  const name = tokens[0].toLowerCase();
  const cmd = findCommand(set, name);
  if (cmd) return cmd.run(tokens.slice(1), state);
  const guess = closest(name, allNames(set));
  return {
    kind: 'error',
    text: guess
      ? `Unknown command "${tokens[0]}". Did you mean "${guess}"?`
      : `Unknown command "${tokens[0]}". Type "help" to see every command.`,
  };
}

export function helpText<S, A>(set: LevelCommandSet<S, A>, topic?: string): string {
  if (topic) {
    const info = findCommand(set, topic) ?? GLOBAL_COMMANDS.find((c) => c.name === topic);
    if (!info) return `No command called "${topic}". Type "help" to see every command.`;
    return `${info.usage} — ${info.help}`;
  }
  const row = (usage: string, help: string) => `  ${usage.padEnd(30)} ${help}`;
  return [
    'Commands for this level:',
    ...set.commands.map((c) => row(c.usage, c.help)),
    'Commands that work everywhere:',
    ...GLOBAL_COMMANDS.map((c) => row(c.usage, c.help)),
  ].join('\n');
}

function commonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  let prefix = words[0];
  for (const w of words) while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

export function complete<S, A>(line: string, set: LevelCommandSet<S, A>, state: S): { line: string; options: string[] } {
  const endsWithSpace = /\s$/.test(line);
  const tokens = tokenize(line);
  if (tokens.length === 0 || (tokens.length === 1 && !endsWithSpace)) {
    const prefix = (tokens[0] ?? '').toLowerCase();
    const options = allNames(set).filter((n) => n.startsWith(prefix));
    if (options.length === 1) return { line: `${options[0]} `, options };
    const common = commonPrefix(options);
    return { line: common.length > prefix.length ? common : line, options };
  }
  const cmd = findCommand(set, tokens[0].toLowerCase());
  if (!cmd?.complete) return { line, options: [] };
  const argIndex = endsWithSpace ? tokens.length - 1 : tokens.length - 2;
  const prefix = endsWithSpace ? '' : tokens[tokens.length - 1];
  const previous = tokens.slice(1, 1 + argIndex);
  const options = cmd.complete(argIndex, prefix, state, previous);
  const head = line.slice(0, line.length - prefix.length);
  if (options.length === 1) return { line: `${head}${options[0]} `, options };
  const common = commonPrefix(options);
  return { line: common.length > prefix.length ? head + common : line, options };
}
