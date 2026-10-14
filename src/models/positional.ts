export function positionalEncoding(pos: number, d: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < d; i++) {
    const pair = Math.floor(i / 2);
    const angle = pos / Math.pow(10000, (2 * pair) / d);
    out.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
  }
  return out;
}
