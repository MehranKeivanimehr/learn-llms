import { inside1Challenge } from './inside1';
import { inside2Challenge } from './inside2';
import { inside3Challenge } from './inside3';
import { inside4Challenge } from './inside4';
import { inside5Challenge } from './inside5';
import { inside6Challenge } from './inside6';
import { inside7Challenge } from './inside7';
import { inside8Challenge } from './inside8';
import type { ChallengeDef } from './types';

export const challenges: Record<string, ChallengeDef> = {
  'inside-1': inside1Challenge,
  'inside-2': inside2Challenge,
  'inside-3': inside3Challenge,
  'inside-4': inside4Challenge,
  'inside-5': inside5Challenge,
  'inside-6': inside6Challenge,
  'inside-7': inside7Challenge,
  'inside-8': inside8Challenge,
};
