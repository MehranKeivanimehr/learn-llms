import type { ChallengeDef } from './types';

export const inside1Challenge: ChallengeDef = {
  id: 'inside-1',
  title: 'Pick the most likely token',
  prompt: `The model's output is a list of probabilities — one per word it knows. To pick the single most likely word (called **greedy decoding**), you need the **position** of the biggest number.

Write \`argmax(probs)\` that returns the index of the largest value. If two values tie, return the first one.`,
  starterCode: `// probs is an array of numbers, e.g. [0.1, 0.7, 0.2]
// Return the INDEX of the largest number (the first one if there is a tie).
function argmax(probs) {
  // your code here
}
`,
  functionName: 'argmax',
  tests: [
    { name: 'finds the middle value', args: [[0.1, 0.7, 0.2]], expect: 1 },
    { name: 'returns the first index on a tie', args: [[0.5, 0.5]], expect: 0 },
    { name: 'works with one value', args: [[1]], expect: 0 },
    { name: 'works with negative numbers (raw scores)', args: [[-1, -3, -0.5]], expect: 2 },
  ],
  reference: `function argmax(probs) {
  let best = 0;
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > probs[best]) best = i;
  }
  return best;
}
`,
};
