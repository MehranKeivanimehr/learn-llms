import { useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { selfAttention } from '../models/attention';
import { addAndNorm, mlp } from '../models/block';
import { PARAMS, TOKENS, X } from '../models/data/block7Data';
import { DataTable } from '../viz/DataTable';

const STAGES = (() => {
  const a = selfAttention(X, PARAMS.attention).output;
  const h = X.map((row, i) => addAndNorm(row, a[i]));
  const m = h.map((row) => mlp(row, PARAMS.mlp));
  const out = h.map((row, i) => addAndNorm(row, m[i]));
  return [
    { title: 'Input vectors', text: 'One vector per word, coming from the embeddings (plus positions).', data: X },
    { title: 'Self-attention output', text: 'Each word gathers a weighted mix of information from the other words.', data: a },
    {
      title: 'Add & Norm',
      text: 'The attention output is added back onto the input (the residual connection), then each vector is normalized.',
      data: h,
    },
    { title: 'MLP output', text: 'A small neural network processes each word on its own.', data: m },
    { title: 'Add & Norm → block output', text: 'Add the MLP output back on and normalize again. This is what the next block receives.', data: out },
  ];
})();

function BlockFlowExplorer() {
  const [step, setStep] = useState(0);
  const stage = STAGES[step];
  return (
    <div className="stack">
      <p aria-live="polite">
        <strong>
          Step {step + 1} of {STAGES.length}: {stage.title}.
        </strong>{' '}
        {stage.text}
      </p>
      <DataTable columns={['Word', 'd1', 'd2', 'd3', 'd4']} rows={TOKENS.map((t, i) => [t, ...stage.data[i]])} />
      <div className="button-row">
        <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          ← Back
        </button>
        <button type="button" className="primary" onClick={() => setStep((s) => s + 1)} disabled={step === STAGES.length - 1}>
          Next step →
        </button>
      </div>
    </div>
  );
}

export default withBoundary(BlockFlowExplorer, 'block-flow-explorer');
