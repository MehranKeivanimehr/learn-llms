import { runPipeline, transformerBlock, type BlockPiece } from '../models/block';
import { PARAMS, X } from '../models/data/block7Data';
import type { Mat } from '../models/linalg';
import type { BlockPieceInfo } from '../viz/BlockDiagram';
import type { PuzzleDef } from './types';

export type PieceId = 'attention' | 'mlp' | 'norm1' | 'norm2';

/** Shown in the tray in this (shuffled) order. */
export const PIECES: BlockPieceInfo[] = [
  { id: 'mlp', label: 'MLP' },
  { id: 'norm1', label: 'Add & Norm' },
  { id: 'attention', label: 'Self-attention' },
  { id: 'norm2', label: 'Add & Norm' },
];

const KIND: Record<PieceId, BlockPiece> = { attention: 'attention', mlp: 'mlp', norm1: 'addnorm', norm2: 'addnorm' };
const SLOT_COUNT = 4;

export const GOAL: Mat = transformerBlock(X, PARAMS);

export interface Inside7State {
  slots: (PieceId | null)[];
}

export type Inside7Action = { type: 'place'; piece: PieceId; slot: number } | { type: 'clear'; slot: number };

export function blockOutput(slots: (PieceId | null)[]): Mat | null {
  if (slots.some((s) => s === null)) return null;
  return runPipeline(X, slots.map((s) => KIND[s as PieceId]), PARAMS);
}

function matClose(a: Mat, b: Mat, tol = 1e-9): boolean {
  return a.every((row, i) => row.every((v, j) => Math.abs(v - b[i][j]) <= tol));
}

const validSlot = (slot: number) => Number.isInteger(slot) && slot >= 0 && slot < SLOT_COUNT;

export const inside7: PuzzleDef<Inside7State, Inside7Action> = {
  id: 'inside-7',
  instructions: 'Put the four pieces in the right order so the block produces the goal output.',
  goalText: 'Self-attention → Add & Norm → MLP → Add & Norm',
  start: () => ({ slots: [null, null, null, null] }),
  apply(state, action) {
    if (!validSlot(action.slot)) return state;
    if (action.type === 'clear') {
      if (state.slots[action.slot] === null) return state;
      return { slots: state.slots.map((s, i) => (i === action.slot ? null : s)) };
    }
    if (!(action.piece in KIND) || state.slots[action.slot] === action.piece) return state;
    const slots = state.slots.map((s) => (s === action.piece ? null : s));
    slots[action.slot] = action.piece;
    return { slots };
  },
  conditions: (s) => {
    const out = blockOutput(s.slots);
    return [
      { label: 'All 4 steps are filled', met: out !== null },
      { label: "The block's output matches the goal", met: out !== null && matClose(out, GOAL) },
    ];
  },
  par: 4,
  hints: [
    'Information flows top to bottom. Each sub-layer is followed by its own "Add & Norm".',
    'Words first gather information from each other, then each word is processed on its own.',
    'Self-attention, Add & Norm, MLP, Add & Norm.',
  ],
  solution: [
    { type: 'place', piece: 'attention', slot: 0 },
    { type: 'place', piece: 'norm1', slot: 1 },
    { type: 'place', piece: 'mlp', slot: 2 },
    { type: 'place', piece: 'norm2', slot: 3 },
  ],
};
