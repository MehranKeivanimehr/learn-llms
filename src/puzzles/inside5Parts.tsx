import { KnobSlider } from '../viz/KnobSlider';

export function QueryControls({ q, onChange }: { q: [number, number]; onChange: (axis: 'qx' | 'qy', v: number) => void }) {
  return (
    <div>
      <KnobSlider label="Query x" min={-3} max={3} step={0.5} value={q[0]} onCommit={(v) => onChange('qx', v)} />
      <KnobSlider label="Query y" min={-3} max={3} step={0.5} value={q[1]} onCommit={(v) => onChange('qy', v)} />
    </div>
  );
}
