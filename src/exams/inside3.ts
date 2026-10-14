import type { Exam } from './types';

export const inside3Exam: Exam = {
  levelId: 'inside-3',
  questions: [
    {
      kind: 'choice',
      prompt: 'What is an embedding?',
      options: [
        'A list of numbers that represents a token',
        'A picture of a word',
        "The token's position in the sentence",
        'A spelling correction',
      ],
      answer: 0,
      explain: 'Each token is looked up in a table and replaced by a vector of numbers.',
    },
    {
      kind: 'choice',
      prompt: 'What is the cosine similarity of two arrows pointing in exactly opposite directions?',
      options: ['1', '0', '−1', 'It is undefined'],
      answer: 2,
      explain: 'Same direction gives 1, a right angle gives 0, opposite directions give −1.',
    },
    {
      kind: 'text',
      prompt: 'What is the cosine similarity of [1, 0] and [0, 1]? (type a number)',
      accept: ['0', '0.0', 'zero'],
      explain: 'The two arrows are at a right angle, so their dot product — and similarity — is 0.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that moves "queen" to the point (4, 3).',
      example: 'move queen 4 3',
      expect: [{ type: 'move', to: [4, 3] }],
      explain: '`move queen 4 3` puts queen exactly where king − man + woman points.',
    },
    {
      kind: 'choice',
      prompt: 'What does king − man + woman ≈ queen show?',
      options: [
        'Embeddings are random',
        'Directions in embedding space can carry meaning',
        'King and queen have the same embedding',
        'You can only do arithmetic on numbers, not words',
      ],
      answer: 1,
      explain: 'The step from man to woman is roughly the same as the step from king to queen.',
    },
  ],
};
