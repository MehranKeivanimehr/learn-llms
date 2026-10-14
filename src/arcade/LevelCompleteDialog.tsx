import { Modal } from './Modal';

export function scoreText(moves: number, par: number, usedSolution: boolean): string {
  if (usedSolution) return 'You watched the solution. Try it yourself any time to set a score.';
  if (moves < par) return `You used ${moves} moves — fewer than par (${par}). Amazing!`;
  if (moves === par) return `You used ${moves} moves — exactly par. Excellent!`;
  return `You used ${moves} moves. Par is ${par} — can you do it in fewer?`;
}

interface Props {
  moves: number;
  par: number;
  usedSolution: boolean;
  nextHref: string;
  nextTitle: string;
  onClose: () => void;
}

export function LevelCompleteDialog({ moves, par, usedSolution, nextHref, nextTitle, onClose }: Props) {
  return (
    <Modal labelledBy="complete-title" onClose={onClose} fallbackFocusId="terminal-input">
      <h2 id="complete-title">Solved!</h2>
      <p>{scoreText(moves, par, usedSolution)}</p>
      <div className="modal-actions">
        <button type="button" onClick={onClose}>
          Keep playing
        </button>
        <span className="spacer" />
        <a className="button primary" data-autofocus href={nextHref}>
          {nextTitle} →
        </a>
      </div>
    </Modal>
  );
}
