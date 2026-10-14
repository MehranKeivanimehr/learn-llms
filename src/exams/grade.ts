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

export interface CommandContext<S, A> {
  commands: LevelCommandSet<S, A>;
  start: S;
}

/** True when `answer` is correct. Command questions are judged by the actions the command produces. */
export function gradeAnswer<S, A>(q: ExamQuestion, answer: string | number, ctx?: CommandContext<S, A>): boolean {
  if (q.kind === 'choice') return answer === q.answer;
  if (q.kind === 'text') return q.accept.some((a) => normalizeText(a) === normalizeText(String(answer)));
  if (!ctx) return false;
  const r = interpret(String(answer), ctx.commands, ctx.start, Number.MAX_SAFE_INTEGER);
  return r.kind === 'actions' && deepClose(r.actions, q.expect);
}
