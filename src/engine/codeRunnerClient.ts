import type { ChallengeTest, TestResult } from '../challenges/types';

export const RUN_TIMEOUT_MS = 2000;

export type RunOutcome =
  | { kind: 'results'; results: TestResult[] }
  | { kind: 'timeout' }
  | { kind: 'crash'; message: string };

export function runInWorker(
  code: string,
  functionName: string,
  tests: ChallengeTest[],
  timeoutMs = RUN_TIMEOUT_MS,
): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./codeRunner.worker.ts', import.meta.url), { type: 'module' });
    const finish = (outcome: RunOutcome) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };
    const timer = setTimeout(() => finish({ kind: 'timeout' }), timeoutMs);
    worker.onmessage = (e: MessageEvent<TestResult[]>) => finish({ kind: 'results', results: e.data });
    worker.onerror = (e: ErrorEvent) => finish({ kind: 'crash', message: e.message || 'The code runner crashed.' });
    worker.postMessage({ code, functionName, tests });
  });
}
