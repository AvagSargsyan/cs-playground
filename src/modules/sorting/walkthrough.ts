import { SORT_ALGORITHMS } from '../../algorithms/sorting'
import type { SortAlgorithmId, SortState, SortStep } from './types'

/** Example arrays for the illustrated walkthroughs: small enough to read, big enough to be interesting. */
export const WALKTHROUGH_INPUT: Record<SortAlgorithmId, number[]> = {
  bubble: [5, 1, 4, 2],
  selection: [4, 6, 2, 5],
  insertion: [5, 2, 4, 1],
  merge: [6, 3, 8, 1],
}

/** Which steps of a trace are worth a frame in the walkthrough. */
function isKeyStep(id: SortAlgorithmId, step: SortStep): boolean {
  switch (id) {
    case 'bubble':
      return step.kind === 'swap' || step.kind === 'early-exit'
    case 'selection':
      return step.kind === 'swap' || step.kind === 'no-swap'
    case 'insertion':
      return step.kind === 'insert'
    case 'merge':
      return (
        step.kind === 'split' ||
        (step.kind === 'write' &&
          step.state.writing !== undefined &&
          step.state.writing === step.state.activeRange?.[1])
      )
  }
}

export type Frame = { state: SortState; note: string }

/** A finished merge is easier to read as its result than as its last single write. */
function noteFor(id: SortAlgorithmId, step: SortStep): string {
  const range = step.state.activeRange
  if (id === 'merge' && step.kind === 'write' && range) {
    return `Merged into [${step.state.values.slice(range[0], range[1] + 1).join(', ')}].`
  }
  return step.message
}

/** Real states from the real trace, so the illustration can never disagree with the algorithm. */
export function walkthroughFrames(id: SortAlgorithmId): Frame[] {
  const trace = SORT_ALGORITHMS[id].trace(WALKTHROUGH_INPUT[id], 'asc')
  const start: Frame = { state: trace[0].state, note: 'Start.' }
  const middle = trace
    .filter((st) => isKeyStep(id, st))
    .map((st) => ({ state: st.state, note: noteFor(id, st) }))
  const last = trace[trace.length - 1]
  // Bubble Sort's early exit already shows the sorted list, so a "Sorted!" frame would repeat it.
  const endsSorted = middle.at(-1)?.state.sorted.length === last.state.values.length
  return endsSorted
    ? [start, ...middle]
    : [start, ...middle, { state: last.state, note: 'Sorted!' }]
}
