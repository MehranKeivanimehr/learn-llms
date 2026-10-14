import type { ChallengeTest } from '../challenges/types';
import { runTests } from './runChallenge';

interface RunRequest {
  code: string;
  functionName: string;
  tests: ChallengeTest[];
}

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null;
  postMessage(data: unknown): void;
};

ctx.onmessage = (e) => {
  const { code, functionName, tests } = e.data;
  ctx.postMessage(runTests(code, functionName, tests));
};
