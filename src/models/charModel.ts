import { selfAttention } from './attention';
import { linear, mlp } from './block';
import type { CharModelWeights } from './charModelWeights';
import { addVec, vecMat } from './linalg';
import { argmax, distribution, mulberry32, sampleIndex, type SamplerSettings } from './sampling';
import rawWeights from './weights/char-model.json';

export const CHAR_MODEL = rawWeights as unknown as CharModelWeights;

export function encodeText(w: CharModelWeights, text: string): number[] {
  return Array.from(text.toLowerCase())
    .map((c) => w.vocab.indexOf(c))
    .filter((i) => i >= 0);
}

/** Logits for the token after the last one. Only the last `ctx` tokens are visible. */
export function lastLogits(w: CharModelWeights, ids: number[]): number[] {
  let window = ids.slice(-w.ctx);
  if (window.length === 0) {
    const newline = w.vocab.indexOf('\n');
    window = [newline >= 0 ? newline : 0];
  }
  const X = window.map((id, i) => addVec(w.tokEmb[id], w.posEmb[i]));
  const { output } = selfAttention(X, { Wq: w.Wq, Wk: w.Wk, Wv: w.Wv }, true);
  const last = X.length - 1;
  const h = addVec(X[last], vecMat(output[last], w.Wo));
  const y = addVec(h, mlp(h, { W1: w.W1, b1: w.b1, W2: w.W2, b2: w.b2 }));
  return linear(y, w.Wout, w.bout);
}

export interface GenerationStep {
  probs: number[];
  chosen: number;
}

export function generate(
  w: CharModelWeights,
  prompt: string,
  n: number,
  settings: SamplerSettings,
  seed: number,
): { text: string; steps: GenerationStep[] } {
  const rand = mulberry32(seed);
  const ids = encodeText(w, prompt);
  const steps: GenerationStep[] = [];
  let text = '';
  for (let s = 0; s < n; s++) {
    const probs = distribution(lastLogits(w, ids), settings);
    const chosen = settings.temperature <= 0 ? argmax(probs) : sampleIndex(probs, rand);
    steps.push({ probs, chosen });
    ids.push(chosen);
    text += w.vocab[chosen];
  }
  return { text, steps };
}

/** The part of the text the model can actually see. */
export function visibleContext(w: CharModelWeights, text: string): string {
  return encodeText(w, text)
    .slice(-w.ctx)
    .map((i) => w.vocab[i])
    .join('');
}

export function showChar(c: string): string {
  return c === ' ' ? '␣' : c === '\n' ? '↵' : c;
}
