import { CONTEXT, LOGITS } from '../models/data/sampling4Data';
import { distribution } from '../models/sampling';
import { ProbBars } from '../viz/ProbBars';
import type { Inside4Action, Inside4State } from './inside4';
import { distributionBars, SampleButton, SamplerControls } from './inside4Parts';
import type { StageProps } from './types';

export default function Inside4Stage({ state, dispatch }: StageProps<Inside4State, Inside4Action>) {
  const dist = distribution(LOGITS, state.settings);
  return (
    <div className="stack">
      <p>
        Context: <strong>{CONTEXT} …</strong>
      </p>
      <SamplerControls settings={state.settings} onChange={(type, value) => dispatch({ type, value })} />
      <ProbBars title="Probabilities after your settings" items={distributionBars(dist)} />
      <SampleButton dist={dist} />
    </div>
  );
}
