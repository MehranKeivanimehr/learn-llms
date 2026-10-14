import { useState, type KeyboardEvent } from 'react';
import { VizFrame } from './VizFrame';

export interface MapPoint {
  label: string;
  x: number;
  y: number;
  movable?: boolean;
  kind?: 'word' | 'result';
}

interface Props {
  title: string;
  points: MapPoint[];
  size?: number;
  onMove?: (label: string, x: number, y: number) => void;
}

const CELL = 40;
const PAD = 30;
const STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

export function EmbeddingMap({ title, points, size = 8, onMove }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const width = size * CELL + PAD * 2;
  const sx = (x: number) => PAD + x * CELL;
  const sy = (y: number) => PAD + (size - y) * CELL;
  const clamp = (v: number) => Math.max(0, Math.min(size, v));
  const range = Array.from({ length: size + 1 }, (_, i) => i);

  function onKey(e: KeyboardEvent, p: MapPoint) {
    if (!p.movable || !onMove) return;
    const step = STEPS[e.key];
    if (step) {
      e.preventDefault();
      onMove(p.label, clamp(p.x + step[0]), clamp(p.y + step[1]));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected((s) => (s === p.label ? null : p.label));
    }
  }

  const table = { columns: ['Word', 'x', 'y'], rows: points.map((p) => [p.label, String(p.x), String(p.y)]) };

  return (
    <VizFrame title={title} table={table}>
      {onMove && (
        <p className="viz-help">
          Tap a word with a dashed outline, then tap a spot on the grid. With a keyboard, focus the word and use the
          arrow keys.
        </p>
      )}
      <svg viewBox={`0 0 ${width} ${width}`} className="embedding-map" role="group" aria-label={title}>
        {range.map((i) => (
          <g key={i}>
            <line className="grid-line" x1={sx(i)} y1={sy(0)} x2={sx(i)} y2={sy(size)} />
            <line className="grid-line" x1={sx(0)} y1={sy(i)} x2={sx(size)} y2={sy(i)} />
          </g>
        ))}
        <line className="axis" x1={sx(0)} y1={sy(0)} x2={sx(size)} y2={sy(0)} />
        <line className="axis" x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(size)} />
        {points.map((p) => (
          <line key={`v-${p.label}`} className={`vec ${p.kind ?? 'word'}`} x1={sx(0)} y1={sy(0)} x2={sx(p.x)} y2={sy(p.y)} />
        ))}
        {points.map((p) => {
          const classes = ['pt', p.kind ?? 'word', p.movable ? 'movable' : '', selected === p.label ? 'selected' : '']
            .filter(Boolean)
            .join(' ');
          const dot = (
            <>
              <circle className={classes} cx={sx(p.x)} cy={sy(p.y)} r={7} />
              <text x={sx(p.x) + 9} y={sy(p.y) - 9}>
                {p.label}
              </text>
            </>
          );
          return p.movable && onMove ? (
            <g
              key={p.label}
              role="button"
              tabIndex={0}
              aria-pressed={selected === p.label}
              aria-label={`${p.label} at (${p.x}, ${p.y}), movable`}
              onClick={() => setSelected((s) => (s === p.label ? null : p.label))}
              onKeyDown={(e) => onKey(e, p)}
            >
              {dot}
            </g>
          ) : (
            <g key={p.label}>{dot}</g>
          );
        })}
        {selected &&
          onMove &&
          range.flatMap((x) =>
            range.map((y) => (
              <circle
                key={`t-${x}-${y}`}
                className="grid-target"
                cx={sx(x)}
                cy={sy(y)}
                r={12}
                onClick={() => {
                  onMove(selected, x, y);
                  setSelected(null);
                }}
              />
            )),
          )}
      </svg>
    </VizFrame>
  );
}
