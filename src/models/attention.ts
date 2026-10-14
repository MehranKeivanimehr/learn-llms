import { dot, matmul, zeros, type Mat, type Vec } from './linalg';
import { softmax } from './sampling';

export function attentionWeights(q: Vec, keys: Vec[]): number[] {
  const scale = 1 / Math.sqrt(q.length);
  return softmax(keys.map((k) => dot(q, k) * scale));
}

export function attend(q: Vec, keys: Vec[], values: Vec[]): { weights: number[]; output: Vec } {
  const weights = attentionWeights(q, keys);
  const output = zeros(values[0].length);
  weights.forEach((w, i) => values[i].forEach((v, j) => (output[j] += w * v)));
  return { weights, output };
}

export interface AttentionParams {
  Wq: Mat;
  Wk: Mat;
  Wv: Mat;
}

export function selfAttention(X: Mat, p: AttentionParams, causal = false): { weights: Mat; output: Mat } {
  const Q = matmul(X, p.Wq);
  const K = matmul(X, p.Wk);
  const V = matmul(X, p.Wv);
  const weights: Mat = [];
  const output: Mat = [];
  for (let i = 0; i < X.length; i++) {
    const visible = causal ? i + 1 : X.length;
    const r = attend(Q[i], K.slice(0, visible), V.slice(0, visible));
    weights.push([...r.weights, ...zeros(X.length - visible)]);
    output.push(r.output);
  }
  return { weights, output };
}
