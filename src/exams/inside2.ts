import type { Exam } from './types';

export const inside2Exam: Exam = {
  levelId: 'inside-2',
  questions: [
    {
      kind: 'choice',
      prompt: 'Why do LLMs use tokens instead of whole words or single letters?',
      options: [
        'Tokens are always single letters',
        'There are too many possible words, and single letters make text very long — tokens are a compromise',
        'Tokens keep the text secret',
        'Computers cannot store words',
      ],
      answer: 1,
      explain: 'Common words become one token and rare words split into pieces, keeping both the vocabulary and the text short.',
    },
    {
      kind: 'choice',
      prompt: 'In byte-pair encoding, which pair is merged next?',
      options: [
        'The pair that appears most often',
        'The alphabetically first pair',
        'The pair at the start of the text',
        'A random pair',
      ],
      answer: 0,
      explain: 'BPE always merges the most frequent neighbouring pair, then counts again.',
    },
    {
      kind: 'command',
      prompt: 'Type the command that merges every "l" followed by "o" into one token.',
      example: 'merge l o',
      expect: [{ type: 'merge', pair: ['l', 'o'] }],
      explain: '`merge l o` turns every l·o neighbour pair into the single token "lo".',
    },
    {
      kind: 'text',
      prompt: 'You merge "l" + "o" in the tokens l · o · w. How many tokens are left? (type a number)',
      accept: ['2', 'two'],
      explain: 'l · o · w becomes lo · w — 2 tokens.',
    },
    {
      kind: 'choice',
      prompt: 'Why is "how many r\'s are in strawberry?" tricky for an LLM?',
      options: [
        'It has never seen the word',
        'It sees tokens like "str", "aw", "berry", so the letters are hidden inside them',
        'It cannot count past two',
        'The question is too long',
      ],
      answer: 1,
      explain: 'The model works with tokens, not letters, so it has to have learned how each token is spelled.',
    },
  ],
};
