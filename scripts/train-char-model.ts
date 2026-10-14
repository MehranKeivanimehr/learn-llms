import { mkdirSync, writeFileSync } from 'node:fs';
import { mulberry32 } from '../src/models/sampling';
import { Adam, backward, crossEntropy } from './lib/autograd';
import { forward, greedyTrain, initParams, paramsFromWeights, paramsList, toWeights } from './lib/charModelTrain';
import { CORPUS } from './lib/corpus';

const STEPS = 6000;
const BATCH = 8;
const LR = 0.005;
const SEED = 1234;
const OUT = 'src/models/weights/char-model.json';
const CHECKS: [string, string][] = [
  ['twinkle, twinkle, ', 'little star'],
  ['mary had a little ', 'lamb'],
];

const vocab = [...new Set(CORPUS)].sort();
const cfg = { vocabSize: vocab.length, d: 48, ctx: 16, hidden: 64 };
const ids = Array.from(CORPUS, (c) => vocab.indexOf(c));
const rand = mulberry32(SEED);
const params = initParams(cfg, rand);
const all = paramsList(params);
const opt = new Adam(all, LR);

for (let step = 1; step <= STEPS; step++) {
  opt.zeroGrad();
  let total = 0;
  for (let b = 0; b < BATCH; b++) {
    const start = Math.floor(rand() * (ids.length - cfg.ctx));
    const loss = crossEntropy(forward(params, ids.slice(start, start + cfg.ctx)), ids.slice(start + 1, start + cfg.ctx + 1));
    backward(loss);
    total += loss.data[0];
  }
  all.forEach((p) => p.grad.forEach((_, i) => (p.grad[i] /= BATCH)));
  opt.step();
  if (step % 200 === 0) console.log(`step ${step}  loss ${(total / BATCH).toFixed(4)}`);
}

const weights = toWeights(params, vocab, cfg);
const rounded = paramsFromWeights(weights);
let failures = 0;
for (const [prompt, expected] of CHECKS) {
  const got = greedyTrain(rounded, vocab, cfg.ctx, prompt, expected.length);
  const ok = got === expected;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} "${prompt}" → "${got}" (want "${expected}")`);
}

mkdirSync('src/models/weights', { recursive: true });
writeFileSync(OUT, JSON.stringify(weights));
console.log(`wrote ${OUT}`);
if (failures > 0) {
  console.error('Some checks failed. Increase STEPS (e.g. 6000) and run again.');
  process.exit(1);
}
