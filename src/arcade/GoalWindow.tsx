import type { Condition } from '../puzzles/types';

interface Props {
  goalText: string;
  conditions: Condition[];
  moves: number;
  par: number;
  solved: boolean;
  onClose: () => void;
}

export function GoalWindow({ goalText, conditions, moves, par, solved, onClose }: Props) {
  return (
    <aside className="goal-window" aria-label="Goal">
      <div className="goal-head">
        <h2>Goal</h2>
        <button type="button" aria-label="Hide goal" onClick={onClose}>
          ×
        </button>
      </div>
      <p className="goal-text">{goalText}</p>
      <ul className="checker">
        {conditions.map((c, i) => (
          <li key={i} className={c.met ? 'met' : 'unmet'}>
            <span aria-hidden="true">{c.met ? '✔' : '✘'}</span> {c.label}
            <span className="sr-only">{c.met ? ' — done' : ' — not yet'}</span>
          </li>
        ))}
      </ul>
      <p className="moves" aria-live="polite">
        {solved ? 'Solved! ' : ''}Moves: {moves} · Par: {par}
      </p>
    </aside>
  );
}
