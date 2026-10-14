import { attentionWeights } from './attention';
import { QUERY, VALUES } from './data/order6Data';
import { scaleVec } from './linalg';
import { positionalEncoding } from './positional';

export interface HurtAnswer {
  answer: 'dog' | 'man' | 'unsure';
  confidence: number;
  weights: number[];
}

/**
 * Every word has the same (zero) content key, so without position signals attention
 * can't tell the words apart. With positions on, each key is the scaled positional
 * encoding of the word's position.
 */
export function whoGotHurt(sentence: string[], usePositions: boolean, scale: number): HurtAnswer {
  const keys = sentence.map((_, i) => (usePositions ? scaleVec(positionalEncoding(i, 2), scale) : [0, 0]));
  const weights = attentionWeights(QUERY, keys);
  let dog = 0;
  let man = 0;
  sentence.forEach((word, i) => {
    const v = VALUES[word] ?? [0, 0];
    dog += weights[i] * v[0];
    man += weights[i] * v[1];
  });
  if (Math.abs(dog - man) < 1e-9) return { answer: 'unsure', confidence: Math.max(dog, man), weights };
  return dog > man ? { answer: 'dog', confidence: dog, weights } : { answer: 'man', confidence: man, weights };
}
