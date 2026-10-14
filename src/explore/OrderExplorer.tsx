import { useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { AnswerCards, PositionControls } from '../puzzles/inside6Parts';

function OrderExplorer() {
  const [usePositions, setUsePositions] = useState(false);
  const [scale, setScale] = useState(1);
  return (
    <div className="stack">
      <PositionControls
        usePositions={usePositions}
        scale={scale}
        onToggle={() => setUsePositions((v) => !v)}
        onScale={setScale}
      />
      <AnswerCards usePositions={usePositions} scale={scale} />
    </div>
  );
}

export default withBoundary(OrderExplorer, 'order-explorer');
