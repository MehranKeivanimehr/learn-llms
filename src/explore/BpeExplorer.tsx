import { useId, useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { countPairs, merge, toChars } from '../models/tokenizer';
import { TokenStrip } from '../viz/TokenStrip';

function BpeExplorer() {
  const id = useId();
  const [text, setText] = useState('the cat sat on the mat');
  const [tokens, setTokens] = useState(() => toChars('the cat sat on the mat'));
  const [log, setLog] = useState<string[]>([]);
  const best = countPairs(tokens)[0];
  const canMerge = best !== undefined && best.count >= 2;

  function restart(newText: string) {
    setText(newText);
    setTokens(toChars(newText));
    setLog([]);
  }

  function step() {
    if (!canMerge) return;
    setTokens((t) => merge(t, best.pair));
    setLog((l) => [...l, `${best.pair[0]}+${best.pair[1]} (seen ${best.count}×)`.replace(/_/g, '␣')]);
  }

  return (
    <div className="stack">
      <div className="prompt-form">
        <label htmlFor={`${id}-text`}>Text to tokenize</label>
        <input id={`${id}-text`} value={text} maxLength={80} onChange={(e) => restart(e.target.value)} />
      </div>
      <div className="button-row">
        <button type="button" className="primary" onClick={step} disabled={!canMerge}>
          Merge the most common pair
        </button>
        <button type="button" onClick={() => restart(text)}>
          Start over
        </button>
      </div>
      {!canMerge && <p className="muted">No pair appears twice any more — the tokenizer is done.</p>}
      <TokenStrip title="Tokens" tokens={tokens} />
      <p>
        <span className="label">Merges learned: </span>
        {log.length === 0 ? 'none yet' : log.join(', ')}
      </p>
    </div>
  );
}

export default withBoundary(BpeExplorer, 'bpe-explorer');
