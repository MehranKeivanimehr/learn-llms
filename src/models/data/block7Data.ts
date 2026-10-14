import type { BlockParams } from '../block';

export const TOKENS = ['the', 'cat', 'sat'];

/** One 4-D vector per token. */
export const X = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 1],
];

const I4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

export const PARAMS: BlockParams = {
  attention: {
    Wq: I4,
    Wk: I4,
    Wv: [
      [0, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 0],
    ],
  },
  mlp: {
    W1: [
      [1, 0, 0, -1],
      [0, 1, -1, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
    ],
    b1: [0, 0, 0, -0.5],
    W2: [
      [0.5, 0, 0, 0],
      [0, -0.5, 0, 0],
      [0, 0, 1, 0],
      [0.2, 0.2, 0.2, 0.2],
    ],
    b2: [0, 0.1, 0, 0],
  },
};
