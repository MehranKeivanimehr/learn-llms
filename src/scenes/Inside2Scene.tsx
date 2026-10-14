import { useTween } from '../motion/useTween';
import { candidatePairs, MAX_MERGES, TARGET_TEXT, type Inside2Action, type Inside2State } from '../puzzles/inside2';
import type { StageProps } from '../puzzles/types';
import { SceneCard } from './parts';

const show = (t: string) => t.replace(/_/g, '␣');

export default function Inside2Scene({ state, dispatch }: StageProps<Inside2State, Inside2Action>) {
  const pairs = candidatePairs(state.tokens);
  const count = useTween([state.tokens.length])[0];
  const outOfMerges = state.merges.length >= MAX_MERGES;
  const last = state.merges.length ? state.merges[state.merges.length - 1].join('') : null;
  return (
    <>
      <SceneCard
        title={`"${TARGET_TEXT}"`}
        table={{ columns: ['#', 'Token'], rows: state.tokens.map((t, i) => [String(i + 1), show(t)]) }}
      >
        <p className="big-number" aria-live="polite">
          <span>{Math.round(count)}</span>tokens
        </p>
        <ol className="chip-row" aria-label="Tokens">
          {state.tokens.map((t, i) => (
            <li key={`${state.merges.length}-${i}`} className={`canvas-chip mono${t === last ? ' hl fuse' : ''}`}>
              {show(t)}
            </li>
          ))}
        </ol>
      </SceneCard>
      <SceneCard title="Most common neighbouring pairs">
        <div className="chip-palette">
          {pairs.map(({ pair: [a, b], count: n }) => (
            <button
              type="button"
              key={`${a}|${b}`}
              className="canvas-btn"
              disabled={outOfMerges}
              aria-label={`Merge ${show(a)} and ${show(b)}, seen ${n} times`}
              onClick={() => dispatch({ type: 'merge', pair: [a, b] })}
            >
              {show(a)} + {show(b)} ×{n}
            </button>
          ))}
        </div>
        <p className="canvas-label">
          Merges used: {state.merges.length} / {MAX_MERGES}
          {state.merges.length > 0 && ` — ${state.merges.map(([a, b]) => `${show(a)}+${show(b)}`).join(', ')}`}
        </p>
      </SceneCard>
    </>
  );
}
