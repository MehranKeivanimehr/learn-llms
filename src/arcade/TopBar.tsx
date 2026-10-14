import ProgressDots from '../components/ProgressDots';
import SiteMenu from '../components/SiteMenu';
import type { LevelInfo } from '../lib/levels';

interface Props {
  level: LevelInfo;
  levels: LevelInfo[];
  homeHref: string;
  trackHref: string;
  onLevels: () => void;
  onInstructions: () => void;
}

export function TopBar({ level, levels, homeHref, trackHref, onLevels, onInstructions }: Props) {
  return (
    <header className="topbar">
      <a className="brand" href={homeHref}>
        Learn LLMs
      </a>
      <h1>
        Level {level.order}: {level.title}
      </h1>
      <span className="spacer" />
      <ProgressDots levels={levels.map((l) => ({ levelId: l.levelId, title: l.title, href: l.href }))} currentId={level.levelId} />
      <button type="button" onClick={onLevels}>
        Levels
      </button>
      <button type="button" onClick={onInstructions}>
        Instructions
      </button>
      <SiteMenu trackHref={trackHref} />
    </header>
  );
}
