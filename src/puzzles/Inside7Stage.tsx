import { TOKENS } from '../models/data/block7Data';
import { BlockDiagram } from '../viz/BlockDiagram';
import { DataTable } from '../viz/DataTable';
import { blockOutput, GOAL, PIECES, type Inside7Action, type Inside7State, type PieceId } from './inside7';
import type { StageProps } from './types';

export default function Inside7Stage({ state, dispatch }: StageProps<Inside7State, Inside7Action>) {
  const out = blockOutput(state.slots);
  return (
    <div className="stack">
      <BlockDiagram
        title="Build one transformer block"
        slots={state.slots}
        pieces={PIECES}
        onPlace={(piece, slot) => dispatch({ type: 'place', piece: piece as PieceId, slot })}
        onClear={(slot) => dispatch({ type: 'clear', slot })}
      />
      {out ? (
        <DataTable
          caption={`Output vector for "${TOKENS[0]}"`}
          columns={['', 'd1', 'd2', 'd3', 'd4']}
          rows={[
            ['Your block', ...out[0]],
            ['Goal', ...GOAL[0]],
          ]}
        />
      ) : (
        <p className="muted">Fill all four steps to run the block.</p>
      )}
    </div>
  );
}
