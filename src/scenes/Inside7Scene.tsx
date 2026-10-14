import { TOKENS } from '../models/data/block7Data';
import { useTween } from '../motion/useTween';
import { blockOutput, GOAL, PIECES, type Inside7Action, type Inside7State, type PieceId } from '../puzzles/inside7';
import type { StageProps } from '../puzzles/types';
import { BlockDiagram } from '../viz/BlockDiagram';
import { DataTable } from '../viz/DataTable';
import { SceneCard } from './parts';

export default function Inside7Scene({ state, dispatch, solved }: StageProps<Inside7State, Inside7Action>) {
  const out = blockOutput(state.slots);
  const shown = useTween(out ? out[0] : [0, 0, 0, 0]);
  return (
    <>
      <div className={solved ? 'solved-flow' : undefined}>
        <BlockDiagram
          title="Build one transformer block"
          slots={state.slots}
          pieces={PIECES}
          onPlace={(piece, slot) => dispatch({ type: 'place', piece: piece as PieceId, slot })}
          onClear={(slot) => dispatch({ type: 'clear', slot })}
        />
      </div>
      <SceneCard title={`Output vector for "${TOKENS[0]}"`}>
        {out ? (
          <DataTable
            columns={['', 'd1', 'd2', 'd3', 'd4']}
            rows={[
              ['Your block', ...shown],
              ['Goal', ...GOAL[0]],
            ]}
          />
        ) : (
          <p className="canvas-label">Fill all four steps to run the block.</p>
        )}
      </SceneCard>
    </>
  );
}
