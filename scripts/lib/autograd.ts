/** A minimal 2-D reverse-mode autograd, just enough to train the level-8 model offline. */
export class Tensor {
  readonly data: Float64Array;
  grad: Float64Array;
  backwardFn: (() => void) | null = null;

  constructor(
    readonly rows: number,
    readonly cols: number,
    data?: ArrayLike<number>,
    readonly parents: Tensor[] = [],
  ) {
    this.data = data ? Float64Array.from(data) : new Float64Array(rows * cols);
    if (this.data.length !== rows * cols) throw new Error(`Tensor data length ${this.data.length} != ${rows}x${cols}`);
    this.grad = new Float64Array(rows * cols);
  }

  static zeros(rows: number, cols: number): Tensor {
    return new Tensor(rows, cols);
  }

  /** Normal(0, std) values via Box–Muller. */
  static randn(rows: number, cols: number, rand: () => number, std: number): Tensor {
    const t = new Tensor(rows, cols);
    for (let i = 0; i < t.data.length; i++) {
      const u1 = Math.max(rand(), 1e-12);
      const u2 = rand();
      t.data[i] = std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    return t;
  }

  static fromRows(rows: number[][]): Tensor {
    return new Tensor(rows.length, rows[0].length, rows.flat());
  }

  toRows(): number[][] {
    return Array.from({ length: this.rows }, (_, i) => Array.from(this.data.subarray(i * this.cols, (i + 1) * this.cols)));
  }
}

function sameShape(a: Tensor, b: Tensor, op: string) {
  if (a.rows !== b.rows || a.cols !== b.cols) throw new Error(`${op}: ${a.rows}x${a.cols} vs ${b.rows}x${b.cols}`);
}

/** (n×k) · (k×m) */
export function matmul(a: Tensor, b: Tensor): Tensor {
  if (a.cols !== b.rows) throw new Error(`matmul: ${a.rows}x${a.cols} · ${b.rows}x${b.cols}`);
  const n = a.rows, k = a.cols, m = b.cols;
  const out = new Tensor(n, m, undefined, [a, b]);
  for (let i = 0; i < n; i++)
    for (let p = 0; p < k; p++) {
      const av = a.data[i * k + p];
      for (let j = 0; j < m; j++) out.data[i * m + j] += av * b.data[p * m + j];
    }
  out.backwardFn = () => {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const g = out.grad[i * m + j];
        for (let p = 0; p < k; p++) {
          a.grad[i * k + p] += g * b.data[p * m + j];
          b.grad[p * m + j] += g * a.data[i * k + p];
        }
      }
  };
  return out;
}

/** (n×k) · (m×k)ᵀ → n×m */
export function matmulBT(a: Tensor, b: Tensor): Tensor {
  if (a.cols !== b.cols) throw new Error(`matmulBT: ${a.rows}x${a.cols} · (${b.rows}x${b.cols})ᵀ`);
  const n = a.rows, k = a.cols, m = b.rows;
  const out = new Tensor(n, m, undefined, [a, b]);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) s += a.data[i * k + p] * b.data[j * k + p];
      out.data[i * m + j] = s;
    }
  out.backwardFn = () => {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const g = out.grad[i * m + j];
        for (let p = 0; p < k; p++) {
          a.grad[i * k + p] += g * b.data[j * k + p];
          b.grad[j * k + p] += g * a.data[i * k + p];
        }
      }
  };
  return out;
}

export function add(a: Tensor, b: Tensor): Tensor {
  sameShape(a, b, 'add');
  const out = new Tensor(a.rows, a.cols, undefined, [a, b]);
  for (let i = 0; i < out.data.length; i++) out.data[i] = a.data[i] + b.data[i];
  out.backwardFn = () => {
    for (let i = 0; i < out.data.length; i++) {
      a.grad[i] += out.grad[i];
      b.grad[i] += out.grad[i];
    }
  };
  return out;
}

/** Adds a 1×c bias row to every row of a. */
export function addRow(a: Tensor, bias: Tensor): Tensor {
  if (bias.rows !== 1 || bias.cols !== a.cols) throw new Error('addRow: bias must be 1×cols');
  const out = new Tensor(a.rows, a.cols, undefined, [a, bias]);
  for (let i = 0; i < a.rows; i++)
    for (let j = 0; j < a.cols; j++) out.data[i * a.cols + j] = a.data[i * a.cols + j] + bias.data[j];
  out.backwardFn = () => {
    for (let i = 0; i < a.rows; i++)
      for (let j = 0; j < a.cols; j++) {
        const g = out.grad[i * a.cols + j];
        a.grad[i * a.cols + j] += g;
        bias.grad[j] += g;
      }
  };
  return out;
}

export function relu(a: Tensor): Tensor {
  const out = new Tensor(a.rows, a.cols, undefined, [a]);
  for (let i = 0; i < a.data.length; i++) out.data[i] = Math.max(0, a.data[i]);
  out.backwardFn = () => {
    for (let i = 0; i < a.data.length; i++) if (a.data[i] > 0) a.grad[i] += out.grad[i];
  };
  return out;
}

export function scale(a: Tensor, k: number): Tensor {
  const out = new Tensor(a.rows, a.cols, undefined, [a]);
  for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] * k;
  out.backwardFn = () => {
    for (let i = 0; i < a.data.length; i++) a.grad[i] += out.grad[i] * k;
  };
  return out;
}

/** Row-wise softmax over columns 0..i for row i (square input). */
export function causalSoftmax(a: Tensor): Tensor {
  if (a.rows !== a.cols) throw new Error('causalSoftmax needs a square matrix');
  const n = a.rows;
  const out = new Tensor(n, n, undefined, [a]);
  for (let i = 0; i < n; i++) {
    let max = -Infinity;
    for (let j = 0; j <= i; j++) max = Math.max(max, a.data[i * n + j]);
    let sum = 0;
    for (let j = 0; j <= i; j++) {
      const e = Math.exp(a.data[i * n + j] - max);
      out.data[i * n + j] = e;
      sum += e;
    }
    for (let j = 0; j <= i; j++) out.data[i * n + j] /= sum;
  }
  out.backwardFn = () => {
    for (let i = 0; i < n; i++) {
      let dot = 0;
      for (let j = 0; j <= i; j++) dot += out.data[i * n + j] * out.grad[i * n + j];
      for (let j = 0; j <= i; j++) a.grad[i * n + j] += out.data[i * n + j] * (out.grad[i * n + j] - dot);
    }
  };
  return out;
}

/** Row lookup: returns ids.length × table.cols. */
export function embed(table: Tensor, ids: number[]): Tensor {
  const c = table.cols;
  const out = new Tensor(ids.length, c, undefined, [table]);
  ids.forEach((id, i) => out.data.set(table.data.subarray(id * c, (id + 1) * c), i * c));
  out.backwardFn = () => {
    ids.forEach((id, i) => {
      for (let j = 0; j < c; j++) table.grad[id * c + j] += out.grad[i * c + j];
    });
  };
  return out;
}

/** Mean cross-entropy of softmax(logits row i) against targets[i]. Returns 1×1. */
export function crossEntropy(logits: Tensor, targets: number[]): Tensor {
  const n = logits.rows, v = logits.cols;
  const probs = new Float64Array(n * v);
  let loss = 0;
  for (let i = 0; i < n; i++) {
    let max = -Infinity;
    for (let j = 0; j < v; j++) max = Math.max(max, logits.data[i * v + j]);
    let sum = 0;
    for (let j = 0; j < v; j++) {
      const e = Math.exp(logits.data[i * v + j] - max);
      probs[i * v + j] = e;
      sum += e;
    }
    for (let j = 0; j < v; j++) probs[i * v + j] /= sum;
    loss -= Math.log(probs[i * v + targets[i]]);
  }
  const out = new Tensor(1, 1, [loss / n], [logits]);
  out.backwardFn = () => {
    const g = out.grad[0] / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < v; j++)
        logits.grad[i * v + j] += g * (probs[i * v + j] - (j === targets[i] ? 1 : 0));
  };
  return out;
}

/** Σ t[i]·w[i] as a 1×1 tensor (used by gradient checks). */
export function weightedSum(t: Tensor, w: Float64Array): Tensor {
  let s = 0;
  for (let i = 0; i < t.data.length; i++) s += t.data[i] * w[i];
  const out = new Tensor(1, 1, [s], [t]);
  out.backwardFn = () => {
    for (let i = 0; i < t.data.length; i++) t.grad[i] += out.grad[0] * w[i];
  };
  return out;
}

/** Back-propagates from a 1×1 loss. Parameter grads accumulate; zero them yourself between steps. */
export function backward(loss: Tensor): void {
  const order: Tensor[] = [];
  const seen = new Set<Tensor>();
  const visit = (t: Tensor) => {
    if (seen.has(t)) return;
    seen.add(t);
    t.parents.forEach(visit);
    order.push(t);
  };
  visit(loss);
  loss.grad[0] = 1;
  for (let i = order.length - 1; i >= 0; i--) order[i].backwardFn?.();
}

export class Adam {
  private readonly m: Float64Array[];
  private readonly v: Float64Array[];
  private t = 0;

  constructor(
    private readonly params: Tensor[],
    private readonly lr = 0.005,
    private readonly beta1 = 0.9,
    private readonly beta2 = 0.999,
    private readonly eps = 1e-8,
  ) {
    this.m = params.map((p) => new Float64Array(p.data.length));
    this.v = params.map((p) => new Float64Array(p.data.length));
  }

  zeroGrad(): void {
    this.params.forEach((p) => p.grad.fill(0));
  }

  step(): void {
    this.t += 1;
    const c1 = 1 - this.beta1 ** this.t;
    const c2 = 1 - this.beta2 ** this.t;
    this.params.forEach((p, k) => {
      const m = this.m[k], v = this.v[k];
      for (let i = 0; i < p.data.length; i++) {
        const g = p.grad[i];
        m[i] = this.beta1 * m[i] + (1 - this.beta1) * g;
        v[i] = this.beta2 * v[i] + (1 - this.beta2) * g * g;
        p.data[i] -= (this.lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + this.eps);
      }
    });
  }
}
