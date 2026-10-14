import type { ChallengeDef } from './types';

export const inside8Challenge: ChallengeDef = {
  id: 'inside-8',
  title: 'The generation loop',
  prompt: `Every LLM writes text with the same loop: look at the text so far, pick the next token, append it, repeat.

Here the "model" is a simple lookup table: \`model[lastChar]\` is an object that maps each possible next character to its probability, for example \`{ e: 0.9, i: 0.1 }\`.

Write \`generate(model, prompt, n)\`. Repeat \`n\` times: take the **last** character of the text, pick the next character with the **highest** probability, and append it. Return the whole text (prompt plus the new characters).`,
  starterCode: `// model: { [char]: { [nextChar]: probability } }
// prompt: starting text, e.g. "h"
// n: how many characters to add
function generate(model, prompt, n) {
  // your code here
}
`,
  functionName: 'generate',
  tests: [
    { name: 'alternates a and b', args: [{ a: { b: 1 }, b: { a: 1 } }, 'a', 3], expect: 'abab' },
    { name: 'says hey!', args: [{ h: { e: 0.9, i: 0.1 }, e: { y: 1 }, y: { '!': 1 } }, 'h', 3], expect: 'hey!' },
    { name: 'picks the most likely, not the first', args: [{ a: { b: 0.2, c: 0.8 }, c: { a: 1 } }, 'a', 2], expect: 'aca' },
    { name: 'n = 0 returns the prompt', args: [{ x: { y: 1 } }, 'x', 0], expect: 'x' },
  ],
  reference: `function generate(model, prompt, n) {
  let text = prompt;
  for (let step = 0; step < n; step++) {
    const options = model[text[text.length - 1]];
    let best = null;
    for (const [ch, p] of Object.entries(options)) {
      if (best === null || p > options[best]) best = ch;
    }
    text += best;
  }
  return text;
}
`,
};
