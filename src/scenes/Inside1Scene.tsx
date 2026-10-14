import { VOCAB } from '../models/data/nextTokenData';
import { nextTokenProbs } from '../models/nextToken';
import { MAX_WORDS, type Inside1Action, type Inside1State } from '../puzzles/inside1';
import type { StageProps } from '../puzzles/types';
import { AnimatedBars, SceneCard } from './parts';

export default function Inside1Scene({ state, dispatch }: StageProps<Inside1State, Inside1Action>) {
  const probs = nextTokenProbs(state.context);
  const full = state.context.length >= MAX_WORDS;
  return (
    <>
      <SceneCard title="Context">
        <ul className="chip-row" aria-label="Context words">
          {state.context.map((w, i) => (
            <li key={`${i}-${w}`} className="canvas-chip pop-in">
              {w}
              <button type="button" className="chip-x" aria-label={`Remove ${w}`} onClick={() => dispatch({ type: 'remove', index: i })}>
                ×
              </button>
            </li>
          ))}
          {state.context.length === 0 && <li className="canvas-label">(empty)</li>}
        </ul>
        <p className="canvas-label">Add a word{full ? ' — the context is full' : ''}</p>
        <div className="chip-palette">
          {VOCAB.map((w) => (
            <button
              type="button"
              key={w}
              className="canvas-chip ghost"
              aria-label={`Add ${w}`}
              disabled={full}
              onClick={() => dispatch({ type: 'add', word: w })}
            >
              + {w}
            </button>
          ))}
        </div>
      </SceneCard>
      <AnimatedBars title="What the model predicts next" labels={VOCAB} probs={probs} highlight="Paris" top={6} />
    </>
  );
}
