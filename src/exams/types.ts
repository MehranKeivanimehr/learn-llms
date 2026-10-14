/** Every level's exam has exactly this many questions. */
export const EXAM_LENGTH = 5;

export interface ChoiceQuestion {
  kind: 'choice';
  prompt: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  explain: string;
}

export interface TextQuestion {
  kind: 'text';
  prompt: string;
  /** Accepted answers, compared after normalizeText. */
  accept: string[];
  explain: string;
}

export interface CommandQuestion {
  kind: 'command';
  prompt: string;
  /** One correct command, used by tests and shown after a wrong answer. */
  example: string;
  /** The puzzle actions a correct command must produce from the level's start state. */
  expect: unknown[];
  explain: string;
}

export type ExamQuestion = ChoiceQuestion | TextQuestion | CommandQuestion;

export interface Exam {
  levelId: string;
  questions: ExamQuestion[];
}
