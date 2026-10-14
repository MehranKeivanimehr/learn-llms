import { lazy, Suspense, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { challenges } from '../challenges/registry';
import type { GlobalCommand } from '../commands/global';
import { complete, helpText, interpret } from '../commands/interpret';
import { ErrorBoundary, withBoundary } from '../engine/ErrorBoundary';
import { getProgressStore } from '../engine/progressStore';
import { currentState, hostReducer, initHost } from '../engine/puzzleState';
import type { LevelInfo } from '../lib/levels';
import { usePrefersReducedMotion } from '../motion/useTween';
import { GoalWindow } from './GoalWindow';
import { HelpBar } from './HelpBar';
import { IntroDialog } from './IntroDialog';
import { LevelCompleteDialog } from './LevelCompleteDialog';
import { levelModules, type LevelModule } from './levelModules';
import { LevelSelect } from './LevelSelect';
import { Modal } from './Modal';
import { SolvedBurst } from './SolvedBurst';
import { Terminal } from './Terminal';
import { TopBar } from './TopBar';
import type { TermLine } from './types';

const CodeChallenge = lazy(() => import('../engine/CodeChallenge').then((m) => ({ default: m.CodeChallenge })));

const REPLAY_STEP_MS = 700;
const TYPE_MS = 35;
const DEMO_PAUSE_MS = 900;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lineId = 0;
const mk = (kind: TermLine['kind'], text: string): TermLine => ({ id: ++lineId, kind, text });

interface Props {
  level: LevelInfo;
  levels: LevelInfo[];
  homeHref: string;
  trackHref: string;
}

type DialogKind = 'intro' | 'levels' | 'complete' | null;

function LevelRuntime({ level, levels, homeHref, trackHref, module }: Props & { module: LevelModule }) {
  const { def, Scene, commands } = module;
  const reducer = useMemo(() => hostReducer(def), [def]);
  const [host, dispatchHost] = useReducer(reducer, def, initHost);
  const state = currentState(host);
  const conditions = def.conditions(state);
  const solved = conditions.every((c) => c.met);
  const reduced = usePrefersReducedMotion();

  const [lines, setLines] = useState<TermLine[]>(() => [
    mk('info', `Level ${level.order}: ${level.title}. Type "help" to see the commands, or use the canvas.`),
  ]);
  const [goalOpen, setGoalOpen] = useState(true);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ghost, setGhost] = useState<string | null>(null);

  // Refs let async demo/replay loops and event handlers see the latest values.
  const stateRef = useRef(state);
  stateRef.current = state;
  const hostRef = useRef(host);
  hostRef.current = host;
  const recorded = useRef(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  const print = (...more: TermLine[]) => setLines((prev) => [...prev, ...more].slice(-300));
  const index = levels.findIndex((l) => l.levelId === level.levelId);
  const next = levels[index + 1] ?? null;
  const challenge = level.challenge ? challenges[level.challenge] : undefined;

  useEffect(() => {
    const store = getProgressStore();
    if (store.notice) print(mk('info', store.notice));
    if (!store.level(level.levelId).solved) setDialog('intro');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!solved) {
      recorded.current = false;
      return;
    }
    if (recorded.current || host.replaying) return;
    recorded.current = true;
    getProgressStore().markSolved(level.levelId, host.usedSolution ? null : host.moves);
    print(mk('ok', 'Solved! 🎉'));
    setBurst(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, host.replaying, host.usedSolution, host.moves]);

  /** Applies actions through the reducer and returns the resulting state immediately. */
  function runActions(actions: unknown[], replay = false) {
    let s = stateRef.current;
    for (const action of actions) {
      s = def.apply(s, action);
      dispatchHost({ type: 'act', action, replay });
    }
    const changed = s !== stateRef.current;
    stateRef.current = s;
    return { changed, s };
  }

  function busyMessage() {
    print(mk('err', 'Wait for the demonstration to finish.'));
  }

  function handleGlobal(c: GlobalCommand) {
    const h = hostRef.current;
    switch (c.kind) {
      case 'help':
        print(mk('out', helpText(commands, c.topic)));
        break;
      case 'levels':
        setDialog('levels');
        break;
      case 'level':
        window.location.href = levels[c.n - 1].href;
        break;
      case 'hint':
        if (h.hintsShown >= def.hints.length) print(mk('info', 'No more hints. Type "solution" to watch the answer.'));
        else {
          print(mk('ok', `Hint ${h.hintsShown + 1}: ${def.hints[h.hintsShown]}`));
          dispatchHost({ type: 'hint' });
        }
        break;
      case 'reset':
        if (h.replaying) return busyMessage();
        dispatchHost({ type: 'reset' });
        stateRef.current = def.start();
        print(mk('info', 'Puzzle reset.'));
        break;
      case 'undo':
        if (h.replaying) return busyMessage();
        if (h.moves === 0) print(mk('info', 'Nothing to undo.'));
        else {
          const previous = h.history[h.history.length - 2];
          dispatchHost({ type: 'undo' });
          stateRef.current = previous;
          print(mk('out', commands.summarize(previous)));
        }
        break;
      case 'goal':
        setGoalOpen((o) => !o);
        break;
      case 'objective':
        setDialog('intro');
        break;
      case 'solution':
        void playSolution();
        break;
      case 'code':
        if (challenge) setCodeOpen(true);
        else print(mk('info', 'This level has no code challenge.'));
        break;
      case 'clear':
        setLines([]);
        break;
    }
  }

  function executeLine(text: string, replay = false) {
    print(mk('cmd', text));
    const r = interpret(text, commands, stateRef.current, levels.length);
    switch (r.kind) {
      case 'empty':
        return;
      case 'error':
        print(mk('err', r.text));
        return;
      case 'text':
        print(mk('out', r.text));
        return;
      case 'global':
        handleGlobal(r.command);
        return;
      case 'actions': {
        if (hostRef.current.replaying && !replay) return busyMessage();
        const { changed, s } = runActions(r.actions, replay);
        print(changed ? mk('out', commands.summarize(s)) : mk('info', 'Nothing changed.'));
      }
    }
  }

  async function playSolution() {
    if (hostRef.current.replaying) return;
    const ok = window.confirm("Watch the solution? The level will count as solved, but your move count won't be recorded.");
    if (!ok) {
      print(mk('info', 'Solution cancelled.'));
      return;
    }
    setBusy(true);
    dispatchHost({ type: 'startReplay' });
    stateRef.current = def.start();
    print(mk('info', 'Playing the solution…'));
    for (const action of def.solution) {
      await sleep(reduced ? 150 : REPLAY_STEP_MS);
      if (!alive.current) return;
      const { s } = runActions([action], true);
      print(mk('out', commands.summarize(s)));
    }
    dispatchHost({ type: 'endReplay' });
    setBusy(false);
  }

  async function playDemo() {
    if (level.demo.length === 0 || hostRef.current.replaying) return;
    setDialog(null);
    setBusy(true);
    dispatchHost({ type: 'startDemo' });
    stateRef.current = def.start();
    print(mk('info', 'Watch this…'));
    for (const cmd of level.demo) {
      for (let i = 1; i <= cmd.length; i++) {
        if (!alive.current) return;
        setGhost(cmd.slice(0, i));
        await sleep(reduced ? 0 : TYPE_MS);
      }
      setGhost(null);
      executeLine(cmd, true);
      await sleep(reduced ? 200 : DEMO_PAUSE_MS);
    }
    dispatchHost({ type: 'endDemo' });
    stateRef.current = def.start();
    setBusy(false);
    print(mk('ok', 'Your turn! The puzzle has been reset.'));
  }

  function sceneDispatch(action: unknown) {
    if (hostRef.current.replaying) return;
    const { changed, s } = runActions([action]);
    if (changed) print(mk('out', commands.summarize(s)));
  }

  const anyModal = dialog !== null || codeOpen;

  return (
    <div className="arcade">
      <div className="arcade-shell" inert={anyModal}>
        <TopBar
          level={level}
          levels={levels}
          homeHref={homeHref}
          trackHref={trackHref}
          onLevels={() => setDialog('levels')}
          onInstructions={() => setDialog('intro')}
        />
        <div className="arcade-main">
          <Terminal
            title={`Level ${level.order} — ${level.title}`}
            lines={lines}
            busy={busy}
            ghost={ghost}
            onRun={(t) => executeLine(t)}
            onComplete={(t) => complete(t, commands, stateRef.current)}
            onInfo={(t) => print(mk('info', t))}
          />
          <section className="arcade-canvas" aria-label="Canvas">
            {goalOpen && (
              <GoalWindow
                goalText={def.goalText}
                conditions={conditions}
                moves={host.moves}
                par={def.par}
                solved={solved}
                onClose={() => setGoalOpen(false)}
              />
            )}
            <div className="scene-scroll">
              <ErrorBoundary name="scene">
                <div className="scene">
                  <Scene state={state} dispatch={sceneDispatch} solved={solved} />
                </div>
              </ErrorBoundary>
            </div>
            {burst && (
              <SolvedBurst
                onDone={() => {
                  setBurst(false);
                  setDialog('complete');
                }}
              />
            )}
            <HelpBar onCommand={(c) => executeLine(c)} hasCode={Boolean(challenge)} busy={busy} />
          </section>
        </div>
      </div>

      {dialog === 'intro' && (
        <IntroDialog
          levelTitle={level.title}
          hasDemo={level.demo.length > 0}
          onClose={() => setDialog(null)}
          onDemo={() => void playDemo()}
        />
      )}
      {dialog === 'levels' && <LevelSelect levels={levels} currentId={level.levelId} onClose={() => setDialog(null)} />}
      {dialog === 'complete' && (
        <LevelCompleteDialog
          moves={host.moves}
          par={def.par}
          usedSolution={host.usedSolution}
          nextHref={next ? next.href : trackHref}
          nextTitle={next ? `Next: ${next.title}` : 'Back to the level map'}
          onClose={() => setDialog(null)}
        />
      )}
      {codeOpen && challenge && (
        <Modal variant="drawer" labelledBy="code-title" onClose={() => setCodeOpen(false)} fallbackFocusId="terminal-input">
          <div className="modal-head">
            <h2 id="code-title">Code challenge</h2>
            <button type="button" aria-label="Close code challenge" onClick={() => setCodeOpen(false)}>
              ×
            </button>
          </div>
          <Suspense fallback={<p>Loading the code editor…</p>}>
            <CodeChallenge def={challenge} levelId={level.levelId} />
          </Suspense>
        </Modal>
      )}
    </div>
  );
}

function ArcadeLevel(props: Props) {
  const [module, setModule] = useState<LevelModule | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = levelModules[props.level.puzzle];
    if (!load) {
      setFailed(true);
      return;
    }
    let active = true;
    load().then(
      (m) => active && setModule(m),
      () => active && setFailed(true),
    );
    return () => {
      active = false;
    };
  }, [props.level.puzzle]);

  if (module) return <LevelRuntime {...props} module={module} />;
  return (
    <div className="arcade">
      <div className="arcade-shell">
        <TopBar {...props} onLevels={() => undefined} onInstructions={() => undefined} />
        <div className="arcade-main">
          <Terminal
            title={`Level ${props.level.order} — ${props.level.title}`}
            lines={[]}
            busy
            ghost={null}
            onRun={() => undefined}
            onComplete={(line) => ({ line, options: [] })}
            onInfo={() => undefined}
          />
          <section className="arcade-canvas" aria-label="Canvas">
            <p className="canvas-message" role={failed ? 'alert' : undefined}>
              {failed ? 'This level could not be loaded. Try reloading the page.' : 'Loading the level…'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default withBoundary(ArcadeLevel, 'arcade-level');
