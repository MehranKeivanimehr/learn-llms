export type CommandReply<A> =
  | { kind: 'actions'; actions: A[] }
  | { kind: 'text'; text: string }
  | { kind: 'error'; text: string };

export interface LevelCommand<S, A> {
  /** Lower-case command name. */
  name: string;
  aliases?: string[];
  usage: string;
  help: string;
  run(args: string[], state: S): CommandReply<A>;
  /** Suggestions for argument `argIndex` starting with `prefix`; `previous` holds the earlier arguments. */
  complete?(argIndex: number, prefix: string, state: S, previous: string[]): string[];
}

export interface LevelCommandSet<S, A> {
  commands: LevelCommand<S, A>[];
  /** One short line describing the state, printed after every move. */
  summarize(state: S): string;
}

export function actions<A>(...list: A[]): CommandReply<A> {
  return { kind: 'actions', actions: list };
}

export function text<A>(t: string): CommandReply<A> {
  return { kind: 'text', text: t };
}

export function error<A>(t: string): CommandReply<A> {
  return { kind: 'error', text: t };
}

export function usageError<A>(cmd: { usage: string }): CommandReply<A> {
  return error(`Usage: ${cmd.usage}`);
}
