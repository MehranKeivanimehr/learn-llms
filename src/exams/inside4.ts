import type { Exam } from './types';

export const inside4Exam: Exam = {
  levelId: 'inside-4',
  questions: [
    {
      kind: 'choice',
      prompt: 'What does temperature 0 do?',
      options: [
        'Always picks the most likely token (greedy)',
        'Picks a completely random token',
        'Turns the model off',
        'Makes rare tokens more likely',
      ],
      answer: 0,
      explain: 'At temperature 0 all the probability goes to the favourite, so the output is fully predictable.',
    },
    {
      kind: 'choice',
      prompt: 'What does a high temperature, like 2, do to the probabilities?',
      options: [
        'Makes the favourite even stronger',
        'Flattens them, so unlikely tokens are picked more often',
        'Removes all off-topic tokens',
        'Nothing at all',
      ],
      answer: 1,
      explain: 'Dividing the scores by a big number squeezes them together, so the probabilities even out.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that keeps only the 3 most likely tokens.',
      example: 'set top-k 3',
      expect: [{ type: 'topK', value: 3 }],
      explain: '`set top-k 3` keeps the three most likely tokens and throws the rest away.',
    },
    {
      kind: 'choice',
      prompt: 'Top-p = 0.9 keeps…',
      options: [
        'The 9 most likely tokens',
        'Only tokens with probability above 0.9',
        'The smallest group of top tokens whose probabilities add up to at least 0.9',
        '90% of all tokens, chosen at random',
      ],
      answer: 2,
      explain: 'Top-p (nucleus sampling) keeps adding the most likely tokens until their total reaches p.',
    },
    {
      kind: 'choice',
      prompt: 'Which setting suits writing code or stating facts?',
      options: ['A low temperature', 'A high temperature', 'Top-k off and temperature 2', 'Random sampling with no limits'],
      answer: 0,
      explain: 'Low temperature keeps the model on its most likely, most consistent choices.',
    },
  ],
};
