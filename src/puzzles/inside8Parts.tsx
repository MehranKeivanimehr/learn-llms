import { CHAR_MODEL, showChar, type GenerationStep } from '../models/charModel';
import { ProbBars, topItems } from '../viz/ProbBars';

export function StepBars({ step, title }: { step: GenerationStep; title: string }) {
  const labels = CHAR_MODEL.vocab.map(showChar);
  return <ProbBars title={title} items={topItems(labels, step.probs, labels[step.chosen], 5)} />;
}

export function GenerationText({ prompt, generated }: { prompt: string; generated: string }) {
  return (
    <p className="generation" aria-live="polite">
      <span className="muted">{prompt}</span>
      <strong>{generated}</strong>
    </p>
  );
}
