/** Split a command line into words. Text in double quotes stays together (spaces included). */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (/\s/.test(line[i])) {
      i++;
      continue;
    }
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      if (end === -1) {
        out.push(line.slice(i + 1));
        break;
      }
      out.push(line.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    let j = i;
    while (j < line.length && !/\s/.test(line[j])) j++;
    out.push(line.slice(i, j));
    i = j;
  }
  return out;
}

export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

export function closest(word: string, options: string[], maxDistance = 2): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const option of options) {
    const d = editDistance(word.toLowerCase(), option.toLowerCase());
    if (d < bestDistance) {
      best = option;
      bestDistance = d;
    }
  }
  return bestDistance <= maxDistance ? best : null;
}

export function parseNumber(s: string | undefined): number | null {
  if (s === undefined || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
