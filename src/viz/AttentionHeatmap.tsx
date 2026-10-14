import { Fragment } from 'react';
import { VizFrame } from './VizFrame';

interface Props {
  title: string;
  queries: string[];
  keys: string[];
  weights: number[][];
}

export function AttentionHeatmap({ title, queries, keys, weights }: Props) {
  const table = { columns: ['Query \\ Key', ...keys], rows: queries.map((q, i) => [q, ...weights[i]]) };
  return (
    <VizFrame title={title} table={table}>
      <div className="scroll-x">
        <div className="heatmap" style={{ gridTemplateColumns: `auto repeat(${keys.length}, minmax(2.6rem, 1fr))` }}>
          <span />
          {keys.map((k, j) => (
            <span key={j} className="hm-key">
              {k}
            </span>
          ))}
          {queries.map((q, i) => (
            <Fragment key={i}>
              <span className="hm-query">{q}</span>
              {weights[i].map((w, j) => (
                <span key={j} className="hm-cell">
                  <span className="hm-swatch" aria-hidden="true" style={{ opacity: Math.max(0.05, w) }} />
                  <span className="hm-value">{w.toFixed(2)}</span>
                </span>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </VizFrame>
  );
}
