import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { PuzzleModule } from '../puzzles/types';
import { getProgressStore } from './progressStore';
import { currentState, hostReducer, initHost } from './puzzleState';
import { SolvedOverlay } from './SolvedOverlay';

const REPLAY_STEP_MS = 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Props<S, A> {
  module: PuzzleModule<S, A>;
  levelId: string;
  nextHref: string;
  nextTitle: string;
}

export function PuzzleHost<S, A>({ module, levelId, nextHref, nextTitle }: Props<S, A>) {
  const { def, Stage, Goal } = module;
  const reducer = useMemo(() => hostReducer(def), [def]);
  const [host, dispatchHost] = useReducer(reducer, def, initHost);
  const state = currentState(host);
  const conditions = def.conditions(state);
  const solved = conditions.every((c) => c.met);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const recorded = useRef(false);
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  useEffect(() => {
    if (!solved) {
      recorded.current = false;
      return;
    }
    if (recorded.current || host.replaying) return;
    recorded.current = true;
    getProgressStore().markSolved(levelId, host.usedSolution ? null : host.moves);
    setOverlayOpen(true);
  }, [solved, host.replaying, host.usedSolution, host.moves, levelId]);

  async function showSolution() {
    const ok = window.confirm(
      "Watch the solution? The level will count as solved, but your move count won't be recorded.",
    );
    if (!ok) return;
    dispatchHost({ type: 'startReplay' });
    for (const action of def.solution) {
      await sleep(REPLAY_STEP_MS);
      if (unmounted.current) return;
      dispatchHost({ type: 'act', action, replay: true });
    }
    dispatchHost({ type: 'endReplay' });
  }

  return (
    <div className="puzzle">
      <div className="stage">
        <Stage state={state} dispatch={(action) => dispatchHost({ type: 'act', action })} solved={solved} />
      </div>
      <aside className="side" aria-label="Goal and checker">
        <h2>Your goal</h2>
        <p>{def.instructions}</p>
        <div className="goal-box">{Goal ? <Goal /> : <p>{def.goalText}</p>}</div>
        <h3>Checker</h3>
        <ul className="checker">
          {conditions.map((c, i) => (
            <li key={i} className={c.met ? 'met' : 'unmet'}>
              <span aria-hidden="true">{c.met ? '✔' : '✘'}</span> {c.label}
              <span className="sr-only">{c.met ? ' — done' : ' — not yet'}</span>
            </li>
          ))}
        </ul>
        <p className="moves" aria-live="polite">
          {solved ? 'Solved! ' : ''}Moves: {host.moves} · Par: {def.par}
        </p>
        <div className="button-row">
          <button type="button" onClick={() => dispatchHost({ type: 'undo' })} disabled={host.replaying || host.moves === 0}>
            Undo
          </button>
          <button type="button" onClick={() => dispatchHost({ type: 'reset' })} disabled={host.replaying}>
            Reset
          </button>
          <button type="button" onClick={() => dispatchHost({ type: 'hint' })} disabled={host.hintsShown >= def.hints.length}>
            Hint
          </button>
          <button type="button" onClick={showSolution} disabled={host.replaying}>
            Show solution
          </button>
        </div>
        {host.replaying && (
          <p className="muted" role="status">
            Playing the solution…
          </p>
        )}
        {host.hintsShown > 0 && (
          <ol className="hints">
            {def.hints.slice(0, host.hintsShown).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
        )}
      </aside>
      {overlayOpen && (
        <SolvedOverlay
          moves={host.moves}
          par={def.par}
          usedSolution={host.usedSolution}
          nextHref={nextHref}
          nextTitle={nextTitle}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </div>
  );
}
