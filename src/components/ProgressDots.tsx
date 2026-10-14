import { useProgress } from '../engine/useProgress';

interface DotLevel {
  levelId: string;
  title: string;
  href: string;
}

export default function ProgressDots({ levels, currentId }: { levels: DotLevel[]; currentId: string }) {
  const progress = useProgress();
  return (
    <ol className="dots" aria-label="Levels in this track">
      {levels.map((l, i) => {
        const solved = progress.levels[l.levelId]?.solved ?? false;
        const current = l.levelId === currentId;
        return (
          <li key={l.levelId}>
            <a
              href={l.href}
              className={`dot${solved ? ' solved' : ''}${current ? ' current' : ''}`}
              aria-current={current ? 'page' : undefined}
              aria-label={`Level ${i + 1}: ${l.title}${solved ? ' (solved)' : ''}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
