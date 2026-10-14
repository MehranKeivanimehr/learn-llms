import type { ChallengeDef } from './types';

export const inside3Challenge: ChallengeDef = {
  id: 'inside-3',
  title: 'Cosine similarity',
  prompt: `Two word vectors are "similar" when they point in the same direction. **Cosine similarity** measures that:

\`cos(a, b) = (a · b) / (|a| × |b|)\`

where \`a · b\` is the dot product (multiply matching numbers and add them up) and \`|a|\` is the length of \`a\` (the square root of \`a · a\`). The answer is 1 for the same direction, 0 for perpendicular, and −1 for opposite.

Write \`cosineSimilarity(a, b)\`.`,
  starterCode: `// a and b are arrays of numbers with the same length, e.g. [3, 4] and [4, 3]
function cosineSimilarity(a, b) {
  // your code here
}
`,
  functionName: 'cosineSimilarity',
  tests: [
    { name: 'same direction → 1', args: [[1, 0], [1, 0]], expect: 1, tolerance: 1e-9 },
    { name: 'perpendicular → 0', args: [[1, 0], [0, 1]], expect: 0, tolerance: 1e-9 },
    { name: 'opposite → −1', args: [[1, 2], [-1, -2]], expect: -1, tolerance: 1e-9 },
    { name: 'length does not matter', args: [[1, 1], [5, 5]], expect: 1, tolerance: 1e-9 },
    { name: '[3,4] vs [4,3] → 0.96', args: [[3, 4], [4, 3]], expect: 0.96, tolerance: 1e-9 },
  ],
  reference: `function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
`,
};
