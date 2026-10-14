import { whoGotHurt } from '../models/order';
import { useTween } from '../motion/useTween';
import { SENTENCE_A, SENTENCE_B, type Inside6Action, type Inside6State } from '../puzzles/inside6';
import type { StageProps } from '../puzzles/types';
import { KnobSlider } from '../viz/KnobSlider';
import { SceneCard } from './parts';

const XS = [110, 300, 490];

function wavePath(pos: number) {
  let d = '';
  for (let x = 0; x <= 80; x += 4) d += `${x === 0 ? 'M' : 'L'} ${x} ${(6 - 6 * Math.sin(x / 8 + pos * 1.7)).toFixed(1)} `;
  return d;
}

interface SentenceProps {
  sentence: string[];
  usePositions: boolean;
  scale: number;
}

function SentenceArcs({ sentence, usePositions, scale }: SentenceProps) {
  const r = whoGotHurt(sentence, usePositions, scale);
  const shown = useTween(r.weights);
  const confidence = useTween([r.confidence])[0];
  const text = sentence.join(' ');
  return (
    <SceneCard title={`"${text}"`} table={{ columns: ['Word', 'Weight'], rows: sentence.map((w, i) => [w, r.weights[i]]) }}>
      <svg
        viewBox="0 0 600 250"
        className="arc-svg"
        role="img"
        aria-label={`"${text}": the model answers ${r.answer} with confidence ${r.confidence.toFixed(2)}`}
      >
        <rect className="bubble" x={210} y={8} width={180} height={42} rx={21} />
        <text className="bubble-text" x={300} y={35} textAnchor="middle">
          who got hurt?
        </text>
        {sentence.map((_, i) => (
          <path
            key={`a-${i}`}
            className={`arc${sentence[i] === r.answer ? ' hl' : ''}`}
            d={`M 300 50 Q ${(300 + XS[i]) / 2} 105 ${XS[i]} 168`}
            strokeWidth={1 + (shown[i] ?? 0) * 18}
            opacity={0.3 + 0.7 * Math.min(1, (shown[i] ?? 0) * 1.5)}
          />
        ))}
        {sentence.map((w, i) => (
          <g key={`n-${i}`} transform={`translate(${XS[i]}, 190)`}>
            <rect className={`node${w === r.answer ? ' hl' : ''}`} x={-55} y={-20} width={110} height={40} rx={20} />
            <text className="node-text" y={6} textAnchor="middle">
              {w}
            </text>
            <path className="wave" d={wavePath(i)} transform="translate(-40, 30)" opacity={usePositions ? 1 : 0} />
          </g>
        ))}
      </svg>
      <p className="canvas-label">
        Answer: <strong>{r.answer}</strong> · confidence {confidence.toFixed(2)}
      </p>
    </SceneCard>
  );
}

export default function Inside6Scene({ state, dispatch }: StageProps<Inside6State, Inside6Action>) {
  return (
    <>
      <SceneCard title="Position signals">
        <button
          type="button"
          className={`canvas-btn${state.usePositions ? ' on' : ''}`}
          aria-pressed={state.usePositions}
          onClick={() => dispatch({ type: 'togglePositions' })}
        >
          Position signals: {state.usePositions ? 'on' : 'off'}
        </button>
        <KnobSlider label="Position strength" min={0} max={4} step={0.5} value={state.scale} onCommit={(value) => dispatch({ type: 'scale', value })} />
      </SceneCard>
      <div className="answer-cards">
        <SentenceArcs sentence={SENTENCE_A} usePositions={state.usePositions} scale={state.scale} />
        <SentenceArcs sentence={SENTENCE_B} usePositions={state.usePositions} scale={state.scale} />
      </div>
    </>
  );
}
