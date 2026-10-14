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
  /** Label for the link that skips the exam, e.g. "Skip to next level". */
  skipLabel: string;
  onExam: () => void;
  onClose: () => void;
}

export function LevelCompleteDialog({ moves, par, usedSolution, nextHref, skipLabel, onExam, onClose }: Props) {
  return (
    <Modal labelledBy="complete-title" onClose={onClose} fallbackFocusId="terminal-input">
      <h2 id="complete-title">Solved!</h2>
      <p>{scoreText(moves, par, usedSolution)}</p>
      <p>Check what you learned with a quick 5-question exam, or skip it and keep going.</p>
      <div className="modal-actions">
        <button type="button" onClick={onClose}>
          Keep playing
        </button>
        <a className="button" href={nextHref}>
          {skipLabel} →
        </a>
        <span className="spacer" />
        <button type="button" className="primary" data-autofocus onClick={onExam}>
          Take the exam (5 questions)
        </button>
      </div>
    </Modal>
  );
}
