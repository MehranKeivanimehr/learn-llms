import type { Exam } from './types';

export const inside8Exam: Exam = {
  levelId: 'inside-8',
  questions: [
    {
      kind: 'choice',
      prompt: 'What are the steps of the generation loop?',
      options: [
        'Tokenize → score every next token → pick one → append → repeat',
        'Plan the whole answer → check it → print it',
        'Translate → summarize → print',
        'Search the web → copy → paste',
      ],
      answer: 0,
      explain: 'Generation is the level-1 loop for real: score, pick, append, repeat.',
    },
    {
      kind: 'choice',
      prompt: 'Our tiny model can only see the last 16 characters. What is this limit called?',
      options: ['The context window', 'The vocabulary', 'The temperature', 'The embedding'],
      answer: 0,
      explain: 'Anything older than the context window is simply invisible to the model.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that makes the model always pick its most likely next character.',
      example: 'temperature 0',
      expect: [{ type: 'temperature', value: 0 }],
      explain: '`temperature 0` turns sampling into greedy decoding.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that sets the prompt to "twinkle, twinkle, " (keep the space at the end — use quotes).',
      example: 'prompt "twinkle, twinkle, "',
      expect: [{ type: 'prompt', value: 'twinkle, twinkle, ' }],
      explain: 'Quotes keep the trailing space: `prompt "twinkle, twinkle, "`.',
    },
    {
      kind: 'text',
      prompt: 'After "mary had a little ", what word does the model write next? (type the word)',
      accept: ['lamb'],
      explain: 'The model memorized "mary had a little lamb" — the context window tells the two rhymes apart.',
    },
  ],
};
