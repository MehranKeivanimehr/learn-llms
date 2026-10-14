export function argmax(xs: number[]): number {
  if (xs.length === 0) throw new Error('argmax of an empty array');
  let best = 0;
  for (let i = 1; i < xs.length; i++) if (xs[i] > xs[best]) best = i;
  return best;
}

export function softmax(logits: number[], temperature = 1): number[] {
  if (logits.length === 0) return [];
  if (temperature <= 0) {
    const out = logits.map(() => 0);
    out[argmax(logits)] = 1;
    return out;
  }
  const scaled = logits.map((l) => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function renormalize(ps: number[]): number[] {
  const sum = ps.reduce((a, b) => a + b, 0);
  return sum === 0 ? ps : ps.map((p) => p / sum);
}

function orderByProbability(probs: number[]): number[] {
  return probs.map((_, i) => i).sort((a, b) => probs[b] - probs[a] || a - b);
}

export function topK(probs: number[], k: number): number[] {
  if (k <= 0 || k >= probs.length) return probs.slice();
  const keep = new Set(orderByProbability(probs).slice(0, k));
  return renormalize(probs.map((p, i) => (keep.has(i) ? p : 0)));
}

export function topP(probs: number[], p: number): number[] {
  if (p >= 1) return probs.slice();
  const keep = new Set<number>();
  let cumulative = 0;
  for (const i of orderByProbability(probs)) {
    keep.add(i);
    cumulative += probs[i];
    if (cumulative >= p) break;
  }
  return renormalize(probs.map((q, i) => (keep.has(i) ? q : 0)));
}

export interface SamplerSettings {
  temperature: number;
  /** 0 means "off" */
  topK: number;
  /** 1 means "off" */
  topP: number;
}

export function distribution(logits: number[], s: SamplerSettings): number[] {
  return topP(topK(softmax(logits, s.temperature), s.topK), s.topP);
}

/** Small, fast, seedable PRNG. Returns numbers in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleIndex(probs: number[], rand: () => number): number {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (r < cumulative) return i;
  }
  for (let i = probs.length - 1; i >= 0; i--) if (probs[i] > 0) return i;
  return 0;
}
