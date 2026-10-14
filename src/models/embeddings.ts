import { addVec, dot, norm, subVec, type Vec } from './linalg';

export function cosineSimilarity(a: Vec, b: Vec): number {
  const denominator = norm(a) * norm(b);
  return denominator === 0 ? 0 : dot(a, b) / denominator;
}

function lookup(table: Record<string, Vec>, word: string): Vec {
  const v = table[word];
  if (!v) throw new Error(`Unknown word: ${word}`);
  return v;
}

/** a − b + c, e.g. king − man + woman */
export function analogy(table: Record<string, Vec>, a: string, b: string, c: string): Vec {
  return addVec(subVec(lookup(table, a), lookup(table, b)), lookup(table, c));
}

export interface Neighbor {
  word: string;
  similarity: number;
}

export function nearest(vec: Vec, table: Record<string, Vec>, exclude: string[] = []): Neighbor[] {
  return Object.entries(table)
    .filter(([word]) => !exclude.includes(word))
    .map(([word, v]) => ({ word, similarity: cosineSimilarity(vec, v) }))
    .sort((x, y) => y.similarity - x.similarity);
}
