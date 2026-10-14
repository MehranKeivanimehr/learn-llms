import { useEffect, useId, useState } from 'react';
import { CHAR_MODEL, visibleContext } from '../models/charModel';
import { KnobSlider } from '../viz/KnobSlider';
import { MAX_PROMPT, runInside8, type Inside8Action, type Inside8State } from './inside8';
import { GenerationText, StepBars } from './inside8Parts';
import type { StageProps } from './types';

export default function Inside8Stage({ state, dispatch }: StageProps<Inside8State, Inside8Action>) {
  const id = useId();
  const [draft, setDraft] = useState(state.prompt);
  useEffect(() => setDraft(state.prompt), [state.prompt]);
  const result = runInside8(state);

  return (
    <div className="stack">
      <form
        className="prompt-form"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'prompt', value: draft });
        }}
      >
        <label htmlFor={`${id}-prompt`}>Prompt</label>
        <input id={`${id}-prompt`} value={draft} maxLength={MAX_PROMPT} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">Use this prompt</button>
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
      <div className="button-row">
        <button type="button" onClick={() => dispatch({ type: 'reroll' })} disabled={state.temperature === 0}>
          Roll the dice again
        </button>
      </div>
      <GenerationText prompt={state.prompt} generated={result.text} />
      <p className="viz-help">
        The model can only see the last {CHAR_MODEL.ctx} characters: “{visibleContext(CHAR_MODEL, state.prompt)}”
      </p>
      {result.steps[0] && <StepBars step={result.steps[0]} title="Its first choice" />}
    </div>
  );
}
