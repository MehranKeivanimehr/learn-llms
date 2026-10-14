import { selfAttention, type AttentionParams } from './attention';
import { addVec, vecMat, zeros, type Mat, type Vec } from './linalg';

export function layerNorm(x: Vec, gamma?: Vec, beta?: Vec, eps = 1e-5): Vec {
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const variance = x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
  const inv = 1 / Math.sqrt(variance + eps);
  return x.map((v, i) => (v - mean) * inv * (gamma ? gamma[i] : 1) + (beta ? beta[i] : 0));
}

export function relu(x: Vec): Vec {
  return x.map((v) => Math.max(0, v));
}

export function linear(x: Vec, W: Mat, b?: Vec): Vec {
  const out = vecMat(x, W);
  return b ? addVec(out, b) : out;
}

export interface MlpParams {
  W1: Mat;
  b1: Vec;
  W2: Mat;
  b2: Vec;
}

export function mlp(x: Vec, p: MlpParams): Vec {
  return linear(relu(linear(x, p.W1, p.b1)), p.W2, p.b2);
}

export function addAndNorm(x: Vec, sub: Vec): Vec {
  return layerNorm(addVec(x, sub));
}

export interface BlockParams {
  attention: AttentionParams;
  mlp: MlpParams;
}

/** Post-norm block: attention → add & norm → MLP → add & norm. */
export function transformerBlock(X: Mat, p: BlockParams): Mat {
  const a = selfAttention(X, p.attention).output;
  const h = X.map((row, i) => addAndNorm(row, a[i]));
  return h.map((row) => addAndNorm(row, mlp(row, p.mlp)));
}

export type BlockPiece = 'attention' | 'mlp' | 'addnorm';

/**
 * Run block pieces in any order. "attention" and "mlp" compute a pending sub-layer
 * output from the current stream; "addnorm" adds the pending output (or zeros) to
 * the stream and normalizes. A pending output that is never added is discarded.
 */
export function runPipeline(X: Mat, pieces: BlockPiece[], p: BlockParams): Mat {
  let stream = X;
  let pending: Mat | null = null;
  for (const piece of pieces) {
    if (piece === 'attention') {
      pending = selfAttention(stream, p.attention).output;
    } else if (piece === 'mlp') {
      pending = stream.map((row) => mlp(row, p.mlp));
    } else {
      const add = pending;
      stream = stream.map((row, i) => addAndNorm(row, add ? add[i] : zeros(row.length)));
      pending = null;
    }
  }
  return stream;
}
