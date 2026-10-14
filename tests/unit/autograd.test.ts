import { describe, expect, it } from 'vitest';
import {
  add, addRow, backward, causalSoftmax, crossEntropy, embed, matmul, matmulBT, relu, scale, Tensor, weightedSum,
} from '../../scripts/lib/autograd';
import { forward, initParams, paramsList } from '../../scripts/lib/charModelTrain';
import { mulberry32 } from '../../src/models/sampling';

const rand = mulberry32(99);
const randomTensor = (r: number, c: number) => Tensor.randn(r, c, rand, 1);

function numericGrad(f: () => number, t: Tensor, i: number, h = 1e-6): number {
  const old = t.data[i];
  t.data[i] = old + h;
  const up = f();
  t.data[i] = old - h;
  const down = f();
  t.data[i] = old;
  return (up - down) / (2 * h);
}

/** Compares backprop gradients with finite differences for a random weighted sum of the output. */
function checkGrad(build: () => Tensor, inputs: Tensor[]) {
  const probe = build();
  const w = Float64Array.from({ length: probe.data.length }, () => rand() - 0.5);
  const lossValue = () => build().data.reduce((s, v, i) => s + v * w[i], 0);
  inputs.forEach((t) => t.grad.fill(0));
  backward(weightedSum(build(), w));
  for (const t of inputs) {
    for (let i = 0; i < t.data.length; i++) {
      expect(t.grad[i]).toBeCloseTo(numericGrad(lossValue, t, i), 5);
    }
  }
}

describe('autograd ops', () => {
  it('matmul', () => {
    const a = randomTensor(2, 3);
    const b = randomTensor(3, 2);
    checkGrad(() => matmul(a, b), [a, b]);
  });
  it('matmulBT', () => {
    const a = randomTensor(2, 3);
    const b = randomTensor(4, 3);
    checkGrad(() => matmulBT(a, b), [a, b]);
  });
  it('add and addRow', () => {
    const a = randomTensor(2, 3);
    const b = randomTensor(2, 3);
    const bias = randomTensor(1, 3);
    checkGrad(() => addRow(add(a, b), bias), [a, b, bias]);
  });
  it('relu and scale', () => {
    const a = randomTensor(3, 3);
    checkGrad(() => scale(relu(a), 0.7), [a]);
  });
  it('causalSoftmax', () => {
    const a = randomTensor(3, 3);
    checkGrad(() => causalSoftmax(a), [a]);
  });
  it('causalSoftmax masks the future', () => {
    const out = causalSoftmax(randomTensor(3, 3));
    expect(out.data[1]).toBe(0);
    expect(out.data[2]).toBe(0);
    expect(out.data[5]).toBe(0);
    expect(out.data[0]).toBeCloseTo(1, 12);
  });
  it('embed', () => {
    const table = randomTensor(5, 2);
    checkGrad(() => embed(table, [1, 3, 1]), [table]);
  });
  it('crossEntropy', () => {
    const logits = randomTensor(3, 4);
    checkGrad(() => crossEntropy(logits, [0, 2, 3]), [logits]);
  });
  it('the whole character model', () => {
    const p = initParams({ vocabSize: 5, d: 4, ctx: 3, hidden: 6 }, mulberry32(5));
    checkGrad(() => crossEntropy(forward(p, [1, 4, 2]), [4, 2, 0]), paramsList(p));
  });
});
