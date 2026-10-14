import { useProgress } from '../engine/useProgress';

export default function PlayButton({ levels }: { levels: { levelId: string; href: string }[] }) {
  const progress = useProgress();
  const anySolved = levels.some((l) => progress.levels[l.levelId]?.solved);
  const next = levels.find((l) => !progress.levels[l.levelId]?.solved) ?? levels[0];
  return (
    <a className="button play" href={next?.href}>
      {anySolved ? 'Continue' : 'Play'} ▶
    </a>
  );
}
