import type { ChallengeDef } from './types';

export const inside7Challenge: ChallengeDef = {
  id: 'inside-7',
  title: 'Add & Norm',
  prompt: `After each sub-layer, a transformer block does **Add & Norm**:

1. **Add** (the residual connection): \`h = x + sublayerOut\`, number by number.
2. **Norm** (layer normalization): subtract the mean of \`h\`, then divide by \`Math.sqrt(variance + eps)\` with \`eps = 1e-5\`. Use the plain variance: the average of \`(h[i] − mean)²\`.

The small \`eps\` stops a division by zero when all the numbers are equal — one test checks that.

Write \`addAndNorm(x, sublayerOut)\`.`,
  starterCode: `// x and sublayerOut are arrays of numbers with the same length
function addAndNorm(x, sublayerOut) {
  // your code here
}
`,
  functionName: 'addAndNorm',
  tests: [
    { name: 'normalizes [1, 2, 3]', args: [[1, 2, 3], [0, 0, 0]], expect: [-1.2247357, 0, 1.2247357], tolerance: 1e-5 },
    { name: 'adds before normalizing', args: [[1, 1], [1, 3]], expect: [-1, 1], tolerance: 1e-4 },
    { name: 'the residual can come from either side', args: [[0, 0, 0], [1, 2, 3]], expect: [-1.2247357, 0, 1.2247357], tolerance: 1e-5 },
    { name: 'equal numbers become zeros (needs eps)', args: [[5, 5, 5], [0, 0, 0]], expect: [0, 0, 0], tolerance: 1e-9 },
  ],
  reference: `function addAndNorm(x, sublayerOut) {
  const h = x.map((v, i) => v + sublayerOut[i]);
  const mean = h.reduce((a, b) => a + b, 0) / h.length;
  const variance = h.reduce((a, b) => a + (b - mean) ** 2, 0) / h.length;
  const denom = Math.sqrt(variance + 1e-5);
  return h.map((v) => (v - mean) / denom);
}
`,
};
