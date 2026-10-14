import type { Exam } from './types';

export const inside6Exam: Exam = {
  levelId: 'inside-6',
  questions: [
    {
      kind: 'choice',
      prompt: 'Without position signals, how does attention see "dog bites man" and "man bites dog"?',
      options: ['As different sentences', 'As identical', 'As opposites', 'As unrelated'],
      answer: 1,
      explain: 'Attention compares words but nothing says where each word is, so the two orders look the same.',
    },
    {
      kind: 'choice',
      prompt: 'Sinusoidal positional encoding gives each position…',
      options: [
        'A random number',
        'A unique pattern of sine and cosine waves',
        'The length of its word',
        "The previous word's embedding",
      ],
      answer: 1,
      explain: 'Each position gets its own mix of waves at different speeds, added to the word’s vector.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that turns position signals on.',
      example: 'positions on',
      expect: [{ type: 'togglePositions' }],
      explain: '`positions on` adds the position pattern to every word before attention runs.',
    },
    {
      kind: 'choice',
      prompt: 'Why do transformers use several attention heads?',
      options: [
        'To look for several kinds of relationships at once',
        'To make the model slower',
        'Because one head can only read one word',
        'To store the vocabulary',
      ],
      answer: 0,
      explain: 'One head might track who did what, another might link pronouns to nouns; their results are combined.',
    },
    {
      kind: 'text',
      prompt: 'In "man bites dog", who got hurt? (type one word)',
      accept: ['dog', 'the dog'],
      explain: 'The word after the verb is the one who got bitten — the dog.',
    },
  ],
};
