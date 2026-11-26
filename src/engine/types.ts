/**
 * Every algorithm in the app is a pure function that returns a full trace: the list of every
 * step it takes, with a complete snapshot for each one. Visualizers never run the algorithm
 * themselves; they only move an index through the trace. That gives step back, scrubbing and
 * consistent stats for free, and lets exercises ask "what happens at step k + 1?".
 */
export type Step<S, K extends string = string> = {
  /** Full snapshot needed to render this step. */
  state: S
  /** 1-based line in the pseudocode listing to highlight (0 = none). */
  line: number
  /** 1-based line in the Python listing to highlight (0 = none). */
  pyLine: number
  /** One plain-language sentence explaining the step. */
  message: string
  /** What kind of step this is; exercises use it to ask "what happens next?". */
  kind: K
  /** Cumulative counters up to and including this step. */
  stats: Record<string, number>
}

export type Trace<S, K extends string = string> = Step<S, K>[]

export type SortOrder = 'asc' | 'desc'

/* ---------------------------------- Sorting ---------------------------------- */

export type SortAlgorithmId = 'bubble' | 'selection' | 'insertion' | 'merge'

export type SortStepKind =
  | 'start'
  | 'compare'
  | 'swap'
  | 'no-swap'
  | 'select-min' // selection sort: new minimum found
  | 'shift' // insertion sort: element moves one place right
  | 'insert' // insertion sort: key written into its place
  | 'split' // merge sort: range divided
  | 'write' // merge sort: value written back from the merge
  | 'mark-sorted'
  | 'early-exit' // bubble sort: a pass with no swaps
  | 'done'

export type SortState = {
  values: number[]
  /** Indices being compared in this step. */
  comparing?: [number, number]
  /** Indices being swapped in this step. */
  swapping?: [number, number]
  /** Index written in this step (insertion shift/insert, merge write-back). */
  writing?: number
  /** Indices already in their final position. */
  sorted: number[]
  /** Section of the array the algorithm is currently working on (inclusive). */
  activeRange?: [number, number]
  /** Selection sort: index of the current minimum (or maximum in desc order). */
  candidate?: number
  /** Insertion sort: the value currently held out of the array, and its original index. */
  key?: { value: number; from: number }
  /** Merge sort: the two halves being merged (inclusive ranges) and the auxiliary buffer. */
  merging?: {
    left: [number, number]
    right: [number, number]
    aux: (number | null)[]
    /** Index into aux being filled next. */
    auxPointer?: number
  }
}

/** Stats keys used by sorting traces: comparisons, swaps (bubble/selection), writes (insertion/merge), operations. */
export type SortTrace = Trace<SortState, SortStepKind>

/* --------------------------------- Searching --------------------------------- */

export type SearchStepKind =
  'start' | 'compute-mid' | 'compare' | 'go-left' | 'go-right' | 'found' | 'not-found' | 'check' // linear search: checking one element

export type SearchState = {
  values: number[]
  target: number
  /** Binary search bounds (inclusive). Undefined for linear search. */
  left?: number
  right?: number
  mid?: number
  /** Linear search: current index being checked. */
  current?: number
  /** Indices ruled out so far. */
  eliminated: number[]
  /** Index where the target was found, or -1 once the search has failed. */
  foundIndex?: number
}

/** Stats keys: comparisons, remaining (size of the current search range). */
export type SearchTrace = Trace<SearchState, SearchStepKind>

/* --------------------------------- Recursion --------------------------------- */

export type RecursionExampleId = 'countdown' | 'factorial'

export type RecursionStepKind = 'call' | 'base-case' | 'print' | 'wait' | 'return' | 'done'

export type FrameStatus = 'calling' | 'waiting' | 'returning' | 'base-case'

export type Frame = {
  id: number
  fn: RecursionExampleId
  arg: number
  status: FrameStatus
  /** Factorial: the pending expression, e.g. "4 × ?" or "4 × 6". */
  pending?: string
  /** Value returned by this frame (once known). */
  returnValue?: number
}

export type RecursionState = {
  /** Bottom of the stack first. */
  stack: Frame[]
  /** Countdown: lines printed so far. */
  output: string[]
  /** Id of the frame that is active in this step. */
  activeId?: number
  /** Last value returned (factorial). */
  lastReturn?: number
}

/** Stats keys: calls, depth, maxDepth. */
export type RecursionTrace = Trace<RecursionState, RecursionStepKind>

/* ---------------------------- Code listings & meta ---------------------------- */

export type CodeListing = {
  pseudocode: string
  python: string
}

export type Complexity = {
  best: string
  average: string
  worst: string
  space: string
  stable?: boolean
}
