import { useEffect, useRef } from 'react';

interface Props {
  moves: number;
  par: number;
  usedSolution: boolean;
  nextHref: string;
  nextTitle: string;
  onClose: () => void;
}

function scoreText(moves: number, par: number, usedSolution: boolean): string {
  if (usedSolution) return 'You watched the solution. Try it yourself any time to set a score.';
  if (moves < par) return `You used ${moves} moves — fewer than par (${par}). Amazing!`;
  if (moves === par) return `You used ${moves} moves — exactly par. Excellent!`;
  return `You used ${moves} moves. Par is ${par} — can you do it in fewer?`;
}

export function SolvedOverlay({ moves, par, usedSolution, nextHref, nextTitle, onClose }: Props) {
  const nextRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="overlay-backdrop">
      <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="solved-title">
        <h2 id="solved-title">Solved! 🎉</h2>
        <p>{scoreText(moves, par, usedSolution)}</p>
        <div className="button-row">
          <a ref={nextRef} className="button primary" href={nextHref}>
            {nextTitle} →
          </a>
          <button type="button" onClick={onClose}>
            Keep playing
          </button>
        </div>
      </div>
    </div>
  );
}
