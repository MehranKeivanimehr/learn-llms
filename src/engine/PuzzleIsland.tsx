import { useEffect, useState } from 'react';
import { puzzleLoaders } from '../puzzles/registry';
import type { PuzzleModule } from '../puzzles/types';
import { withBoundary } from './ErrorBoundary';
import { PuzzleHost } from './PuzzleHost';

interface Props {
  puzzleId: string;
  levelId: string;
  nextHref: string;
  nextTitle: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPuzzleModule = PuzzleModule<any, any>;

function PuzzleIsland({ puzzleId, ...rest }: Props) {
  const [module, setModule] = useState<AnyPuzzleModule | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = puzzleLoaders[puzzleId];
    if (!load) {
      setFailed(true);
      return;
    }
    let alive = true;
    load().then(
      (m) => alive && setModule(m),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [puzzleId]);

  if (failed) return <p role="alert">Puzzle "{puzzleId}" could not be loaded. Try reloading the page.</p>;
  if (!module) return <p className="muted">Loading the puzzle…</p>;
  return <PuzzleHost module={module} {...rest} />;
}

export default withBoundary(PuzzleIsland, 'puzzle');
