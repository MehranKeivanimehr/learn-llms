import { describe, expect, it } from 'vitest';
import { deepClose, runTests } from '../../src/engine/runChallenge';

describe('deepClose', () => {
  it('compares numbers with a tolerance', () => {
    expect(deepClose(0.1 + 0.2, 0.3)).toBe(false);
    expect(deepClose(0.1 + 0.2, 0.3, 1e-9)).toBe(true);
  });
  it('compares nested arrays and objects', () => {
    expect(deepClose([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
    expect(deepClose([1, 2], [1, 2, 3])).toBe(false);
    expect(deepClose({ a: [1], b: 'x' }, { a: [1], b: 'x' })).toBe(true);
    expect(deepClose({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });
  it('compares strings and booleans exactly', () => {
    expect(deepClose('ab', 'ab')).toBe(true);
    expect(deepClose(true, 1)).toBe(false);
  });
});

describe('runTests', () => {
  const tests = [
    { name: 'doubles 2', args: [2], expect: 4 },
    { name: 'doubles -1', args: [-1], expect: -2 },
  ];

  it('passes a correct function', () => {
    const r = runTests('function double(x) { return x * 2; }', 'double', tests);
    expect(r.map((t) => t.passed)).toEqual([true, true]);
  });

  it('reports the actual value of a wrong function', () => {
    const r = runTests('function double(x) { return x + 2; }', 'double', tests);
    expect(r[0]).toMatchObject({ passed: true });
    expect(r[1]).toMatchObject({ passed: false, actual: 1 });
  });

  it('explains a missing function', () => {
    const r = runTests('const x = 1;', 'double', tests);
    expect(r.every((t) => !t.passed)).toBe(true);
    expect(r[0].error).toBe('Define a function named double.');
  });

  it('reports syntax errors for every test', () => {
    const r = runTests('function double(x) { return x * ; }', 'double', tests);
    expect(r.every((t) => !t.passed && typeof t.error === 'string')).toBe(true);
  });

  it('reports runtime errors with the line number in the learner code', () => {
    const r = runTests('function double(x) {\n  throw new Error("boom");\n}', 'double', tests);
    expect(r[0]).toMatchObject({ passed: false, error: 'boom', line: 2 });
  });

  it('gives each test a fresh copy of its arguments', () => {
    const t = [{ name: 'push', args: [[]], expect: 1 }];
    const code = 'function push(a) { a.push(1); return a.length; }';
    expect(runTests(code, 'push', t)[0].passed).toBe(true);
    expect(runTests(code, 'push', t)[0].passed).toBe(true);
  });

  it('turns values that cannot be sent between threads into strings', () => {
    const fnResult = runTests('function f() { return function inner() {}; }', 'f', [{ name: 'x', args: [], expect: 1 }]);
    expect(typeof fnResult[0].actual).toBe('string');
    const cyclic = runTests('function f() { const o = {}; o.self = o; return o; }', 'f', [
      { name: 'x', args: [], expect: 1 },
    ]);
    expect(typeof cyclic[0].actual).toBe('string');
  });
});
