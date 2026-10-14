import { useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { ItAttention, QueryControls } from '../puzzles/inside5Parts';

const PRESETS: { label: string; q: [number, number] }[] = [
  { label: 'Looking for nothing in particular', q: [0, 0] },
  { label: 'Looking for a place', q: [-1, 3] },
];

function AttentionExplorer() {
  const [q, setQ] = useState<[number, number]>([0, 0]);
  return (
    <div className="stack">
      <div className="button-row">
        {PRESETS.map((p) => (
          <button type="button" key={p.label} onClick={() => setQ(p.q)}>
            {p.label}
          </button>
        ))}
      </div>
      <QueryControls q={q} onChange={(axis, v) => setQ((cur) => (axis === 'qx' ? [v, cur[1]] : [cur[0], v]))} />
      <ItAttention q={q} />
    </div>
  );
}

export default withBoundary(AttentionExplorer, 'attention-explorer');
