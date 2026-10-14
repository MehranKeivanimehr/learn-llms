import { useId, useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { cosineSimilarity } from '../models/embeddings';
import { EmbeddingMap } from '../viz/EmbeddingMap';

const START: Record<string, [number, number]> = {
  king: [4, 1],
  queen: [4, 3],
  man: [1, 1],
  woman: [1, 3],
  apple: [1, 7],
  banana: [2, 7],
};

function EmbeddingExplorer() {
  const id = useId();
  const [vectors, setVectors] = useState(START);
  const [a, setA] = useState('king');
  const [b, setB] = useState('queen');
  const words = Object.keys(vectors);
  const sim = cosineSimilarity(vectors[a], vectors[b]);

  return (
    <div className="stack">
      <EmbeddingMap
        title="A tiny 2D word map"
        points={words.map((w) => ({ label: w, x: vectors[w][0], y: vectors[w][1], movable: true }))}
        onMove={(label, x, y) => setVectors((v) => ({ ...v, [label]: [x, y] }))}
      />
      <div className="button-row">
        <label htmlFor={`${id}-a`}>Compare</label>
        <select id={`${id}-a`} value={a} onChange={(e) => setA(e.target.value)}>
          {words.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
        <label htmlFor={`${id}-b`}>with</label>
        <select id={`${id}-b`} value={b} onChange={(e) => setB(e.target.value)}>
          {words.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      </div>
      <p aria-live="polite">
        Cosine similarity of <strong>{a}</strong> and <strong>{b}</strong>: <strong>{sim.toFixed(3)}</strong>
      </p>
    </div>
  );
}

export default withBoundary(EmbeddingExplorer, 'embedding-explorer');
