export interface TermLine {
  id: number;
  kind: 'cmd' | 'out' | 'err' | 'ok' | 'info';
  text: string;
}
