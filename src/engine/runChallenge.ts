import type { ChallengeTest, TestResult } from '../challenges/types';

export function deepClose(actual: unknown, expected: unknown, tol = 0): boolean {
  if (typeof expected === 'number') {
    if (typeof actual !== 'number') return false;
    if (Number.isNaN(expected)) return Number.isNaN(actual);
    return Math.abs(actual - expected) <= tol;
  }
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((e, i) => deepClose(actual[i], e, tol))
    );
  }
  if (expected !== null && typeof expected === 'object') {
    if (actual === null || typeof actual !== 'object' || Array.isArray(actual)) return false;
    const e = expected as Record<string, unknown>;
    const a = actual as Record<string, unknown>;
    const keys = Object.keys(e);
    return keys.length === Object.keys(a).length && keys.every((k) => deepClose(a[k], e[k], tol));
  }
  return Object.is(actual, expected);
}

/** `new Function(body)` puts the body on line 3 of the generated function. */
const WRAPPER_LINES = 2;

export function errorLine(err: unknown): number | undefined {
  const stack = err instanceof Error ? (err.stack ?? '') : '';
  const m = stack.match(/(?:<anonymous>|Function):(\d+):\d+/);
  if (!m) return undefined;
  const line = Number(m[1]) - WRAPPER_LINES;
  return line >= 1 ? line : undefined;
}

function loadFunction(code: string, functionName: string): (...args: unknown[]) => unknown {
  const factory = new Function(`${code}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`);
  const fn = factory();
  if (typeof fn !== 'function') throw new Error(`Define a function named ${functionName}.`);
  return fn as (...args: unknown[]) => unknown;
}

function toPlain(value: unknown): unknown {
  if (value === undefined) return undefined;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : JSON.parse(json);
  } catch {
    return String(value);
  }
}

function describeError(err: unknown): { error: string; line?: number } {
  const error = err instanceof Error ? err.message : String(err);
  const line = errorLine(err);
  return line === undefined ? { error } : { error, line };
}

export function runTests(code: string, functionName: string, tests: ChallengeTest[]): TestResult[] {
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = loadFunction(code, functionName);
  } catch (err) {
    const info = describeError(err);
    return tests.map((t) => ({ name: t.name, passed: false, ...info }));
  }
  return tests.map((t) => {
    try {
      const actual = fn(...structuredClone(t.args));
      return { name: t.name, passed: deepClose(actual, t.expect, t.tolerance ?? 0), actual: toPlain(actual) };
    } catch (err) {
      return { name: t.name, passed: false, ...describeError(err) };
    }
  });
}
