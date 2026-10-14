import { useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { VOCAB } from '../models/data/nextTokenData';
import { nextTokenProbs } from '../models/nextToken';
import { ContextEditor } from '../puzzles/inside1Parts';
import { ProbBars, topItems } from '../viz/ProbBars';

function NextTokenExplorer() {
  const [context, setContext] = useState<string[]>(['I', 'love']);
  const probs = nextTokenProbs(context);
  return (
    <div className="stack">
      <ContextEditor
        context={context}
        vocab={VOCAB}
        maxWords={8}
        onAdd={(w) => setContext((c) => [...c, w])}
        onRemove={(i) => setContext((c) => c.filter((_, j) => j !== i))}
      />
      <ProbBars title="Next-word probabilities" items={topItems(VOCAB, probs)} />
    </div>
  );
}

export default withBoundary(NextTokenExplorer, 'next-token-explorer');
