import { useState } from 'react';
import { VizFrame } from './VizFrame';

export interface BlockPieceInfo {
  id: string;
  label: string;
}

interface Props {
  title: string;
  slots: (string | null)[];
  pieces: BlockPieceInfo[];
  onPlace: (piece: string, slot: number) => void;
  onClear: (slot: number) => void;
}

export function BlockDiagram({ title, slots, pieces, onPlace, onClear }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const labelOf = (id: string) => pieces.find((p) => p.id === id)?.label ?? id;
  const tray = pieces.filter((p) => !slots.includes(p.id));
  const table = {
    columns: ['Step', 'Piece'],
    rows: slots.map((s, i) => [String(i + 1), s ? labelOf(s) : '(empty)']),
  };

  return (
    <VizFrame title={title} table={table}>
      <div className="block-diagram">
        <div className="tray">
          <p className="label">Pieces — tap one, then tap an empty step (or drag it there).</p>
          {tray.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`piece${selected === p.id ? ' selected' : ''}`}
              aria-pressed={selected === p.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', p.id)}
              onClick={() => setSelected((s) => (s === p.id ? null : p.id))}
            >
              {p.label}
            </button>
          ))}
          {tray.length === 0 && <p className="muted">All pieces are placed.</p>}
        </div>
        <ol className="slots">
          <li className="io">Input vectors ↓</li>
          {slots.map((s, i) => (
            <li
              key={i}
              className="slot"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id) onPlace(id, i);
              }}
            >
              {s ? (
                <>
                  <span className="piece placed">{labelOf(s)}</span>
                  <button
                    type="button"
                    className="link-button"
                    aria-label={`Remove ${labelOf(s)} from step ${i + 1}`}
                    onClick={() => onClear(i)}
                  >
                    remove
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="slot-target"
                  disabled={!selected}
                  onClick={() => {
                    if (selected) {
                      onPlace(selected, i);
                      setSelected(null);
                    }
                  }}
                >
                  Step {i + 1}: {selected ? `put "${labelOf(selected)}" here` : 'empty'}
                </button>
              )}
            </li>
          ))}
          <li className="io">Output vectors ↓</li>
        </ol>
      </div>
    </VizFrame>
  );
}
