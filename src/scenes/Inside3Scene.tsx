import { FIXED, GRID_SIZE, RESULT, rankings, type Inside3Action, type Inside3State } from '../puzzles/inside3';
import type { StageProps } from '../puzzles/types';
import { EmbeddingMap, type MapPoint } from '../viz/EmbeddingMap';
import { SceneCard } from './parts';

export default function Inside3Scene({ state, dispatch }: StageProps<Inside3State, Inside3Action>) {
  const points: MapPoint[] = [
    ...Object.entries(FIXED).map(([label, [x, y]]) => ({ label, x, y })),
    { label: 'king − man + woman', x: RESULT[0], y: RESULT[1], kind: 'result' },
    { label: 'queen', x: state.queen[0], y: state.queen[1], movable: true },
  ];
  const ranked = rankings(state);
  return (
    <>
      <EmbeddingMap
        title="Word vectors"
        points={points}
        size={GRID_SIZE}
        onMove={(label, x, y) => {
          if (label === 'queen') dispatch({ type: 'move', to: [x, y] });
        }}
      />
      <SceneCard title="Closest to king − man + woman">
        <ol className="chip-row">
          {ranked.map((n, i) => (
            <li key={n.word} className={`canvas-chip${i === 0 ? ' hl' : ''}`}>
              {i + 1}. {n.word} · {n.similarity.toFixed(2)}
            </li>
          ))}
        </ol>
      </SceneCard>
    </>
  );
}
