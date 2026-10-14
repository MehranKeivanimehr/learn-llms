import type { Exam } from './types';

export const inside7Exam: Exam = {
  levelId: 'inside-7',
  questions: [
    {
      kind: 'choice',
      prompt: 'What is the order inside one (post-norm) transformer block?',
      options: [
        'Self-attention → Add & Norm → MLP → Add & Norm',
        'MLP → Self-attention → Add & Norm → Add & Norm',
        'Add & Norm → Add & Norm → MLP → Self-attention',
        'Self-attention → MLP → Add & Norm → Add & Norm',
      ],
      answer: 0,
      explain: 'Words first gather information from each other, then each word is processed on its own, each followed by Add & Norm.',
    },
    {
      kind: 'choice',
      prompt: 'What does the residual connection ("Add") do?',
      options: [
        "Adds the sub-layer's output to its input instead of replacing it",
        'Adds more words to the context',
        'Adds a new attention head',
        'Adds random noise for creativity',
      ],
      answer: 0,
      explain: 'Each block only has to learn a change, and information can flow straight through many blocks.',
    },
    {
      kind: 'choice',
      prompt: 'Layer normalization rescales each vector to…',
      options: ['Mean 0 and variance 1', 'Length 0', 'Only positive numbers', 'A largest value of 1'],
      answer: 0,
      explain: 'Keeping every vector at mean 0 and variance 1 keeps the numbers healthy through many blocks.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that puts self-attention into step 1.',
      example: 'place attention 1',
      expect: [{ type: 'place', piece: 'attention', slot: 0 }],
      explain: '`place attention 1` fills the first step of the block.',
    },
    {
      kind: 'choice',
      prompt: "Where does much of a transformer's stored knowledge live?",
      options: ['In the MLP layers', 'In the tokenizer', 'In the positional encoding', 'In the softmax'],
      answer: 0,
      explain: 'The MLP layers hold most of the learned weights that store facts and patterns.',
    },
  ],
};
