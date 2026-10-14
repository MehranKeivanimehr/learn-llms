import type { Exam } from './types';

export const inside5Exam: Exam = {
  levelId: 'inside-5',
  questions: [
    {
      kind: 'choice',
      prompt: "In attention, what does a word's query represent?",
      options: ['What it is looking for', 'What it contains', 'What it will share', 'Its position in the sentence'],
      answer: 0,
      explain: 'The query asks the question; keys say what each word contains; values are what gets shared.',
    },
    {
      kind: 'choice',
      prompt: 'Why are attention scores divided by √d?',
      options: [
        'To keep the numbers in a stable range before softmax',
        'To make them negative',
        'To count the words',
        'To sort the words alphabetically',
      ],
      answer: 0,
      explain: 'Long vectors give big dot products; dividing by √d keeps softmax from becoming too extreme.',
    },
    {
      kind: 'choice',
      prompt: "After softmax, one word's attention weights…",
      options: ['Add up to 1', 'Are all equal', 'Add up to the number of words', 'Can be any numbers at all'],
      answer: 0,
      explain: 'Softmax turns the scores into weights that are positive and add up to 1.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that sets the query for "it" to x = 3 and y = −1.5.',
      example: 'query it --x 3 --y -1.5',
      expect: [
        { type: 'qx', value: 3 },
        { type: 'qy', value: -1.5 },
      ],
      explain: '`query it --x 3 --y -1.5` points the query toward "animal" and away from "street".',
    },
    {
      kind: 'text',
      prompt: 'In "The animal didn\'t cross the street because it was tired", which word should "it" attend to most? (type the word)',
      accept: ['animal', 'the animal'],
      explain: 'Streets don’t get tired — "it" refers to the animal.',
    },
  ],
};
