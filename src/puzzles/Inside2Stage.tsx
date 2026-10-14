import { TokenStrip } from '../viz/TokenStrip';
import { candidatePairs, MAX_MERGES, type Inside2Action, type Inside2State } from './inside2';
import type { StageProps } from './types';

const show = (t: string) => t.replace(/_/g, '␣');

export default function Inside2Stage({ state, dispatch }: StageProps<Inside2State, Inside2Action>) {
  const pairs = candidatePairs(state.tokens);
  const outOfMerges = state.merges.length >= MAX_MERGES;
  return (
    <div className="stack">
      <TokenStrip title="Your tokens" tokens={state.tokens} />
      <div>
        <p className="label">Most common neighbouring pairs — pick one to merge</p>
        <div className="chip-palette">
          {pairs.map(({ pair: [a, b], count }) => (
            <button
              type="button"
              key={`${a}|${b}`}
              className="chip-button"
              disabled={outOfMerges}
              aria-label={`Merge ${show(a)} and ${show(b)}, seen ${count} times`}
              onClick={() => dispatch({ type: 'merge', pair: [a, b] })}
            >
              {show(a)} + {show(b)} (×{count})
            </button>
          ))}
        </div>
        {outOfMerges && <p className="muted">You've used all {MAX_MERGES} merges. Undo or reset to try again.</p>}
      </div>
      <p>
        <span className="label">Merges so far: </span>
        {state.merges.length === 0 ? 'none' : state.merges.map(([a, b]) => `${show(a)}+${show(b)}`).join(', ')}
      </p>
    </div>
  );
}
