import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import CodeMirror from '@uiw/react-codemirror';
import { marked } from 'marked';
import { useMemo, useState } from 'react';
import type { ChallengeDef } from '../challenges/types';
import { runInWorker, type RunOutcome } from './codeRunnerClient';
import { getProgressStore } from './progressStore';

const extensions = [
  javascript(),
  EditorView.lineWrapping,
  EditorView.contentAttributes.of({ 'aria-label': 'Code editor' }),
  // The dark theme's comment colour is too faint; this keeps comments readable (≥ 4.5:1).
  Prec.highest(syntaxHighlighting(HighlightStyle.define([{ tag: tags.comment, color: '#9aa3ad', fontStyle: 'italic' }]))),
];


function Outcome({ outcome, def }: { outcome: RunOutcome | null; def: ChallengeDef }) {
  if (!outcome) return null;
  if (outcome.kind === 'timeout') return <p className="bad">Your code took too long — check for an infinite loop.</p>;
  if (outcome.kind === 'crash') return <p className="bad">{outcome.message}</p>;
  const allPassed = outcome.results.every((r) => r.passed);
  return (
    <>
      {allPassed && <p className="good">All tests pass! 🎉</p>}
      <ul className="test-results">
        {outcome.results.map((r, i) => (
          <li key={i} className={r.passed ? 'good' : 'bad'}>
            <span aria-hidden="true">{r.passed ? '✔' : '✘'}</span> {r.name}
            <span className="sr-only">{r.passed ? ' — passed' : ' — failed'}</span>
            {!r.passed && (
              <div className="test-detail">
                {r.error !== undefined
                  ? `Error${r.line ? ` on line ${r.line}` : ''}: ${r.error}`
                  : `Expected ${JSON.stringify(def.tests[i].expect)}, got ${
                      r.actual === undefined ? 'undefined' : JSON.stringify(r.actual)
                    }`}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export function CodeChallenge({ def, levelId }: { def: ChallengeDef; levelId: string }) {
  const [code, setCode] = useState(def.starterCode);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const promptHtml = useMemo(() => marked.parse(def.prompt, { async: false }) as string, [def.prompt]);

  async function run() {
    setRunning(true);
    const result = await runInWorker(code, def.functionName, def.tests);
    setOutcome(result);
    setRunning(false);
    if (result.kind === 'results' && result.results.every((r) => r.passed)) {
      getProgressStore().markChallengePassed(levelId);
    }
  }

  function showReference() {
    if (window.confirm('Replace your code with the reference solution?')) {
      setCode(def.reference);
      setOutcome(null);
    }
  }

  return (
    <div className="challenge">
      <h2>{def.title}</h2>
      <div className="prose" dangerouslySetInnerHTML={{ __html: promptHtml }} />
      <div className="editor">
        <CodeMirror value={code} onChange={setCode} extensions={extensions} minHeight="200px" theme="dark" />
      </div>
      <div className="button-row">
        <button type="button" className="primary" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run tests'}
        </button>
        <button
          type="button"
          onClick={() => {
            setCode(def.starterCode);
            setOutcome(null);
          }}
        >
          Reset code
        </button>
        <button type="button" onClick={showReference}>
          Show reference solution
        </button>
      </div>
      <div aria-live="polite">
        <Outcome outcome={outcome} def={def} />
      </div>
    </div>
  );
}
