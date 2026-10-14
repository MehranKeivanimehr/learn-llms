import type { ChallengeDef } from './types';

export const inside2Challenge: ChallengeDef = {
  id: 'inside-2',
  title: 'Write one BPE merge step',
  prompt: `A tokenizer learns a list of **merges**. Applying a merge means: walk through the tokens from left to right, and every time you see the pair \`[a, b]\` next to each other, replace the two tokens with one token \`a + b\`. Pairs can't overlap: \`["a","a","a"]\` merged with \`["a","a"]\` becomes \`["aa","a"]\`.

Write \`merge(tokens, pair)\` that returns a **new** array.`,
  starterCode: `// tokens: array of strings, e.g. ["l", "o", "w"]
// pair: two strings, e.g. ["o", "w"]
// Return a new array where each "o","w" next to each other becomes "ow".
function merge(tokens, pair) {
  // your code here
}
`,
  functionName: 'merge',
  tests: [
    { name: 'merges every occurrence', args: [['a', 'b', 'a', 'b'], ['a', 'b']], expect: ['ab', 'ab'] },
    { name: 'does not overlap', args: [['a', 'a', 'a'], ['a', 'a']], expect: ['aa', 'a'] },
    { name: 'leaves tokens alone when the pair is absent', args: [['x', 'y'], ['a', 'b']], expect: ['x', 'y'] },
    { name: 'merges in the middle of a word', args: [['l', 'o', 'w'], ['o', 'w']], expect: ['l', 'ow'] },
    { name: 'works with longer tokens', args: [['lo', 'w', 'e', 'r'], ['lo', 'w']], expect: ['low', 'e', 'r'] },
  ],
  reference: `function merge(tokens, pair) {
  const [a, b] = pair;
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    if (i < tokens.length - 1 && tokens[i] === a && tokens[i + 1] === b) {
      out.push(a + b);
      i += 2;
    } else {
      out.push(tokens[i]);
      i += 1;
    }
  }
  return out;
}
`,
};
