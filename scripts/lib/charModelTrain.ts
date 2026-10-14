import type { CharModelWeights } from '../../src/models/charModelWeights';
import {
  add, addRow, causalSoftmax, embed, matmul, matmulBT, relu, scale, Tensor,
} from './autograd';

export interface CharModelConfig {
  vocabSize: number;
  d: number;
  ctx: number;
  hidden: number;
}

export const PARAM_NAMES = ['tokEmb', 'posEmb', 'Wq', 'Wk', 'Wv', 'Wo', 'W1', 'b1', 'W2', 'b2', 'Wout', 'bout'] as const;
export type Params = Record<(typeof PARAM_NAMES)[number], Tensor>;

export function initParams(cfg: CharModelConfig, rand: () => number): Params {
  const { vocabSize: V, d, ctx, hidden: H } = cfg;
  const r = (rows: number, cols: number, std: number) => Tensor.randn(rows, cols, rand, std);
  return {
    tokEmb: r(V, d, 0.1),
    posEmb: r(ctx, d, 0.1),
    Wq: r(d, d, 1 / Math.sqrt(d)),
    Wk: r(d, d, 1 / Math.sqrt(d)),
    Wv: r(d, d, 1 / Math.sqrt(d)),
    Wo: r(d, d, 1 / Math.sqrt(d)),
    W1: r(d, H, 1 / Math.sqrt(d)),
    b1: Tensor.zeros(1, H),
    W2: r(H, d, 1 / Math.sqrt(H)),
    b2: Tensor.zeros(1, d),
    Wout: r(d, V, 1 / Math.sqrt(d)),
    bout: Tensor.zeros(1, V),
  };
}

export function paramsList(p: Params): Tensor[] {
  return PARAM_NAMES.map((n) => p[n]);
}

/** Logits for every position: ids.length × vocab. ids.length must be ≤ ctx. */
export function forward(p: Params, ids: number[]): Tensor {
  if (ids.length > p.posEmb.rows) throw new Error(`forward: ${ids.length} tokens exceeds context ${p.posEmb.rows}`);
  const d = p.Wq.rows;
  const x = add(embed(p.tokEmb, ids), embed(p.posEmb, ids.map((_, i) => i)));
  const q = matmul(x, p.Wq);
  const k = matmul(x, p.Wk);
  const v = matmul(x, p.Wv);
  const att = causalSoftmax(scale(matmulBT(q, k), 1 / Math.sqrt(d)));
  const h = add(x, matmul(matmul(att, v), p.Wo));
  const m = addRow(matmul(relu(addRow(matmul(h, p.W1), p.b1)), p.W2), p.b2);
  const y = add(h, m);
  return addRow(matmul(y, p.Wout), p.bout);
}

const round = (x: number, decimals: number) => Number(x.toFixed(decimals));

export function toWeights(p: Params, vocab: string[], cfg: CharModelConfig, decimals = 5): CharModelWeights {
  const mat = (t: Tensor) => t.toRows().map((row) => row.map((x) => round(x, decimals)));
  const vec = (t: Tensor) => Array.from(t.data, (x) => round(x, decimals));
  return {
    vocab,
    d: cfg.d,
    ctx: cfg.ctx,
    hidden: cfg.hidden,
    tokEmb: mat(p.tokEmb),
    posEmb: mat(p.posEmb),
    Wq: mat(p.Wq),
    Wk: mat(p.Wk),
    Wv: mat(p.Wv),
    Wo: mat(p.Wo),
    W1: mat(p.W1),
    b1: vec(p.b1),
    W2: mat(p.W2),
    b2: vec(p.b2),
    Wout: mat(p.Wout),
    bout: vec(p.bout),
  };
}

export function paramsFromWeights(w: CharModelWeights): Params {
  const row = (v: number[]) => new Tensor(1, v.length, v);
  return {
    tokEmb: Tensor.fromRows(w.tokEmb),
    posEmb: Tensor.fromRows(w.posEmb),
    Wq: Tensor.fromRows(w.Wq),
    Wk: Tensor.fromRows(w.Wk),
    Wv: Tensor.fromRows(w.Wv),
    Wo: Tensor.fromRows(w.Wo),
    W1: Tensor.fromRows(w.W1),
    b1: row(w.b1),
    W2: Tensor.fromRows(w.W2),
    b2: row(w.b2),
    Wout: Tensor.fromRows(w.Wout),
    bout: row(w.bout),
  };
}

/** Greedy generation with the training forward pass (used to verify training). */
export function greedyTrain(p: Params, vocab: string[], ctx: number, prompt: string, n: number): string {
  const ids = Array.from(prompt).map((c) => vocab.indexOf(c)).filter((i) => i >= 0);
  let out = '';
  for (let s = 0; s < n; s++) {
    const window = ids.slice(-ctx);
    const logits = forward(p, window);
    const last = logits.data.subarray((window.length - 1) * vocab.length, window.length * vocab.length);
    let best = 0;
    for (let j = 1; j < last.length; j++) if (last[j] > last[best]) best = j;
    ids.push(best);
    out += vocab[best];
  }
  return out;
}
