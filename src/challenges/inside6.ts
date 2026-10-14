import type { ChallengeDef } from './types';

export const inside6Challenge: ChallengeDef = {
  id: 'inside-6',
  title: 'Sinusoidal positional encoding',
  prompt: `The original transformer gives each position \`pos\` a vector of length \`d\`. The numbers come in pairs; pair \`i\` (counting from 0) uses the angle

\`angle = pos / 10000^(2i / d)\`

and fills index \`2i\` with \`Math.sin(angle)\` and index \`2i + 1\` with \`Math.cos(angle)\`.

Write \`positionalEncoding(pos, d)\`. You can assume \`d\` is even.`,
  starterCode: `// pos: the position (0, 1, 2, ...)
// d: the vector length (even)
function positionalEncoding(pos, d) {
  // your code here
}
`,
  functionName: 'positionalEncoding',
  tests: [
    { name: 'position 0', args: [0, 4], expect: [0, 1, 0, 1], tolerance: 1e-9 },
    { name: 'position 1, d = 2', args: [1, 2], expect: [0.841471, 0.540302], tolerance: 1e-6 },
    { name: 'position 1, d = 4', args: [1, 4], expect: [0.841471, 0.540302, 0.009999833, 0.99995], tolerance: 1e-6 },
    { name: 'position 2, d = 4', args: [2, 4], expect: [0.909297, -0.416147, 0.019999, 0.9998], tolerance: 1e-6 },
  ],
  reference: `function positionalEncoding(pos, d) {
  const out = [];
  for (let i = 0; i < d / 2; i++) {
    const angle = pos / Math.pow(10000, (2 * i) / d);
    out.push(Math.sin(angle), Math.cos(angle));
  }
  return out;
}
`,
};
