import type { Inside5Action, Inside5State } from './inside5';
import { ItAttention, QueryControls } from './inside5Parts';
import type { StageProps } from './types';

export default function Inside5Stage({ state, dispatch }: StageProps<Inside5State, Inside5Action>) {
  return (
    <div className="stack">
      <p>
        <em>The animal didn't cross the street because <strong>it</strong> was tired.</em>
      </p>
      <QueryControls q={state.q} onChange={(type, value) => dispatch({ type, value })} />
      <ItAttention q={state.q} />
    </div>
  );
}
