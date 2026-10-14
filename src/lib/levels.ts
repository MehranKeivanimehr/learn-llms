import type { CollectionEntry } from 'astro:content';
import { withBase } from './url';

export interface LevelInfo {
  levelId: string;
  order: number;
  title: string;
  summary: string;
  puzzle: string;
  challenge: string | null;
  slug: string;
  href: string;
}

type LevelEntry = CollectionEntry<'levels'>;

export function sortLevels(entries: LevelEntry[]): LevelEntry[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

export function toLevelInfo(entry: LevelEntry): LevelInfo {
  const slug = entry.id.split('/').pop() ?? entry.id;
  return {
    levelId: entry.data.levelId,
    order: entry.data.order,
    title: entry.data.title,
    summary: entry.data.summary,
    puzzle: entry.data.puzzle,
    challenge: entry.data.challenge ?? null,
    slug,
    href: withBase(`${entry.data.track}/${slug}/`),
  };
}
