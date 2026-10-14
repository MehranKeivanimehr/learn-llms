import { interpret } from '../commands/interpret';
import type { LevelCommandSet } from '../commands/types';
import { deepClose } from '../engine/runChallenge';
import type { ExamQuestion } from './types';

/** Lower-case, collapse spaces, and drop surrounding quotes and end punctuation. */
export function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^["'“”‘’]+|["'“”‘’.!?]+$/g, '')
    .trim();
}

/** A number written alone or followed by one word ("2", "2.0", "2 tokens"); otherwise null. */
function numericValue(s: string): number | null {
  const m = normalizeText(s).match(/^(-?\d+(?:\.\d+)?)(?:\s+[a-z]+)?$/);
  return m ? Number(m[1]) : null;
}

export interface CommandContext<S, A> {
  commands: LevelCommandSet<S, A>;
  start: S;
  /** The level's rules. When given, commands are graded by the state they produce, not their exact actions. */
  apply?: (state: S, action: A) => S;
}

function textMatches(accept: string[], answer: string): boolean {
  if (accept.some((a) => normalizeText(a) === normalizeText(answer))) return true;
  const n = numericValue(answer);
  return n !== null && accept.some((a) => numericValue(a) === n);
}

/** True when `answer` is correct. Command questions are judged by what the command does in the level. */
export function gradeAnswer<S, A>(q: ExamQuestion, answer: string | number, ctx?: CommandContext<S, A>): boolean {
  if (q.kind === 'choice') return answer === q.answer;
  if (q.kind === 'text') return textMatches(q.accept, String(answer));
  if (!ctx) return false;
  const r = interpret(String(answer), ctx.commands, ctx.start, Number.MAX_SAFE_INTEGER);
  if (r.kind !== 'actions') return false;
  if (!ctx.apply) return deepClose(r.actions, q.expect);
  const apply = ctx.apply;
  const run = (actions: A[]) => actions.reduce((s, a) => apply(s, a), ctx.start);
  return deepClose(run(r.actions), run(q.expect as A[]));
}
