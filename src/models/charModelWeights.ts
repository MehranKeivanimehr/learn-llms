import type { Mat, Vec } from './linalg';

export interface CharModelWeights {
  vocab: string[];
  d: number;
  ctx: number;
  hidden: number;
  tokEmb: Mat;
  posEmb: Mat;
  Wq: Mat;
  Wk: Mat;
  Wv: Mat;
  Wo: Mat;
  W1: Mat;
  b1: Vec;
  W2: Mat;
  b2: Vec;
  Wout: Mat;
  bout: Vec;
}
