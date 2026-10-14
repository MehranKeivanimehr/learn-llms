import { describe, expect, it } from 'vitest';
import { levelModules } from '../../src/arcade/levelModules';
import { inside1Commands } from '../../src/commands/levels/inside1';
import { gradeAnswer, normalizeText } from '../../src/exams/grade';
import { EXAM_LENGTH, type ExamQuestion } from '../../src/exams/types';
import { inside1 } from '../../src/puzzles/inside1';
import { allPuzzleDefs } from '../../src/puzzles/defs';

const ctx = { commands: inside1Commands, start: inside1.start() };

describe('normalizeText', () => {
  it('ignores case, extra spaces, quotes and end punctuation', () => {
    expect(normalizeText('  The   Animal. ')).toBe('the animal');
    expect(normalizeText('"lamb"')).toBe('lamb');
  });
});

describe('gradeAnswer', () => {
  const choice: ExamQuestion = { kind: 'choice', prompt: 'p', options: ['a', 'b', 'c', 'd'], answer: 2, explain: 'e' };
  const textQ: ExamQuestion = { kind: 'text', prompt: 'p', accept: ['animal', 'the animal'], explain: 'e' };
  const cmd: ExamQuestion = {
    kind: 'command',
    prompt: 'p',
    example: 'remove Germany',
    expect: [{ type: 'remove', index: 3 }],
    explain: 'e',
  };
  it('grades multiple choice by index', () => {
    expect(gradeAnswer(choice, 2)).toBe(true);
    expect(gradeAnswer(choice, 1)).toBe(false);
  });
  it('grades text answers leniently', () => {
    expect(gradeAnswer(textQ, ' The Animal ')).toBe(true);
    expect(gradeAnswer(textQ, 'street')).toBe(false);
  });
  it('grades commands by what they do, so aliases and case are accepted', () => {
    expect(gradeAnswer(cmd, 'remove Germany', ctx)).toBe(true);
    expect(gradeAnswer(cmd, 'rm germany', ctx)).toBe(true);
    expect(gradeAnswer(cmd, 'add Germany', ctx)).toBe(false);
    expect(gradeAnswer(cmd, 'nonsense', ctx)).toBe(false);
    expect(gradeAnswer(cmd, 'remove Germany')).toBe(false);
  });
});

describe('every level has a well-formed exam', () => {
  for (const def of allPuzzleDefs) {
    it(def.id, async () => {
      const m = await levelModules[def.id]();
      const exam = m.exam;
      expect(exam.levelId).toBe(def.id);
      expect(exam.questions).toHaveLength(EXAM_LENGTH);
      const kinds = new Set(exam.questions.map((q) => q.kind));
      expect(kinds.has('choice')).toBe(true);
      expect(kinds.has('text') || kinds.has('command')).toBe(true);
      for (const q of exam.questions) {
        expect(q.prompt.length).toBeGreaterThan(0);
        expect(q.explain.length).toBeGreaterThan(0);
        if (q.kind === 'choice') {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(4);
        } else if (q.kind === 'text') {
          expect(q.accept.length).toBeGreaterThan(0);
          for (const a of q.accept) expect(gradeAnswer(q, a)).toBe(true);
        } else {
          expect(gradeAnswer(q, q.example, { commands: m.commands, start: m.def.start() }), q.example).toBe(true);
        }
      }
    });
  }
});
