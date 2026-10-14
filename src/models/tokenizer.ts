/** Spaces are shown as "_" so learners can see them inside tokens. */
export const SPACE = '_';

export function toChars(text: string): string[] {
  return Array.from(text.replace(/ /g, SPACE));
}

export function decode(tokens: string[]): string {
  return tokens.join('').replace(/_/g, ' ');
}

export function merge(tokens: string[], pair: [string, string]): string[] {
  const [a, b] = pair;
  const out: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (i < tokens.length - 1 && tokens[i] === a && tokens[i + 1] === b) {
      out.push(a + b);
      i += 2;
    } else {
      out.push(tokens[i]);
      i += 1;
    }
  }
  return out;
}

export interface PairCount {
  pair: [string, string];
  count: number;
}

export function countPairs(tokens: string[]): PairCount[] {
  const map = new Map<string, PairCount>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair: [string, string] = [tokens[i], tokens[i + 1]];
    const key = JSON.stringify(pair);
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { pair, count: 1 });
  }
  // Map keeps insertion order and Array.prototype.sort is stable,
  // so ties stay in order of first appearance.
  return [...map.values()].sort((x, y) => y.count - x.count);
}

export function trainBPE(text: string, numMerges: number): [string, string][] {
  let tokens = toChars(text);
  const merges: [string, string][] = [];
  for (let n = 0; n < numMerges; n++) {
    const pairs = countPairs(tokens);
    if (pairs.length === 0 || pairs[0].count < 2) break;
    merges.push(pairs[0].pair);
    tokens = merge(tokens, pairs[0].pair);
  }
  return merges;
}

export function encode(text: string, merges: [string, string][]): string[] {
  return merges.reduce((tokens, pair) => merge(tokens, pair), toChars(text));
}
