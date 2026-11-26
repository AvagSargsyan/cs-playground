import { randomInt, shuffle } from '../../../algorithms/shared'
import { SORT_ALGORITHMS } from '../../../algorithms/sorting'
import type { SortAlgorithmId } from '../../../engine/types'
import type { SortState, SortStep } from '../types'

/** Distinct values make every exercise unambiguous. */
export function distinctValues(n: number, min = 1, max = 30): number[] {
  return shuffle(Array.from({ length: max - min + 1 }, (_, i) => i + min)).slice(0, n)
}

const pick = <T>(items: readonly T[]): T => items[randomInt(0, items.length - 1)]

/* ------------------------------ 1. Predict the next step ------------------------------ */

export type PredictTask = {
  algorithm: 'bubble' | 'selection'
  state: SortState
  /** The pair of indices that will be swapped next, or null when no swap happens. */
  answer: [number, number] | null
  explanation: string
}

/**
 * Bubble: shown at a comparison, asks whether (and which) neighbours get swapped.
 * Selection: shown at the start of a pass, asks which two values the pass will swap.
 */
export function makePredictTask(
  algorithm: PredictTask['algorithm'] = pick(['bubble', 'selection'] as const),
): PredictTask {
  const values = distinctValues(6)
  const trace = SORT_ALGORITHMS[algorithm].trace(values, 'asc')
  if (algorithm === 'bubble') {
    const compares = trace.map((st, i) => ({ st, i })).filter(({ st }) => st.kind === 'compare')
    const { st, i } = pick(compares)
    const next = trace[i + 1]
    const pair = st.state.comparing!
    const [a, b] = [st.state.values[pair[0]], st.state.values[pair[1]]]
    return next.kind === 'swap'
      ? {
          algorithm,
          state: st.state,
          answer: [Math.min(...pair), Math.max(...pair)] as [number, number],
          explanation: `${a} > ${b}, so Bubble Sort swaps these two neighbours.`,
        }
      : {
          algorithm,
          state: st.state,
          answer: null,
          explanation: `${a} < ${b}: these neighbours are already in order, so there is no swap.`,
        }
  }
  // Selection: a pass starts with an "assume" (select-min) step that has no comparison yet.
  const starts = trace
    .map((st, i) => ({ st, i }))
    .filter(({ st, i }) => st.kind === 'select-min' && trace[i - 1]?.kind !== 'compare')
  const { st, i } = pick(starts)
  const end = trace.slice(i).find((x) => x.kind === 'swap' || x.kind === 'no-swap')!
  const first = st.state.activeRange![0]
  if (end.kind === 'no-swap') {
    return {
      algorithm,
      state: { ...st.state, candidate: undefined },
      answer: null,
      explanation: `${st.state.values[first]} is already the smallest value in the unsorted part, so this pass makes no swap.`,
    }
  }
  const [x, y] = end.state.swapping!
  const minValue = st.state.values[Math.max(x, y)]
  return {
    algorithm,
    state: { ...st.state, candidate: undefined },
    answer: [Math.min(x, y), Math.max(x, y)],
    explanation: `The smallest unsorted value is ${minValue}. Selection Sort swaps it with ${st.state.values[first]}, the first unsorted value.`,
  }
}

/* ------------------------------ 2. Manual sorting ------------------------------ */

export type ManualMode = 'bubble' | 'selection' | 'insertion'

/** One decision the student must make, checked against the real trace. */
export type ManualDecision =
  | { kind: 'swap-or-keep'; state: SortState; swap: boolean }
  | { kind: 'pick-min'; state: SortState; answer: number }
  | { kind: 'pick-slot'; state: SortState; answer: number }

export function makeManualTask(mode: ManualMode, values = distinctValues(5, 1, 20)) {
  const trace = SORT_ALGORITHMS[mode].trace(values, 'asc')
  const decisions: ManualDecision[] = []
  const nextWhere = (from: number, test: (st: SortStep) => boolean) =>
    trace.slice(from).find(test) ?? trace[trace.length - 1]

  trace.forEach((st, i) => {
    if (mode === 'bubble' && st.kind === 'compare') {
      decisions.push({ kind: 'swap-or-keep', state: st.state, swap: trace[i + 1].kind === 'swap' })
    }
    if (mode === 'selection' && st.kind === 'select-min' && trace[i - 1]?.kind !== 'compare') {
      const end = nextWhere(i, (x) => x.kind === 'swap' || x.kind === 'no-swap')
      const first = st.state.activeRange![0]
      const answer = end.kind === 'swap' ? Math.max(...end.state.swapping!) : first
      decisions.push({ kind: 'pick-min', state: { ...st.state, candidate: undefined }, answer })
    }
    if (mode === 'insertion' && st.state.key && st.kind === 'start') {
      const insert = nextWhere(i, (x) => x.kind === 'insert')
      const answer = insert.state.writing ?? st.state.key.from
      decisions.push({ kind: 'pick-slot', state: st.state, answer })
    }
  })
  return { values, decisions, final: trace[trace.length - 1].state }
}

/* ------------------------------ 3. Identify the algorithm ------------------------------ */

const ACTION_KINDS = new Set(['compare', 'swap', 'shift', 'insert', 'write', 'split', 'select-min'])

/** A short replay: the first few action steps of a random algorithm. */
export function makeIdentifyTask(
  algorithm: SortAlgorithmId = pick(['bubble', 'selection', 'insertion', 'merge'] as const),
) {
  const values = distinctValues(6, 1, 20)
  const trace = SORT_ALGORITHMS[algorithm].trace(values, 'asc')
  const frames = trace.filter((st) => ACTION_KINDS.has(st.kind)).slice(0, 8)
  return { algorithm, values, frames }
}

/** Generic labels for the replay, so the step names don't give the answer away. */
export function actionLabel(kind: string): string {
  if (kind === 'compare') return 'compare'
  if (kind === 'swap') return 'swap'
  if (kind === 'split') return 'split'
  if (kind === 'select-min') return 'remember'
  return 'move'
}

/* ------------------------------ 4. Choose the algorithm ------------------------------ */

export type Scenario = {
  id: string
  text: string
  answer: SortAlgorithmId
  reasonId: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'nearly-sorted',
    text: 'A teacher keeps a list of 2,000 exam results sorted by score. Three new results arrive and are added at the end. The list must be sorted again.',
    answer: 'insertion',
    reasonId: 'nearly-sorted',
  },
  {
    id: 'huge',
    text: 'A music app must sort 10 million songs by play count every night, and it must never become very slow, whatever the order of the data.',
    answer: 'merge',
    reasonId: 'guaranteed',
  },
  {
    id: 'few-writes',
    text: 'A small device stores 30 values on a memory chip that wears out each time a value is written. The values must be sorted with as few writes as possible.',
    answer: 'selection',
    reasonId: 'few-swaps',
  },
]

export const REASONS: { id: string; text: string }[] = [
  { id: 'nearly-sorted', text: 'It is very fast when the list is already almost in order.' },
  { id: 'guaranteed', text: 'It is O(n log n) even in the worst case.' },
  { id: 'few-swaps', text: 'It makes at most n − 1 swaps.' },
  { id: 'simple', text: 'It is the shortest code to write.' },
]

/* ------------------------------ 5. Count the comparisons ------------------------------ */

export function makeCountTask(
  algorithm: 'bubble' | 'insertion' = pick(['bubble', 'insertion'] as const),
) {
  const values = distinctValues(5, 1, 20)
  const trace = SORT_ALGORITHMS[algorithm].trace(values, 'asc')
  const comparisons = trace[trace.length - 1].stats.comparisons
  const log = trace.filter((st) => st.kind === 'compare').map((st) => st.message)
  return { algorithm, values, comparisons, log }
}
