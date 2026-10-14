import { useState } from 'react';
import { CONTEXT, LOGITS, OFF_TOPIC, TOKENS } from '../models/data/sampling4Data';
import { distribution, mulberry32, sampleIndex } from '../models/sampling';
import type { Inside4Action, Inside4State } from '../puzzles/inside4';
import { SamplerControls } from '../puzzles/inside4Parts';
import type { StageProps } from '../puzzles/types';
import { AnimatedBars, SceneCard } from './parts';

const NOTES = Object.fromEntries([...OFF_TOPIC].map((t) => [t, 'off-topic']));

export default function Inside4Scene({ state, dispatch }: StageProps<Inside4State, Inside4Action>) {
  const dist = distribution(LOGITS, state.settings);
  const [seed, setSeed] = useState(1);
  const [samples, setSamples] = useState<string[] | null>(null);

  function sample() {
    const rand = mulberry32(seed);
    setSamples(Array.from({ length: 10 }, () => TOKENS[sampleIndex(dist, rand)]));
    setSeed((s) => s + 1);
  }

  return (
    <>
      <SceneCard title={`"${CONTEXT} …"`}>
        <SamplerControls settings={state.settings} onChange={(type, value) => dispatch({ type, value })} />
      </SceneCard>
      <AnimatedBars title="Probabilities after your settings" labels={TOKENS} probs={dist} notes={NOTES} />
      <SceneCard title="Samples">
        <button type="button" className="canvas-btn primary" onClick={sample}>
          Sample 10 tokens
        </button>
        <ul className="chip-row" aria-live="polite">
          {samples ? (
            samples.map((t, i) => (
              <li key={`${seed}-${i}`} className={`canvas-chip drop-in${OFF_TOPIC.has(t) ? ' hl' : ''}`} style={{ animationDelay: `${i * 45}ms` }}>
                {t}
              </li>
            ))
          ) : (
            <li className="canvas-label">Press the button to see what the model might say.</li>
          )}
        </ul>
      </SceneCard>
    </>
  );
}
