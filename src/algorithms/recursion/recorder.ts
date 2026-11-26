import type { Frame, RecursionState, RecursionStepKind, RecursionTrace } from '../../engine/types'
import type { Listing } from '../shared'

/** Smallest and largest input the recursion playground accepts (keeps the stack readable). */
export const MIN_RECURSION_INPUT = 0
export const MAX_RECURSION_INPUT = 6

export function checkRecursionInput(n: number): void {
  if (!Number.isInteger(n) || n < MIN_RECURSION_INPUT || n > MAX_RECURSION_INPUT) {
    throw new RangeError(
      `Input must be a whole number from ${MIN_RECURSION_INPUT} to ${MAX_RECURSION_INPUT}.`,
    )
  }
}

export function cloneRecursionState(s: RecursionState): RecursionState {
  return {
    ...s,
    stack: s.stack.map((f) => ({ ...f })),
    output: s.output.slice(),
  }
}

/** Keeps the live stack and output, and records snapshots with stats. */
export class RecursionRecorder<K extends string> {
  readonly steps: RecursionTrace = []
  readonly stack: Frame[] = []
  readonly output: string[] = []
  calls = 0
  maxDepth = 0
  lastReturn: number | undefined
  private nextId = 1
  private readonly pseudo: Listing<K>
  private readonly python: Listing<K>

  constructor(pseudo: Listing<K>, python: Listing<K>) {
    this.pseudo = pseudo
    this.python = python
  }

  newFrame(fn: Frame['fn'], arg: number): Frame {
    const frame: Frame = { id: this.nextId++, fn, arg, status: 'calling' }
    this.stack.push(frame)
    this.calls++
    this.maxDepth = Math.max(this.maxDepth, this.stack.length)
    return frame
  }

  push(kind: RecursionStepKind, line: K | null, message: string, activeId?: number): void {
    const state: RecursionState = {
      stack: this.stack,
      output: this.output,
      ...(activeId !== undefined && { activeId }),
      ...(this.lastReturn !== undefined && { lastReturn: this.lastReturn }),
    }
    this.steps.push({
      state: cloneRecursionState(state),
      line: line ? this.pseudo.at[line] : 0,
      pyLine: line ? this.python.at[line] : 0,
      message,
      kind,
      stats: { calls: this.calls, depth: this.stack.length, maxDepth: this.maxDepth },
    })
  }
}
