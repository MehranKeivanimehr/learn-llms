import { whoGotHurt } from '../models/order';
import { AttentionHeatmap } from '../viz/AttentionHeatmap';
import { KnobSlider } from '../viz/KnobSlider';
import { SENTENCE_A, SENTENCE_B } from './inside6';

interface ControlsProps {
  usePositions: boolean;
  scale: number;
  onToggle: () => void;
  onScale: (v: number) => void;
}

export function PositionControls({ usePositions, scale, onToggle, onScale }: ControlsProps) {
  return (
    <div>
      <button type="button" className="toggle" aria-pressed={usePositions} onClick={onToggle}>
        Position signals: {usePositions ? 'on' : 'off'}
      </button>
      <KnobSlider label="Position strength" min={0} max={4} step={0.5} value={scale} onCommit={onScale} />
    </div>
  );
}

export function AnswerCards({ usePositions, scale }: { usePositions: boolean; scale: number }) {
  return (
    <div className="answer-cards">
      {[SENTENCE_A, SENTENCE_B].map((sentence) => {
        const r = whoGotHurt(sentence, usePositions, scale);
        const text = sentence.join(' ');
        return (
          <div key={text}>
            <AttentionHeatmap title={`"${text}"`} queries={['who got hurt?']} keys={sentence} weights={[r.weights]} />
            <p>
              Model's answer: <strong>{r.answer}</strong> (confidence {r.confidence.toFixed(2)})
            </p>
          </div>
        );
      })}
    </div>
  );
}
