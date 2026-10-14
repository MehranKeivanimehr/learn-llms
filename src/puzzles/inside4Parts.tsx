import { TOKENS } from '../models/data/sampling4Data';
import type { SamplerSettings } from '../models/sampling';
import { KnobSlider } from '../viz/KnobSlider';

export function SamplerControls({
  settings,
  onChange,
}: {
  settings: SamplerSettings;
  onChange: (key: keyof SamplerSettings, value: number) => void;
}) {
  return (
    <div>
      <KnobSlider
        label="Temperature"
        min={0}
        max={2}
        step={0.1}
        value={settings.temperature}
        onCommit={(v) => onChange('temperature', v)}
        format={(v) => v.toFixed(1)}
      />
      <KnobSlider
        label="Top-k"
        min={0}
        max={TOKENS.length}
        step={1}
        value={settings.topK}
        onCommit={(v) => onChange('topK', v)}
        format={(v) => (v === 0 || v >= TOKENS.length ? 'off' : String(v))}
      />
      <KnobSlider
        label="Top-p"
        min={0.05}
        max={1}
        step={0.05}
        value={settings.topP}
        onCommit={(v) => onChange('topP', v)}
        format={(v) => (v >= 1 ? 'off' : v.toFixed(2))}
      />
    </div>
  );
}
