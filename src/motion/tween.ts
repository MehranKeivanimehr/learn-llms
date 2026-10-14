export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpArray(a: number[], b: number[], t: number): number[] {
  if (a.length !== b.length) return b.slice();
  return b.map((v, i) => lerp(a[i], v, t));
}
