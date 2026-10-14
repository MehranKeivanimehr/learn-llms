import { useProgress } from '../engine/useProgress';

export default function TrackProgress({ levelIds }: { levelIds: string[] }) {
  const progress = useProgress();
  const solved = levelIds.filter((id) => progress.levels[id]?.solved).length;
  return (
    <p>
      {solved === 0
        ? `${levelIds.length} levels · not started yet`
        : `You've solved ${solved} of ${levelIds.length} levels.`}
    </p>
  );
}
