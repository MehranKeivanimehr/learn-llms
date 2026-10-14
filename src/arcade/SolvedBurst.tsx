import { useEffect, useRef, type CSSProperties } from 'react';
import { usePrefersReducedMotion } from '../motion/useTween';

const CHIPS = ['token', 'attention', 'softmax', 'Paris', 'embed', 'MLP', 'top-k', 'merge', 'query', 'key', 'value', 'logits', '✓', '★'];

export function SolvedBurst({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => done.current(), reduced ? 0 : 1300);
    return () => clearTimeout(timer);
  }, [reduced]);

  if (reduced) return null;
  return (
    <div className="burst" aria-hidden="true">
      {CHIPS.map((chip, i) => {
        const angle = (i / CHIPS.length) * Math.PI * 2;
        const distance = 220 + (i % 3) * 60;
        const style = {
          '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
          '--dy': `${Math.round(Math.sin(angle) * distance)}px`,
          '--rot': `${(i % 2 ? 1 : -1) * (20 + i * 7)}deg`,
        } as CSSProperties;
        return (
          <span key={i} className="canvas-chip burst-chip" style={style}>
            {chip}
          </span>
        );
      })}
      <div className="burst-label">Solved!</div>
    </div>
  );
}
