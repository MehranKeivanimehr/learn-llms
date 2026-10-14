import { useProgress } from '../engine/useProgress';
import type { LevelInfo } from '../lib/levels';
import { Modal } from './Modal';

interface Props {
  levels: LevelInfo[];
  currentId: string;
  onClose: () => void;
}

export function LevelSelect({ levels, currentId, onClose }: Props) {
  const progress = useProgress();
  return (
    <Modal labelledBy="levels-title" onClose={onClose} fallbackFocusId="terminal-input">
      <div className="modal-head">
        <h2 id="levels-title">Choose a level</h2>
        <button type="button" aria-label="Close level map" onClick={onClose}>
          ×
        </button>
      </div>
      <p className="slide-count">How LLMs Work Inside</p>
      <ol className="level-grid">
        {levels.map((l) => {
          const solved = progress.levels[l.levelId]?.solved ?? false;
          const current = l.levelId === currentId;
          return (
            <li key={l.levelId}>
              <a
                href={l.href}
                className={`level-tile${solved ? ' solved' : ''}${current ? ' current' : ''}`}
                aria-current={current ? 'page' : undefined}
              >
                <span className="num">{l.order}</span>
                <span>
                  {l.title}
                  {solved && <span className="sr-only"> (solved)</span>}
                  {progress.levels[l.levelId]?.examBest !== undefined && (
                    <small className="tile-exam">Exam {progress.levels[l.levelId]?.examBest}/5</small>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </Modal>
  );
}
