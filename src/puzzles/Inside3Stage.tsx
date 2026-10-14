import { DataTable } from '../viz/DataTable';
import { EmbeddingMap, type MapPoint } from '../viz/EmbeddingMap';
import { FIXED, GRID_SIZE, RESULT, rankings, type Inside3Action, type Inside3State } from './inside3';
import type { StageProps } from './types';

export default function Inside3Stage({ state, dispatch }: StageProps<Inside3State, Inside3Action>) {
  const points: MapPoint[] = [
    ...Object.entries(FIXED).map(([label, [x, y]]) => ({ label, x, y })),
    { label: 'king − man + woman', x: RESULT[0], y: RESULT[1], kind: 'result' },
    { label: 'queen', x: state.queen[0], y: state.queen[1], movable: true },
  ];
  return (
    <div className="stack">
      <EmbeddingMap
        title="Word vectors"
        points={points}
        size={GRID_SIZE}
        onMove={(label, x, y) => {
          if (label === 'queen') dispatch({ type: 'move', to: [x, y] });
        }}
      />
      <DataTable
        caption="Closest words to king − man + woman (cosine similarity)"
        columns={['Word', 'Similarity']}
        rows={rankings(state).map((n) => [n.word, n.similarity])}
      />
    </div>
  );
}
