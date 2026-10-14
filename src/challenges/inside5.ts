import type { ChallengeDef } from './types';

export const inside5Challenge: ChallengeDef = {
  id: 'inside-5',
  title: 'Scaled dot-product attention',
  prompt: `Attention for one word works in three steps:

1. **Score** every key: \`score = (q · k) / √d\`, where \`d\` is the length of the vectors.
2. Turn the scores into **weights** with softmax (they add up to 1).
3. The **output** is the weighted sum of the value vectors.

Write \`attention(q, keys, values)\` that returns the output vector.`,
  starterCode: `// q: the query vector, e.g. [1, 0]
// keys: one key vector per word, e.g. [[1, 0], [0, 1]]
// values: one value vector per word, e.g. [[1, 2], [3, 4]]
function attention(q, keys, values) {
  // your code here
}
`,
  functionName: 'attention',
  tests: [
    {
      name: 'mixes values by attention weight',
      args: [[1, 0], [[1, 0], [0, 1]], [[1, 2], [3, 4]]],
      expect: [1.660477, 2.660477],
      tolerance: 1e-5,
    },
    { name: 'identical keys → plain average', args: [[1, 1], [[1, 0], [1, 0]], [[0, 0], [2, 4]]], expect: [1, 2], tolerance: 1e-9 },
    { name: 'one key → its value', args: [[5, 5], [[1, 1]], [[7, 8]]], expect: [7, 8], tolerance: 1e-9 },
    { name: 'zero query → equal weights', args: [[0, 0], [[1, 0], [0, 1], [1, 1]], [[3], [6], [9]]], expect: [6], tolerance: 1e-9 },
  ],
  reference: `function attention(q, keys, values) {
  const d = q.length;
  const scores = keys.map((k) => k.reduce((s, kj, j) => s + kj * q[j], 0) / Math.sqrt(d));
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const weights = exps.map((e) => e / sum);
  const out = new Array(values[0].length).fill(0);
  weights.forEach((w, i) => values[i].forEach((v, j) => (out[j] += w * v)));
  return out;
}
`,
};
