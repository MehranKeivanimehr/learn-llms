import type { ComponentType } from 'react';

export interface Condition {
  label: string;
  met: boolean;
}

export interface PuzzleDef<S, A> {
  id: string;
  /** One or two sentences telling the learner what to do. */
  instructions: string;
  /** Short description of the target, shown in the Goal box. */
  goalText: string;
  start(): S;
  /** Pure. Return the SAME object when the action changes nothing; it then doesn't count as a move. */
  apply(state: S, action: A): S;
  conditions(state: S): Condition[];
  /** Best-known number of moves. */
  par: number;
  /** Revealed one at a time. */
  hints: string[];
  /** Reference solution, replayed by "Show solution". */
  solution: A[];
}

export interface StageProps<S, A> {
  state: S;
  dispatch: (action: A) => void;
  solved: boolean;
}

export interface PuzzleModule<S, A> {
  def: PuzzleDef<S, A>;
  Stage: ComponentType<StageProps<S, A>>;
  /** Optional custom goal preview; otherwise goalText is shown. */
  Goal?: ComponentType;
}

export function isSolved<S, A>(def: PuzzleDef<S, A>, state: S): boolean {
  return def.conditions(state).every((c) => c.met);
}
