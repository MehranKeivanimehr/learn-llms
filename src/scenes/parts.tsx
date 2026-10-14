import { useState, type ReactNode } from 'react';
import '../styles/viz.css';
import { useTween } from '../motion/useTween';
import { DataTable, type TableData } from '../viz/DataTable';

interface CardProps {
  title: string;
  table?: TableData;
  className?: string;
  children: ReactNode;
}

/** A translucent card on the blue canvas, with an optional "View as table" toggle. */
export function SceneCard({ title, table, className, children }: CardProps) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className={`scene-card${className ? ` ${className}` : ''}`}>
      <figcaption>
        <span>{title}</span>
        {table && (
          <button type="button" className="link-button" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
            {asTable ? 'View as picture' : 'View as table'}
          </button>
        )}
      </figcaption>
      {asTable && table ? <DataTable {...table} /> : children}
    </figure>
  );
}

interface BarsProps {
  title: string;
  labels: string[];
  probs: number[];
  highlight?: string;
  notes?: Record<string, string>;
  /** Show only the `top` most likely items (sorted); otherwise keep the given order. */
  top?: number;
}

/** Probability bars whose widths glide to new values. */
export function AnimatedBars({ title, labels, probs, highlight, notes = {}, top }: BarsProps) {
  const shown = useTween(probs);
  const order = labels.map((_, i) => i);
  const visible = top ? [...order].sort((a, b) => probs[b] - probs[a] || a - b).slice(0, top) : order;
  const name = (i: number) => (notes[labels[i]] ? `${labels[i]} (${notes[labels[i]]})` : labels[i]);
  const value = (i: number) => Math.max(0, Math.min(1, shown[i] ?? probs[i]));
  return (
    <SceneCard title={title} table={{ columns: ['Token', 'Probability'], rows: visible.map((i) => [name(i), probs[i]]) }}>
      <ul className="cbars">
        {visible.map((i) => (
          <li key={labels[i]} className={labels[i] === highlight ? 'hl' : undefined}>
            <span className="cbar-label">
              {labels[i]}
              {notes[labels[i]] && <small> ({notes[labels[i]]})</small>}
            </span>
            <span className="cbar-track" aria-hidden="true">
              <span className="cbar-fill" style={{ width: `${value(i) * 100}%` }} />
            </span>
            <span className="cbar-value">{(value(i) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </SceneCard>
  );
}
