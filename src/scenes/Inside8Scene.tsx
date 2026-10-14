import { useEffect, useId, useState } from 'react';
import { CHAR_MODEL, showChar, visibleContext } from '../models/charModel';
import { useTypewriter } from '../motion/useTween';
import { MAX_PROMPT, runInside8, type Inside8Action, type Inside8State } from '../puzzles/inside8';
import type { StageProps } from '../puzzles/types';
import { KnobSlider } from '../viz/KnobSlider';
import { AnimatedBars, SceneCard } from './parts';

const LABELS = CHAR_MODEL.vocab.map(showChar);

export default function Inside8Scene({ state, dispatch }: StageProps<Inside8State, Inside8Action>) {
  const id = useId();
  const [draft, setDraft] = useState(state.prompt);
  useEffect(() => setDraft(state.prompt), [state.prompt]);
  const result = runInside8(state);
  const typed = useTypewriter(result.text, 45);
  const first = result.steps[0];

  return (
    <>
      <SceneCard title="Your controls">
        <form
          className="prompt-form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: 'prompt', value: draft });
          }}
        >
          <label htmlFor={`${id}-prompt`}>Prompt</label>
          <input id={`${id}-prompt`} value={draft} maxLength={MAX_PROMPT} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="canvas-btn primary">
            Use this prompt
          </button>
        </form>
        <KnobSlider
          label="Temperature"
          min={0}
          max={2}
          step={0.1}
          value={state.temperature}
          onCommit={(value) => dispatch({ type: 'temperature', value })}
          format={(v) => v.toFixed(1)}
        />
        <button type="button" className="canvas-btn" onClick={() => dispatch({ type: 'reroll' })} disabled={state.temperature === 0}>
          Roll the dice again
        </button>
      </SceneCard>
      <SceneCard title="What the model writes">
        <p className="generation">
          <span className="sr-only">
            Output after “{state.prompt}”: {result.text}
          </span>
          <span className="given" aria-hidden="true">
            {state.prompt}
          </span>
          <span className="typed" aria-hidden="true">
            {typed}
          </span>
        </p>
        <p className="canvas-label">
          The model only sees the last {CHAR_MODEL.ctx} characters: “{visibleContext(CHAR_MODEL, state.prompt)}”
        </p>
      </SceneCard>
      {first && <AnimatedBars title="Its first choice" labels={LABELS} probs={first.probs} highlight={LABELS[first.chosen]} top={5} />}
    </>
  );
}
