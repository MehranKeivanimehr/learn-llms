import { describe, expect, it } from 'vitest';
import { parseGlobal } from '../../src/commands/global';
import { complete, helpText, interpret } from '../../src/commands/interpret';
import { closest, editDistance, parseNumber, tokenize } from '../../src/commands/parse';
import { actions, error, text, usageError, type LevelCommand, type LevelCommandSet } from '../../src/commands/types';

type S = { n: number };
type A = { type: 'add'; by: number };
const addCmd: LevelCommand<S, A> = {
  name: 'add',
  aliases: ['plus'],
  usage: 'add <number>',
  help: 'Add a number.',
  run(args) {
    const n = parseNumber(args[0]);
    if (args.length !== 1 || n === null) return usageError(addCmd);
    return actions({ type: 'add', by: n });
  },
  complete: (i, prefix) => (i === 0 ? ['1', '10', '2'].filter((o) => o.startsWith(prefix)) : []),
};
const showCmd: LevelCommand<S, A> = { name: 'show', usage: 'show', help: 'Show n.', run: (_a, s) => text(`n = ${s.n}`) };
const failCmd: LevelCommand<S, A> = { name: 'fail', usage: 'fail', help: 'Always fails.', run: () => error('nope') };
const set: LevelCommandSet<S, A> = { commands: [addCmd, showCmd, failCmd], summarize: (s) => `n is ${s.n}` };

describe('tokenize', () => {
  it('splits on any whitespace', () => {
    expect(tokenize('  add   3 ')).toEqual(['add', '3']);
  });
  it('keeps quoted text together, including trailing spaces', () => {
    expect(tokenize('prompt "twinkle, twinkle, "')).toEqual(['prompt', 'twinkle, twinkle, ']);
  });
  it('treats an unterminated quote as running to the end', () => {
    expect(tokenize('prompt "abc d')).toEqual(['prompt', 'abc d']);
  });
  it('returns [] for a blank line', () => {
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('edit distance and suggestions', () => {
  it('computes Levenshtein distance', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('', 'abc')).toBe(3);
  });
  it('suggests the closest option within distance 2', () => {
    expect(closest('hnit', ['hint', 'help', 'reset'])).toBe('hint');
    expect(closest('zzzzzz', ['hint', 'help'])).toBeNull();
  });
});

describe('parseNumber', () => {
  it('parses finite numbers only', () => {
    expect(parseNumber('-1.5')).toBe(-1.5);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber('Infinity')).toBeNull();
  });
});

describe('parseGlobal', () => {
  it('recognises simple global commands case-insensitively', () => {
    expect(parseGlobal(['HINT'], 8)).toEqual({ kind: 'hint' });
    expect(parseGlobal(['instructions'], 8)).toEqual({ kind: 'objective' });
    expect(parseGlobal(['exam'], 8)).toEqual({ kind: 'exam' });
    expect(parseGlobal(['show', 'commands'], 8)).toEqual({ kind: 'help' });
    expect(parseGlobal(['help', 'Add'], 8)).toEqual({ kind: 'help', topic: 'add' });
  });
  it('validates level numbers', () => {
    expect(parseGlobal(['level', '3'], 8)).toEqual({ kind: 'level', n: 3 });
    expect(parseGlobal(['level', '9'], 8)).toEqual({ kind: 'error', text: 'Usage: level <number> (1–8)' });
  });
  it('returns null for non-global words', () => {
    expect(parseGlobal(['add', '1'], 8)).toBeNull();
  });
});

describe('interpret', () => {
  const s = { n: 0 };
  it('returns actions from a level command, by name or alias', () => {
    expect(interpret('add 2', set, s, 8)).toEqual({ kind: 'actions', actions: [{ type: 'add', by: 2 }] });
    expect(interpret('PLUS 2', set, s, 8)).toEqual({ kind: 'actions', actions: [{ type: 'add', by: 2 }] });
  });
  it('passes through text and errors', () => {
    expect(interpret('show', set, { n: 4 }, 8)).toEqual({ kind: 'text', text: 'n = 4' });
    expect(interpret('fail', set, s, 8)).toEqual({ kind: 'error', text: 'nope' });
    expect(interpret('add x', set, s, 8)).toEqual({ kind: 'error', text: 'Usage: add <number>' });
  });
  it('recognises global commands before level commands', () => {
    expect(interpret('undo', set, s, 8)).toEqual({ kind: 'global', command: { kind: 'undo' } });
  });
  it('suggests a close command name for typos', () => {
    expect(interpret('ad 1', set, s, 8)).toEqual({ kind: 'error', text: 'Unknown command "ad". Did you mean "add"?' });
    expect(interpret('xyzzy', set, s, 8)).toEqual({
      kind: 'error',
      text: 'Unknown command "xyzzy". Type "help" to see every command.',
    });
  });
  it('treats blank input as empty', () => {
    expect(interpret('   ', set, s, 8)).toEqual({ kind: 'empty' });
  });
});

describe('helpText', () => {
  it('lists level and global commands', () => {
    const h = helpText(set);
    expect(h).toContain('add <number>');
    expect(h).toContain('hint');
  });
  it('explains one command', () => {
    expect(helpText(set, 'add')).toBe('add <number> — Add a number.');
    expect(helpText(set, 'nope')).toBe('No command called "nope". Type "help" to see every command.');
  });
});

describe('complete', () => {
  const s = { n: 0 };
  it('completes a unique command name and adds a space', () => {
    expect(complete('sh', set, s)).toEqual({ line: 'show ', options: ['show'] });
  });
  it('extends to the common prefix when several names match', () => {
    expect(complete('h', set, s)).toEqual({ line: 'h', options: ['help', 'hint'] });
  });
  it('completes arguments through the command', () => {
    expect(complete('add 2', set, s)).toEqual({ line: 'add 2 ', options: ['2'] });
    expect(complete('add 1', set, s)).toEqual({ line: 'add 1', options: ['1', '10'] });
    expect(complete('add ', set, s)).toEqual({ line: 'add ', options: ['1', '10', '2'] });
  });
  it('returns the line unchanged when nothing matches', () => {
    expect(complete('show x', set, s)).toEqual({ line: 'show x', options: [] });
  });
});
