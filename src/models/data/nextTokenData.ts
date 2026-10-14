/** The toy model's whole vocabulary. Order matters only for tie-breaking (first wins). */
export const VOCAB = [
  'The', 'the', 'capital', 'of', 'France', 'Germany', 'Italy', 'is', 'Paris',
  'Berlin', 'Rome', 'city', 'beautiful', 'a', 'I', 'love', 'in',
];

/** Every word's score before looking at the context. */
export const BIAS: Record<string, number> = { the: 0.5, is: 0.3 };

/** ASSOC[contextWord][nextWord] = how strongly contextWord pulls toward nextWord. */
export const ASSOC: Record<string, Record<string, number>> = {
  The: { capital: 1, city: 1 },
  the: { capital: 1, city: 1 },
  capital: { Paris: 1, Berlin: 1, Rome: 1, city: 1.5 },
  of: { France: 0.5, Germany: 0.5, Italy: 0.5, the: 1 },
  France: { Paris: 3, is: 1 },
  Germany: { Berlin: 3, is: 1 },
  Italy: { Rome: 3, is: 1 },
  is: { Paris: 0.5, Berlin: 0.5, Rome: 0.5, beautiful: 1, a: 1 },
  I: { love: 2 },
  love: { Paris: 1, Rome: 1, the: 1 },
  a: { city: 2, beautiful: 1 },
  beautiful: { city: 2 },
  in: { Paris: 1, Berlin: 1, Rome: 1, France: 1, Germany: 1, Italy: 1 },
  city: { is: 1, of: 1 },
  Paris: { is: 1 },
  Berlin: { is: 1 },
  Rome: { is: 1 },
};

/** The most recent word counts fully; each older word counts DECAY times less. */
export const DECAY = 0.8;
