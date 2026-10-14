export const TOKENS = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'];

/** 2-D key vectors, one per token. Chosen so "animal" and "street" point in different directions. */
export const KEYS: [number, number][] = [
  [0, 0], [2, 1], [0, 0.5], [0.5, 0], [0, 0], [1, 2], [0, 0], [0.5, 0.5], [0, 0], [0.5, -0.5],
];

export const ANIMAL = 1;
export const STREET = 5;
