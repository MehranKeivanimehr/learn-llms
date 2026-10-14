import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { challenges } from '../challenges/registry';
import { withBoundary } from './ErrorBoundary';

// The editor (CodeMirror) is large, so it is only downloaded when the Code tab is shown.
const CodeChallenge = lazy(() => import('./CodeChallenge').then((m) => ({ default: m.CodeChallenge })));

const loading = <p className="muted">Loading the code editor…</p>;

function CodeIsland({ challengeId, levelId }: { challengeId: string; levelId: string }) {
  const def = challenges[challengeId];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    // The panel is `hidden` until its tab is selected, so this fires on first open.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!def) return <p role="alert">Code challenge "{challengeId}" was not found.</p>;
  return (
    <div ref={ref}>
      {visible ? (
        <Suspense fallback={loading}>
          <CodeChallenge def={def} levelId={levelId} />
        </Suspense>
      ) : (
        loading
      )}
    </div>
  );
}

export default withBoundary(CodeIsland, 'code-challenge');
