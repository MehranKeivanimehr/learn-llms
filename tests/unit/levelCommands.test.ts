import { describe, expect, it } from 'vitest';
import { interpret } from '../../src/commands/interpret';
import { inside1Commands } from '../../src/commands/levels/inside1';
import { inside2Commands } from '../../src/commands/levels/inside2';
import { inside3Commands } from '../../src/commands/levels/inside3';
import { inside4Commands } from '../../src/commands/levels/inside4';
import { inside5Commands } from '../../src/commands/levels/inside5';
import { inside6Commands } from '../../src/commands/levels/inside6';
import { inside7Commands } from '../../src/commands/levels/inside7';
import { inside8Commands } from '../../src/commands/levels/inside8';
import type { LevelCommandSet } from '../../src/commands/types';
import { inside1 } from '../../src/puzzles/inside1';
import { inside2 } from '../../src/puzzles/inside2';
import { inside3 } from '../../src/puzzles/inside3';
import { inside4 } from '../../src/puzzles/inside4';
import { inside5 } from '../../src/puzzles/inside5';
import { inside6 } from '../../src/puzzles/inside6';
import { inside7 } from '../../src/puzzles/inside7';
import { inside8 } from '../../src/puzzles/inside8';
import { isSolved, type PuzzleDef } from '../../src/puzzles/types';

/** Runs command lines through interpret + def.apply and returns the final state. */
function play<S, A>(def: PuzzleDef<S, A>, set: LevelCommandSet<S, A>, lines: string[], start = def.start()): S {
  let s = start;
  for (const line of lines) {
    const r = interpret(line, set, s, 8);
    if (r.kind !== 'actions') throw new Error(`"${line}" gave ${r.kind}: ${'text' in r ? r.text : ''}`);
    for (const a of r.actions) s = def.apply(s, a);
  }
  return s;
}

function reply<S, A>(def: PuzzleDef<S, A>, set: LevelCommandSet<S, A>, line: string, state = def.start()) {
  return interpret(line, set, state, 8);
}

const SOLUTIONS: [string, PuzzleDef<any, any>, LevelCommandSet<any, any>, string[]][] = [
  ['inside-1', inside1, inside1Commands, ['remove Germany', 'add France']],
  ['inside-2', inside2, inside2Commands, ['merge l o', 'merge lo w', 'merge low e']],
  ['inside-3', inside3, inside3Commands, ['move queen 4 3']],
  ['inside-4', inside4, inside4Commands, ['set top-k 1', 'set top-k 3']],
  ['inside-5', inside5, inside5Commands, ['query it --x 3 --y -1.5']],
  ['inside-6', inside6, inside6Commands, ['positions on', 'strength 3']],
  ['inside-7', inside7, inside7Commands, ['place attention 1', 'place norm 2', 'place mlp 3', 'place norm 4']],
  ['inside-8', inside8, inside8Commands, ['prompt "twinkle, twinkle, "', 'temperature 0']],
];

describe('every level can be solved by typing', () => {
  for (const [id, def, set, lines] of SOLUTIONS) {
    it(id, () => {
      expect(isSolved(def, play(def, set, lines))).toBe(true);
    });
  }
});

describe('every level summarizes its state in one line', () => {
  for (const [id, def, set] of SOLUTIONS) {
    it(id, () => {
      const line = set.summarize(def.start());
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toContain('\n');
    });
  }
});

describe('level 1 commands', () => {
  it('matches words case-insensitively and removes the last copy', () => {
    const s = play(inside1, inside1Commands, ['add the', 'add The']);
    expect(s.context.slice(-2)).toEqual(['the', 'The']);
    const r = reply(inside1, inside1Commands, 'remove the', s);
    expect(r).toEqual({ kind: 'actions', actions: [{ type: 'remove', index: s.context.length - 1 }] });
  });
  it('rejects unknown words and missing words', () => {
    expect(reply(inside1, inside1Commands, 'add Tokyo').kind).toBe('error');
    expect(reply(inside1, inside1Commands, 'remove Tokyo')).toEqual({ kind: 'error', text: '"Tokyo" isn\'t in the context.' });
    expect(reply(inside1, inside1Commands, 'add')).toEqual({ kind: 'error', text: 'Usage: add <word>' });
  });
  it('refuses to add past 8 words', () => {
    const full = play(inside1, inside1Commands, ['add a', 'add a', 'add a']);
    expect(reply(inside1, inside1Commands, 'add a', full).kind).toBe('error');
  });
  it('predict prints the top three words', () => {
    const r = reply(inside1, inside1Commands, 'predict');
    expect(r.kind).toBe('text');
    expect((r as { text: string }).text).toContain('Berlin');
  });
});

describe('level 2 commands', () => {
  it('refuses pairs that are not neighbours', () => {
    expect(reply(inside2, inside2Commands, 'merge w l').kind).toBe('error');
    expect(reply(inside2, inside2Commands, 'merge l')).toEqual({ kind: 'error', text: 'Usage: merge <a> <b>' });
  });
  it('refuses a fifth merge', () => {
    const s = play(inside2, inside2Commands, ['merge l o', 'merge lo w', 'merge low e', 'merge lowe r']);
    expect(reply(inside2, inside2Commands, 'merge _ lowe', s)).toEqual({
      kind: 'error',
      text: `You've used all 4 merges. Type "undo" or "reset" to try again.`,
    });
  });
  it('pairs lists the most common pair first', () => {
    const r = reply(inside2, inside2Commands, 'pairs');
    expect((r as { text: string }).text.split('\n')[0]).toBe('l + o (×3)');
  });
});

describe('level 3 commands', () => {
  it('accepts "move x y" without the word queen', () => {
    expect(reply(inside3, inside3Commands, 'move 4 3')).toEqual({ kind: 'actions', actions: [{ type: 'move', to: [4, 3] }] });
  });
  it('rejects other words, decimals and off-grid points', () => {
    expect(reply(inside3, inside3Commands, 'move king 4 3').kind).toBe('error');
    expect(reply(inside3, inside3Commands, 'move queen 4.5 3').kind).toBe('error');
    expect(reply(inside3, inside3Commands, 'move queen 9 3').kind).toBe('error');
  });
  it('similar prints a cosine similarity', () => {
    expect(reply(inside3, inside3Commands, 'similar king prince')).toEqual({ kind: 'text', text: 'cosine(king, prince) = 1.00' });
    expect(reply(inside3, inside3Commands, 'similar king dragon').kind).toBe('error');
  });
});

describe('level 4 commands', () => {
  it('accepts aliases for setting names', () => {
    expect(reply(inside4, inside4Commands, 'set temp 0.5')).toEqual({ kind: 'actions', actions: [{ type: 'temperature', value: 0.5 }] });
    expect(reply(inside4, inside4Commands, 'set top-p 0.9')).toEqual({ kind: 'actions', actions: [{ type: 'topP', value: 0.9 }] });
  });
  it('validates ranges', () => {
    expect(reply(inside4, inside4Commands, 'set temperature 5').kind).toBe('error');
    expect(reply(inside4, inside4Commands, 'set top-k 1.5').kind).toBe('error');
    expect(reply(inside4, inside4Commands, 'set top-p 0').kind).toBe('error');
    expect(reply(inside4, inside4Commands, 'set colour 1').kind).toBe('error');
  });
  it('sample prints the requested number of tokens', () => {
    const r = reply(inside4, inside4Commands, 'sample 5');
    expect((r as { text: string }).text.split(' · ')).toHaveLength(5);
    expect(reply(inside4, inside4Commands, 'sample 999').kind).toBe('error');
  });
});

describe('level 5 commands', () => {
  it('accepts one or both flags, with or without "it"', () => {
    expect(reply(inside5, inside5Commands, 'query --y 2')).toEqual({ kind: 'actions', actions: [{ type: 'qy', value: 2 }] });
  });
  it('rejects missing flags, bad numbers and out-of-range values', () => {
    expect(reply(inside5, inside5Commands, 'query it').kind).toBe('error');
    expect(reply(inside5, inside5Commands, 'query it --x abc').kind).toBe('error');
    expect(reply(inside5, inside5Commands, 'query it --x 7').kind).toBe('error');
    expect(reply(inside5, inside5Commands, 'query it --z 1').kind).toBe('error');
  });
  it('scores prints one line per word', () => {
    expect((reply(inside5, inside5Commands, 'scores') as { text: string }).text.split('\n')).toHaveLength(10);
  });
});

describe('level 6 commands', () => {
  it('reports when positions are already in the requested state', () => {
    expect(reply(inside6, inside6Commands, 'positions off')).toEqual({ kind: 'text', text: 'Position signals are already off.' });
    expect(reply(inside6, inside6Commands, 'positions maybe').kind).toBe('error');
  });
  it('validates strength', () => {
    expect(reply(inside6, inside6Commands, 'strength 9').kind).toBe('error');
  });
});

describe('level 7 commands', () => {
  it('fills the second Add & Norm when the first is placed', () => {
    const s = play(inside7, inside7Commands, ['place norm 2']);
    expect(reply(inside7, inside7Commands, 'place norm 4', s)).toEqual({
      kind: 'actions',
      actions: [{ type: 'place', piece: 'norm2', slot: 3 }],
    });
  });
  it('validates pieces and steps', () => {
    expect(reply(inside7, inside7Commands, 'place softmax 1').kind).toBe('error');
    expect(reply(inside7, inside7Commands, 'place mlp 5').kind).toBe('error');
    expect(reply(inside7, inside7Commands, 'empty 1')).toEqual({ kind: 'error', text: 'Step 1 is already empty.' });
  });
});

describe('level 8 commands', () => {
  it('joins unquoted words into one prompt', () => {
    expect(reply(inside8, inside8Commands, 'prompt mary had a')).toEqual({ kind: 'actions', actions: [{ type: 'prompt', value: 'mary had a' }] });
  });
  it('explains that re-rolling at temperature 0 changes nothing', () => {
    const s = play(inside8, inside8Commands, ['temperature 0']);
    expect(reply(inside8, inside8Commands, 'reroll', s).kind).toBe('text');
  });
  it('validates temperature', () => {
    expect(reply(inside8, inside8Commands, 'temperature -1').kind).toBe('error');
  });
});
