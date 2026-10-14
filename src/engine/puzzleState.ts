import type { PuzzleDef } from '../puzzles/types';

export interface HostState<S> {
  history: S[];
  moves: number;
  hintsShown: number;
  usedSolution: boolean;
  replaying: boolean;
}

export type HostAction<A> =
  | { type: 'act'; action: A; replay?: boolean }
  | { type: 'undo' }
  | { type: 'reset' }
  | { type: 'hint' }
  | { type: 'startReplay' }
  | { type: 'endReplay' };

export function initHost<S, A>(def: PuzzleDef<S, A>): HostState<S> {
  return { history: [def.start()], moves: 0, hintsShown: 0, usedSolution: false, replaying: false };
}

export function currentState<S>(host: HostState<S>): S {
  return host.history[host.history.length - 1];
}

export function hostReducer<S, A>(def: PuzzleDef<S, A>) {
  return (host: HostState<S>, ha: HostAction<A>): HostState<S> => {
    switch (ha.type) {
      case 'act': {
        if (host.replaying && !ha.replay) return host;
        const prev = currentState(host);
        const next = def.apply(prev, ha.action);
        if (next === prev) return host;
        return { ...host, history: [...host.history, next], moves: host.moves + 1 };
      }
      case 'undo':
        if (host.replaying || host.history.length <= 1) return host;
        return { ...host, history: host.history.slice(0, -1), moves: host.moves - 1 };
      case 'reset':
        if (host.replaying) return host;
        return { ...host, history: [def.start()], moves: 0 };
      case 'hint':
        return host.hintsShown >= def.hints.length ? host : { ...host, hintsShown: host.hintsShown + 1 };
      case 'startReplay':
        return { ...host, history: [def.start()], moves: 0, usedSolution: true, replaying: true };
      case 'endReplay':
        return { ...host, replaying: false };
    }
  };
}
