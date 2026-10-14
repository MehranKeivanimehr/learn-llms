export interface ChallengeTest {
  name: string;
  args: unknown[];
  expect: unknown;
  tolerance?: number;
}

export interface ChallengeDef {
  id: string;
  title: string;
  /** Markdown shown above the editor. */
  prompt: string;
  starterCode: string;
  functionName: string;
  tests: ChallengeTest[];
  /** Reference solution source. Must pass every test. */
  reference: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  actual?: unknown;
  error?: string;
  line?: number;
}
