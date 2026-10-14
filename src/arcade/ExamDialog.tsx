import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { LevelCommandSet } from '../commands/types';
import { gradeAnswer } from '../exams/grade';
import type { Exam, ExamQuestion } from '../exams/types';
import { Modal } from './Modal';

interface Props {
  exam: Exam;
  levelTitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commands: LevelCommandSet<any, any>;
  start: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply: (state: any, action: any) => any;
  best: number | null;
  nextHref: string;
  nextTitle: string;
  onFinish: (score: number) => void;
  onClose: () => void;
}

function feedbackText(q: ExamQuestion, ok: boolean): string {
  if (ok) return `Correct! ${q.explain}`;
  const reveal =
    q.kind === 'choice' ? `The answer is: ${q.options[q.answer]}.` : q.kind === 'text' ? `Answer: ${q.accept[0]}.` : `One correct answer: ${q.example}`;
  return `Not quite. ${reveal} ${q.explain}`;
}

function verdict(score: number, total: number): string {
  if (score === total) return 'Perfect — you’ve mastered this level.';
  if (score >= total - 1) return 'Great work!';
  return 'Reread the lesson with “Instructions” and try again any time.';
}

export function ExamDialog({ exam, levelTitle, commands, start, apply, best, nextHref, nextTitle, onFinish, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const nextRef = useRef<HTMLAnchorElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const actionButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  const total = exam.questions.length;
  const q = exam.questions[index];
  const last = index === total - 1;

  // The Modal focuses the first answer on open; after "See your score" or "Retake" the focused button
  // disappears, so move focus to the new screen ourselves.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (done) nextRef.current?.focus();
    else firstInput.current?.focus();
  }, [done, attempt, index]);

  // After grading, the answer controls are locked; put focus on the button that moves on.
  useEffect(() => {
    if (result !== null) actionButton.current?.focus();
  }, [result]);

  function check(e?: FormEvent) {
    e?.preventDefault();
    if (result !== null) {
      next();
      return;
    }
    const answer = q.kind === 'choice' ? choice : text;
    if (answer === null || (typeof answer === 'string' && answer.trim() === '')) {
      setMissing(true);
      return;
    }
    const ok = gradeAnswer(q, answer, { commands, start, apply });
    setMissing(false);
    setResult(ok);
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (last) {
      setDone(true);
      onFinish(score);
      return;
    }
    setIndex((i) => i + 1);
    setChoice(null);
    setText('');
    setResult(null);
  }

  function retake() {
    setIndex(0);
    setChoice(null);
    setText('');
    setResult(null);
    setScore(0);
    setDone(false);
    setAttempt((a) => a + 1);
  }

  return (
    <Modal labelledBy="exam-title" onClose={onClose} fallbackFocusId="terminal-input">
      <div className="modal-head">
        <h2 id="exam-title">Exam: {levelTitle}</h2>
        <button type="button" aria-label="Close exam" onClick={onClose}>
          ×
        </button>
      </div>
      {done ? (
        <>
          <p className="exam-score">
            You scored {score} out of {total}.
          </p>
          <p>
            {verdict(score, total)} Best so far: {Math.max(best ?? 0, score)}/{total}.
          </p>
          <div className="modal-actions">
            <button type="button" onClick={retake}>
              Retake
            </button>
            <button type="button" onClick={onClose}>
              Back to the level
            </button>
            <span className="spacer" />
            <a ref={nextRef} className="button primary" href={nextHref}>
              {nextTitle} →
            </a>
          </div>
        </>
      ) : (
        <form onSubmit={check}>
          <p className="slide-count">
            Question {index + 1} of {total}
          </p>
          <p className="exam-prompt" id="exam-prompt">
            {q.prompt}
          </p>
          {q.kind === 'choice' ? (
            <fieldset className="exam-options" aria-labelledby="exam-prompt">
              {q.options.map((option, i) => (
                <label key={`${index}-${i}`} className={`exam-option${result !== null && i === q.answer ? ' right' : ''}`}>
                  <input
                    ref={i === 0 ? firstInput : undefined}
                    type="radio"
                    name={`exam-q${index}`}
                    checked={choice === i}
                    disabled={result !== null}
                    onChange={() => setChoice(i)}
                    data-autofocus={i === 0 ? true : undefined}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="exam-text">
              <label htmlFor="exam-answer">Your answer</label>
              <div className="exam-input-row">
                {q.kind === 'command' && (
                  <span className="prompt" aria-hidden="true">
                    $
                  </span>
                )}
                <input
                  ref={firstInput}
                  id="exam-answer"
                  value={text}
                  readOnly={result !== null}
                  onChange={(e) => setText(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-autofocus
                />
              </div>
            </div>
          )}
          <div role="status" className={`exam-feedback${result === null ? '' : result ? ' good' : ' bad'}`}>
            {result !== null ? feedbackText(q, result) : missing ? 'Choose or type an answer first.' : ''}
          </div>
          <div className="modal-actions">
            <span className="spacer" />
            <button ref={actionButton} type={result === null ? 'submit' : 'button'} className="primary" onClick={result === null ? undefined : next}>
              {result === null ? 'Check answer' : last ? 'See your score' : 'Next question →'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
