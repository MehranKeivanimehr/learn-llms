import { useState } from 'react';
import { OFF_TOPIC, TOKENS } from '../models/data/sampling4Data';
import { mulberry32, sampleIndex, type SamplerSettings } from '../models/sampling';
import { KnobSlider } from '../viz/KnobSlider';
import type { ProbItem } from '../viz/ProbBars';

export function distributionBars(dist: number[]): ProbItem[] {
  return TOKENS.map((t, i) => ({ label: t, p: dist[i], note: OFF_TOPIC.has(t) ? 'off-topic' : undefined }));
}

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

export function SampleButton({ dist }: { dist: number[] }) {
  const [seed, setSeed] = useState(1);
  const [samples, setSamples] = useState<string[] | null>(null);
  function sample() {
    const rand = mulberry32(seed);
    setSamples(Array.from({ length: 10 }, () => TOKENS[sampleIndex(dist, rand)]));
    setSeed((s) => s + 1);
  }
  return (
    <div>
      <button type="button" onClick={sample}>
        Sample 10 tokens
      </button>
      <p aria-live="polite">{samples ? samples.join(' · ') : 'Press the button to see what the model might say.'}</p>
    </div>
  );
}
