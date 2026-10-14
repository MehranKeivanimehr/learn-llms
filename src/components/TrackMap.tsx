import { useProgress } from '../engine/useProgress';

interface CardLevel {
  levelId: string;
  order: number;
  title: string;
  summary: string;
  href: string;
  hasChallenge: boolean;
}

export default function TrackMap({ levels }: { levels: CardLevel[] }) {
  const progress = useProgress();
  const solvedCount = levels.filter((l) => progress.levels[l.levelId]?.solved).length;
  return (
    <>
      <p>
        {solvedCount} of {levels.length} levels solved
      </p>
      <ol className="level-cards">
        {levels.map((l) => {
          const p = progress.levels[l.levelId];
          return (
            <li key={l.levelId} className="level-card" data-level-card={l.levelId}>
              <h2>
                <a href={l.href}>
                  <span className="num" aria-hidden="true">
                    {l.order}
                  </span>
                  {l.title}
                </a>
              </h2>
              <p>{l.summary}</p>
              <p className="badges">
                {p?.solved ? (
                  <span className="badge good">
                    ✔ Solved{p.bestMoves !== undefined ? ` · best ${p.bestMoves} moves` : ''}
                  </span>
                ) : (
                  <span className="badge">Not solved yet</span>
                )}
                {p?.examBest !== undefined && <span className="badge good">Exam {p.examBest}/5</span>}
                {l.hasChallenge &&
                  (p?.challengePassed ? (
                    <span className="badge good">✔ Code challenge</span>
                  ) : (
                    <span className="badge">Code challenge</span>
                  ))}
              </p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
