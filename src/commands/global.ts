type SimpleKind = 'levels' | 'hint' | 'reset' | 'undo' | 'goal' | 'objective' | 'solution' | 'code' | 'clear';

export type GlobalCommand = { kind: 'help'; topic?: string } | { kind: 'level'; n: number } | { kind: SimpleKind };

export interface GlobalInfo {
  name: string;
  usage: string;
  help: string;
}

export const GLOBAL_COMMANDS: GlobalInfo[] = [
  { name: 'help', usage: 'help [command]', help: 'List every command, or explain one.' },
  { name: 'levels', usage: 'levels', help: 'Open the level map.' },
  { name: 'level', usage: 'level <number>', help: 'Jump to a level, for example "level 3".' },
  { name: 'hint', usage: 'hint', help: 'Show the next hint.' },
  { name: 'reset', usage: 'reset', help: 'Start the puzzle over.' },
  { name: 'undo', usage: 'undo', help: 'Undo your last move.' },
  { name: 'goal', usage: 'goal', help: 'Show or hide the goal window.' },
  { name: 'objective', usage: 'objective', help: 'Read the lesson again.' },
  { name: 'solution', usage: 'solution', help: 'Watch the solution.' },
  { name: 'code', usage: 'code', help: 'Open the code challenge.' },
  { name: 'clear', usage: 'clear', help: 'Clear the terminal.' },
];

const SIMPLE = new Set<SimpleKind>(['levels', 'hint', 'reset', 'undo', 'goal', 'objective', 'solution', 'code', 'clear']);
const ALIASES: Record<string, string> = { instructions: 'objective', '?': 'help' };

export function parseGlobal(
  tokens: string[],
  levelCount: number,
): GlobalCommand | { kind: 'error'; text: string } | null {
  if (tokens.length === 0) return null;
  const first = tokens[0].toLowerCase();
  if (first === 'show' && tokens[1]?.toLowerCase() === 'commands') return { kind: 'help' };
  const name = ALIASES[first] ?? first;
  if (name === 'help') return tokens[1] ? { kind: 'help', topic: tokens[1].toLowerCase() } : { kind: 'help' };
  if (name === 'level') {
    const n = Number(tokens[1]);
    if (!Number.isInteger(n) || n < 1 || n > levelCount) {
      return { kind: 'error', text: `Usage: level <number> (1–${levelCount})` };
    }
    return { kind: 'level', n };
  }
  if (SIMPLE.has(name as SimpleKind)) return { kind: name as SimpleKind };
  return null;
}
