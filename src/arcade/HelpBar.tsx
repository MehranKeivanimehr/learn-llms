const BUTTONS: [string, string][] = [
  ['Hint', 'hint'],
  ['Reset', 'reset'],
  ['Undo', 'undo'],
  ['Goal', 'goal'],
  ['Solution', 'solution'],
  ['Exam', 'exam'],
  ['Code', 'code'],
];

interface Props {
  onCommand: (command: string) => void;
  hasCode: boolean;
  busy: boolean;
}

export function HelpBar({ onCommand, hasCode, busy }: Props) {
  return (
    <nav className="helpbar" aria-label="Quick commands">
      {BUTTONS.filter(([, cmd]) => cmd !== 'code' || hasCode).map(([label, cmd]) => (
        <button key={cmd} type="button" onClick={() => onCommand(cmd)} disabled={busy && cmd !== 'goal'}>
          {label}
        </button>
      ))}
    </nav>
  );
}
