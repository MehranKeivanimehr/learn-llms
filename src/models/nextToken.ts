import { ASSOC, BIAS, DECAY, VOCAB } from './data/nextTokenData';
import { argmax, softmax } from './sampling';

export function nextTokenLogits(context: string[]): number[] {
  const n = context.length;
  return VOCAB.map((word) => {
    let score = BIAS[word] ?? 0;
    context.forEach((c, i) => {
      score += Math.pow(DECAY, n - 1 - i) * (ASSOC[c]?.[word] ?? 0);
    });
    return score;
  });
}

export function nextTokenProbs(context: string[]): number[] {
  return softmax(nextTokenLogits(context));
}

export function topPrediction(context: string[]): string {
  return VOCAB[argmax(nextTokenLogits(context))];
}
