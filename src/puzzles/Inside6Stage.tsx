import type { Inside6Action, Inside6State } from './inside6';
import { AnswerCards, PositionControls } from './inside6Parts';
import type { StageProps } from './types';

export default function Inside6Stage({ state, dispatch }: StageProps<Inside6State, Inside6Action>) {
  return (
    <div className="stack">
      <PositionControls
        usePositions={state.usePositions}
        scale={state.scale}
        onToggle={() => dispatch({ type: 'togglePositions' })}
        onScale={(value) => dispatch({ type: 'scale', value })}
      />
      <AnswerCards usePositions={state.usePositions} scale={state.scale} />
    </div>
  );
}
