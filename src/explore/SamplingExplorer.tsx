import { useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { CONTEXT, LOGITS } from '../models/data/sampling4Data';
import { distribution, type SamplerSettings } from '../models/sampling';
import { distributionBars, SampleButton, SamplerControls } from '../puzzles/inside4Parts';
import { ProbBars } from '../viz/ProbBars';

function SamplingExplorer() {
  const [settings, setSettings] = useState<SamplerSettings>({ temperature: 1, topK: 0, topP: 1 });
  const dist = distribution(LOGITS, settings);
  return (
    <div className="stack">
      <p>
        Context: <strong>{CONTEXT} …</strong>
      </p>
      <SamplerControls settings={settings} onChange={(key, value) => setSettings((s) => ({ ...s, [key]: value }))} />
      <ProbBars title="Next-token probabilities" items={distributionBars(dist)} />
      <SampleButton dist={dist} />
    </div>
  );
}

export default withBoundary(SamplingExplorer, 'sampling-explorer');
