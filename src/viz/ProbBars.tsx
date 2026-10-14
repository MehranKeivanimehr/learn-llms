import { VizFrame } from './VizFrame';

export interface ProbItem {
  label: string;
  p: number;
  highlight?: boolean;
  note?: string;
}

export function topItems(labels: string[], probs: number[], highlight?: string, n = 8): ProbItem[] {
  return labels
    .map((label, i) => ({ label, p: probs[i], highlight: label === highlight }))
    .sort((a, b) => b.p - a.p)
    .slice(0, n);
}

export function ProbBars({ title, items }: { title: string; items: ProbItem[] }) {
  const table = {
    columns: ['Token', 'Probability'],
    rows: items.map((i) => [i.note ? `${i.label} (${i.note})` : i.label, i.p]),
  };
  return (
    <VizFrame title={title} table={table}>
      <ul className="prob-bars">
        {items.map((i) => (
          <li key={i.label} className={i.highlight ? 'highlight' : undefined}>
            <span className="prob-label">
              {i.label}
              {i.note && <small> ({i.note})</small>}
            </span>
            <span className="prob-track" aria-hidden="true">
              <span className="prob-fill" style={{ width: `${(i.p * 100).toFixed(1)}%` }} />
            </span>
            <span className="prob-value">{(i.p * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </VizFrame>
  );
}
