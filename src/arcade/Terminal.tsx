import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { TermLine } from './types';

interface Props {
  title: string;
  lines: TermLine[];
  busy: boolean;
  /** Text being typed by a demonstration, shown as a live command line. */
  ghost: string | null;
  onRun: (line: string) => void;
  onComplete: (line: string) => { line: string; options: string[] };
  onInfo: (text: string) => void;
}

export function Terminal({ title, lines, busy, ghost, onRun, onComplete, onInfo }: Props) {
  const [value, setValue] = useState('');
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const lastTab = useRef<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasBusy = useRef(busy);

  // Disabling the input during a demo or replay drops focus; give it back afterwards (desktop only).
  useEffect(() => {
    if (wasBusy.current && !busy && window.matchMedia('(min-width: 900px)').matches && !document.querySelector('[aria-modal="true"]')) {
      inputRef.current?.focus();
    }
    wasBusy.current = busy;
  }, [busy]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, ghost]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Tab') lastTab.current = null;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!value.trim()) return;
      history.current.push(value);
      cursor.current = -1;
      onRun(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      if (history.current.length === 0) return;
      e.preventDefault();
      cursor.current = cursor.current < 0 ? history.current.length - 1 : Math.max(0, cursor.current - 1);
      setValue(history.current[cursor.current]);
    } else if (e.key === 'ArrowDown') {
      if (cursor.current < 0) return;
      e.preventDefault();
      cursor.current += 1;
      if (cursor.current >= history.current.length) {
        cursor.current = -1;
        setValue('');
      } else {
        setValue(history.current[cursor.current]);
      }
    } else if (e.key === 'Tab' && !e.shiftKey && value) {
      // A Tab that cannot make progress (twice in a row) lets focus move on, so the input never traps focus.
      if (lastTab.current === value) return;
      const r = onComplete(value);
      if (r.line === value && r.options.length === 0) return;
      e.preventDefault();
      // Remember the line only when this Tab made no progress, so the next Tab can move focus on.
      lastTab.current = r.line === value ? value : null;
      if (r.line !== value) setValue(r.line);
      if (r.options.length > 1) onInfo(r.options.join('   '));
    }
  }

  return (
    <section className="terminal" aria-label="Terminal">
      <div className="term-title">
        <span className="term-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {title}
      </div>
      <div ref={logRef} className="term-log" role="log" aria-live="polite" aria-label="Command history">
        {lines.map((l) => (
          <div key={l.id} className={`term-line ${l.kind}`}>
            {l.text}
          </div>
        ))}
        {ghost !== null && (
          <div className="term-line cmd ghost" aria-hidden="true">
            {ghost}
            <span className="caret" aria-hidden="true">
              ▌
            </span>
          </div>
        )}
      </div>
      <form className="term-input" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="terminal-input" className="sr-only">
          Command
        </label>
        <span className="prompt" aria-hidden="true">
          $
        </span>
        <input
          ref={inputRef}
          id="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={busy ? 'Watch…' : 'type a command, e.g. help'}
          disabled={busy}
        />
      </form>
    </section>
  );
}
