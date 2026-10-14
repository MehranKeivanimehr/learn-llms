import { ANIMAL, STREET, TOKENS } from '../models/data/attention5Data';
import { useTween } from '../motion/useTween';
import { itWeights, type Inside5Action, type Inside5State } from '../puzzles/inside5';
import { QueryControls } from '../puzzles/inside5Parts';
import type { StageProps } from '../puzzles/types';
import { SceneCard } from './parts';

const W = 1100;
const BASE = 230;
const IT = TOKENS.indexOf('it');
const XS = TOKENS.map((_, i) => 60 + i * ((W - 120) / (TOKENS.length - 1)));

function arcPath(x1: number, x2: number) {
  const h = Math.min(190, 30 + Math.abs(x1 - x2) * 0.35);
  return `M ${x1} ${BASE - 26} Q ${(x1 + x2) / 2} ${BASE - 26 - h} ${x2} ${BASE - 26}`;
}

export default function Inside5Scene({ state, dispatch }: StageProps<Inside5State, Inside5Action>) {
  const target = itWeights(state.q);
  const w = useTween(target);
  const label = `Attention from "it": animal ${target[ANIMAL].toFixed(2)}, street ${target[STREET].toFixed(2)}`;
  return (
    <>
      <SceneCard title={'Where "it" looks'} table={{ columns: ['Word', 'Weight'], rows: TOKENS.map((t, i) => [t, target[i]]) }}>
        <svg viewBox={`0 0 ${W} 300`} className="arc-svg wide" role="img" aria-label={label}>
          {TOKENS.map((t, i) =>
            i === IT ? null : (
              <path
                key={`arc-${i}`}
                className={`arc${i === ANIMAL ? ' hl' : ''}`}
                d={arcPath(XS[IT], XS[i])}
                strokeWidth={1 + (w[i] ?? 0) * 22}
                opacity={0.25 + 0.75 * Math.min(1, (w[i] ?? 0) * 2)}
              />
            ),
          )}
          {TOKENS.map((t, i) => (
            <g key={`node-${i}`} transform={`translate(${XS[i]}, ${BASE})`}>
              <rect className={`node${i === IT ? ' hl' : ''}`} x={-51} y={-26} width={102} height={52} rx={26} />
              <text className="node-text" y={8} textAnchor="middle">
                {t}
              </text>
              <text className="weight-text" y={56} textAnchor="middle">
                {(w[i] ?? 0).toFixed(2)}
              </text>
            </g>
          ))}
        </svg>
      </SceneCard>
      <SceneCard title={'Query for "it"'}>
        <QueryControls q={state.q} onChange={(type, value) => dispatch({ type, value })} />
      </SceneCard>
    </>
  );
}
