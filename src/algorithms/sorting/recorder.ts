import type { SortOrder, SortState, SortStepKind, SortTrace } from '../../engine/types'
import type { Listing } from '../shared'

export function cloneSortState(s: SortState): SortState {
  return {
    values: s.values.slice(),
    sorted: s.sorted.slice(),
    ...(s.comparing && { comparing: [s.comparing[0], s.comparing[1]] as [number, number] }),
    ...(s.swapping && { swapping: [s.swapping[0], s.swapping[1]] as [number, number] }),
    ...(s.writing !== undefined && { writing: s.writing }),
    ...(s.activeRange && { activeRange: [s.activeRange[0], s.activeRange[1]] as [number, number] }),
    ...(s.candidate !== undefined && { candidate: s.candidate }),
    ...(s.key && { key: { ...s.key } }),
    ...(s.merging && {
      merging: {
        left: [s.merging.left[0], s.merging.left[1]] as [number, number],
        right: [s.merging.right[0], s.merging.right[1]] as [number, number],
        aux: s.merging.aux.slice(),
        ...(s.merging.auxPointer !== undefined && { auxPointer: s.merging.auxPointer }),
      },
    }),
  }
}

/** Collects sorting steps with cumulative stats and copies every snapshot. */
export class SortRecorder<K extends string> {
  readonly steps: SortTrace = []
  comparisons = 0
  moves = 0
  private readonly pseudo: Listing<K>
  private readonly python: Listing<K>

  constructor(pseudo: Listing<K>, python: Listing<K>) {
    this.pseudo = pseudo
    this.python = python
  }

  push(kind: SortStepKind, state: SortState, line: K | null, message: string): void {
    this.steps.push({
      state: cloneSortState(state),
      line: line ? this.pseudo.at[line] : 0,
      pyLine: line ? this.python.at[line] : 0,
      message,
      kind,
      stats: {
        comparisons: this.comparisons,
        moves: this.moves,
        operations: this.comparisons + this.moves,
      },
    })
  }
}

/** True when `a` must come after `b` in the requested order. */
export function outOfOrder(a: number, b: number, order: SortOrder): boolean {
  return order === 'asc' ? a > b : a < b
}

export const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
