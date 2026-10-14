import { VizFrame } from './VizFrame';

const show = (t: string) => t.replace(/_/g, '␣').replace(/\n/g, '↵');

export function TokenStrip({ title, tokens }: { title: string; tokens: string[] }) {
  const table = { columns: ['#', 'Token'], rows: tokens.map((t, i) => [String(i + 1), show(t)]) };
  return (
    <VizFrame title={`${title} — ${tokens.length} tokens`} table={table}>
      <ol className="token-strip">
        {tokens.map((t, i) => (
          <li key={i} className={`token tone-${i % 4}`}>
            {show(t)}
          </li>
        ))}
      </ol>
    </VizFrame>
  );
}
