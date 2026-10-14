import { useId, useState } from 'react';
import { withBoundary } from '../engine/ErrorBoundary';
import { CHAR_MODEL, encodeText, generate, type GenerationStep } from '../models/charModel';
import { GenerationText, StepBars } from '../puzzles/inside8Parts';
import { KnobSlider } from '../viz/KnobSlider';

function GenerationExplorer() {
  const id = useId();
  const [prompt, setPrompt] = useState('mary had a ');
  const [generated, setGenerated] = useState('');
  const [temperature, setTemperature] = useState(0);
  const [seed, setSeed] = useState(1);
  const [lastStep, setLastStep] = useState<GenerationStep | null>(null);

  function step() {
    const { text, steps } = generate(CHAR_MODEL, prompt + generated, 1, { temperature, topK: 0, topP: 1 }, seed);
    setGenerated((g) => g + text);
    setLastStep(steps[0]);
    setSeed((s) => s + 1);
  }

  function restart(newPrompt: string) {
    setPrompt(newPrompt);
    setGenerated('');
    setLastStep(null);
  }

  return (
    <div className="stack">
      <div className="prompt-form">
        <label htmlFor={`${id}-prompt`}>Prompt</label>
        <input id={`${id}-prompt`} value={prompt} maxLength={40} onChange={(e) => restart(e.target.value)} />
      </div>
      <KnobSlider label="Temperature" min={0} max={2} step={0.1} value={temperature} onCommit={setTemperature} format={(v) => v.toFixed(1)} />
      <div className="button-row">
        <button type="button" className="primary" onClick={step} disabled={encodeText(CHAR_MODEL, prompt).length === 0 && generated === ''}>
          Generate one character
        </button>
        <button type="button" onClick={() => restart(prompt)}>
          Start over
        </button>
      </div>
      <GenerationText prompt={prompt} generated={generated} />
      {lastStep && <StepBars step={lastStep} title="Probabilities for the last character" />}
    </div>
  );
}

export default withBoundary(GenerationExplorer, 'generation-explorer');
