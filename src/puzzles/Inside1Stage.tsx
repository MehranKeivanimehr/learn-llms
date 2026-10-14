import { VOCAB } from '../models/data/nextTokenData';
import { nextTokenProbs } from '../models/nextToken';
import { ProbBars, topItems } from '../viz/ProbBars';
import { MAX_WORDS, type Inside1Action, type Inside1State } from './inside1';
import { ContextEditor } from './inside1Parts';
import type { StageProps } from './types';

export default function Inside1Stage({ state, dispatch }: StageProps<Inside1State, Inside1Action>) {
  const probs = nextTokenProbs(state.context);
  return (
    <div className="stack">
      <ContextEditor
        context={state.context}
        vocab={VOCAB}
        maxWords={MAX_WORDS}
        onAdd={(word) => dispatch({ type: 'add', word })}
        onRemove={(index) => dispatch({ type: 'remove', index })}
      />
      <ProbBars title="What the model predicts next" items={topItems(VOCAB, probs, 'Paris')} />
    </div>
  );
}
