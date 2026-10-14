import type { Exam } from './types';

export const inside1Exam: Exam = {
  levelId: 'inside-1',
  questions: [
    {
      kind: 'choice',
      prompt: 'What does a language model produce at each step?',
      options: [
        'A single word it is sure about',
        'A probability for every token it knows',
        'The whole answer at once',
        'A list of matching web pages',
      ],
      answer: 1,
      explain: 'It scores every possible next token; choosing one of them is a separate step.',
    },
    {
      kind: 'choice',
      prompt: 'How does an LLM write a long answer?',
      options: [
        'It plans every word first, then prints them',
        'It predicts one token, adds it to the context, and repeats',
        'It copies the closest sentence from its training data',
        'It writes the last word first',
      ],
      answer: 1,
      explain: 'A long answer is the same next-token step, repeated many times.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that adds the word France to the end of the context.',
      example: 'add France',
      expect: [{ type: 'add', word: 'France' }],
      explain: '`add France` appends it — and France pulls strongly toward Paris.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that removes Germany from the context.',
      example: 'remove Germany',
      expect: [{ type: 'remove', index: 3 }],
      explain: '`remove Germany` (or `rm Germany`) takes it out, so it stops pulling toward Berlin.',
    },
    {
      kind: 'choice',
      prompt: 'In our toy model, which context words pull hardest on the next word?',
      options: ['The oldest words', 'The most recent words', 'Only the first word', 'All words exactly equally'],
      answer: 1,
      explain: 'Each older word counts 0.8 times as much as the word after it.',
    },
  ],
};
