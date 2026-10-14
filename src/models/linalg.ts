export type Vec = number[];
export type Mat = number[][];

function assertSameLength(a: Vec, b: Vec): void {
  if (a.length !== b.length) throw new Error(`Length mismatch: ${a.length} vs ${b.length}`);
}

export function dot(a: Vec, b: Vec): number {
  assertSameLength(a, b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function addVec(a: Vec, b: Vec): Vec {
  assertSameLength(a, b);
  return a.map((x, i) => x + b[i]);
}

export function subVec(a: Vec, b: Vec): Vec {
  assertSameLength(a, b);
  return a.map((x, i) => x - b[i]);
}

export function scaleVec(a: Vec, k: number): Vec {
  return a.map((x) => x * k);
}

export function norm(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

export function transpose(m: Mat): Mat {
  if (m.length === 0) return [];
  return m[0].map((_, j) => m.map((row) => row[j]));
}

/** (n×k) · (k×m) → (n×m) */
export function matmul(a: Mat, b: Mat): Mat {
  return a.map((row) => vecMat(row, b));
}

/** row vector x (length k) · matrix w (k×m) → vector of length m */
export function vecMat(x: Vec, w: Mat): Vec {
  if (x.length !== w.length) throw new Error(`Length mismatch: ${x.length} vs ${w.length}`);
  const cols = w.length === 0 ? 0 : w[0].length;
  const out = zeros(cols);
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < cols; j++) out[j] += x[i] * w[i][j];
  }
  return out;
}

export function zeros(n: number): Vec {
  return new Array(n).fill(0);
}
