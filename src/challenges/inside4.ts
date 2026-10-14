import type { ChallengeDef } from './types';

export const inside4Challenge: ChallengeDef = {
  id: 'inside-4',
  title: 'Softmax with temperature',
  prompt: `The model's raw scores are called **logits**. **Softmax** turns them into probabilities:

1. Divide every logit by the **temperature**.
2. Take \`Math.exp\` of each result.
3. Divide each by the total so they add up to 1.

One catch: \`Math.exp(1000)\` is \`Infinity\`. Real implementations first **subtract the largest value** from every (divided) logit — this doesn't change the answer, but keeps the numbers small. The last test checks for this.

Write \`softmax(logits, temperature)\`. You can assume \`temperature > 0\`.`,
  starterCode: `// logits: array of numbers, e.g. [1, 2, 3]
// temperature: a number above 0
function softmax(logits, temperature) {
  // your code here
}
`,
  functionName: 'softmax',
  tests: [
    { name: 'equal logits → equal probabilities', args: [[0, 0], 1], expect: [0.5, 0.5], tolerance: 1e-9 },
    { name: '[1, 2, 3] at temperature 1', args: [[1, 2, 3], 1], expect: [0.09003057, 0.24472847, 0.66524096], tolerance: 1e-6 },
    { name: 'low temperature sharpens', args: [[1, 2], 0.5], expect: [0.11920292, 0.88079708], tolerance: 1e-6 },
    { name: 'huge logits do not overflow', args: [[1000, 1000], 1], expect: [0.5, 0.5], tolerance: 1e-9 },
  ],
  reference: `function softmax(logits, temperature) {
  const scaled = logits.map((l) => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
`,
};
