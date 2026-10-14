import { KEYS, TOKENS } from '../models/data/attention5Data';
import { dot } from '../models/linalg';
import { AttentionHeatmap } from '../viz/AttentionHeatmap';
import { DataTable } from '../viz/DataTable';
import { KnobSlider } from '../viz/KnobSlider';
import { itWeights } from './inside5';

export function QueryControls({ q, onChange }: { q: [number, number]; onChange: (axis: 'qx' | 'qy', v: number) => void }) {
  return (
    <div>
      <KnobSlider label="Query x" min={-3} max={3} step={0.5} value={q[0]} onCommit={(v) => onChange('qx', v)} />
      <KnobSlider label="Query y" min={-3} max={3} step={0.5} value={q[1]} onCommit={(v) => onChange('qy', v)} />
    </div>
  );
}

export function ItAttention({ q }: { q: [number, number] }) {
  const weights = itWeights(q);
  return (
    <>
      <AttentionHeatmap title={`Where "it" looks (query = (${q[0]}, ${q[1]}))`} queries={['it']} keys={TOKENS} weights={[weights]} />
      <DataTable
        caption="Scores before softmax"
        columns={['Word', 'Key', 'Score q·k/√2']}
        rows={TOKENS.map((t, i) => [t, `(${KEYS[i].join(', ')})`, dot(q, KEYS[i]) / Math.SQRT2])}
      />
    </>
  );
}
