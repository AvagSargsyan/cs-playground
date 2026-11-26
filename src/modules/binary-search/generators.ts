/**
 * Pure generators for the Binary Search practice exercises and comparisons. Every function takes
 * an optional random source so tests can make them deterministic.
 */

export type Rand = () => number

const rint = (rand: Rand, min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

/** Strictly increasing values with no repeats, spread out a bit so they are easy to read. */
export function sortedValues(size: number, rand: Rand = Math.random): number[] {
  const out: number[] = []
  let v = rint(rand, 1, 6)
  for (let i = 0; i < size; i++) {
    out.push(v)
    v += rint(rand, 1, 8)
  }
  return out
}

export const midOf = (left: number, right: number) => Math.floor((left + right) / 2)

/* ------------------------------ Midpoint ------------------------------ */

export type MidpointTask = { values: number[]; left: number; right: number; mid: number }

/**
 * A range to find the middle of. `evenLength` forces a range with an even number of items,
 * where there are two "middles" and the floor rule picks the left one.
 */
export function makeMidpointTask(
  rand: Rand = Math.random,
  evenLength = rand() < 0.6,
): MidpointTask {
  const values = sortedValues(rint(rand, 9, 12), rand)
  const n = values.length
  for (;;) {
    const left = rint(rand, 0, n - 3)
    const right = rint(rand, left + 2, n - 1)
    const len = right - left + 1
    if ((len % 2 === 0) === evenLength) return { values, left, right, mid: midOf(left, right) }
  }
}

/* ------------------------------ Direction ------------------------------ */

export type Direction = 'left' | 'right' | 'found'

export type DirectionTask = {
  values: number[]
  target: number
  left: number
  right: number
  mid: number
  answer: Direction
}

/** One moment in a real binary search, just after the middle value has been read. */
export function makeDirectionTask(rand: Rand = Math.random): DirectionTask {
  const values = sortedValues(rint(rand, 9, 13), rand)
  const wanted: Direction = (['left', 'right', 'found'] as const)[rint(rand, 0, 2)]
  // Walk a real search for a random target and stop at the first round with the wanted outcome.
  for (let tries = 0; tries < 200; tries++) {
    const target =
      rand() < 0.8 ? values[rint(rand, 0, values.length - 1)] : values[0] + rint(rand, 1, 60)
    let left = 0
    let right = values.length - 1
    while (left <= right) {
      const mid = midOf(left, right)
      const answer: Direction =
        values[mid] === target ? 'found' : values[mid] < target ? 'right' : 'left'
      // Skip the very first round now and then so the range is not always the whole array.
      if (answer === wanted && (left > 0 || right < values.length - 1 || rand() < 0.5)) {
        return { values, target, left, right, mid, answer }
      }
      if (answer === 'found') break
      if (answer === 'right') left = mid + 1
      else right = mid - 1
    }
  }
  const mid = midOf(0, values.length - 1)
  return { values, target: values[mid], left: 0, right: values.length - 1, mid, answer: 'found' }
}

/* ------------------------------ Find the mistake ------------------------------ */

export type MistakeKind = 'wrong-mid' | 'wrong-direction' | 'off-by-one' | 'unsorted'

export type TraceRow = {
  text: string
  /** Numbers behind the row, so tests can check it. Undefined for the start row. */
  round?: {
    left: number
    right: number
    mid: number
    value: number
    nextLeft: number
    nextRight: number
  }
}

export type MistakeTask = {
  values: number[]
  target: number
  rows: TraceRow[]
  wrongRow: number
  kind: MistakeKind
  /** Why that row is wrong, in one or two sentences. */
  why: string
}

function describeRound(
  left: number,
  right: number,
  mid: number,
  value: number,
  target: number,
  nextLeft: number,
  nextRight: number,
): string {
  const head = `LEFT = ${left}, RIGHT = ${right}. MID = (${left} + ${right}) div 2 = ${mid}, A[${mid}] = ${value}.`
  if (value === target) return `${head} ${value} = ${target}, found it!`
  const cmp = value < target ? `${value} < ${target}` : `${value} > ${target}`
  if (nextLeft !== left) return `${head} ${cmp}, so LEFT = ${nextLeft}.`
  return `${head} ${cmp}, so RIGHT = ${nextRight}.`
}

/**
 * A binary search trace with exactly one wrong row. Rows before the mistake are correct; the trace
 * stops one round after the mistake (or when the search ends) so it never runs forever.
 */
export function makeMistakeTask(rand: Rand = Math.random, forced?: MistakeKind): MistakeTask {
  const kinds: MistakeKind[] = ['wrong-mid', 'wrong-direction', 'off-by-one', 'unsorted']
  const kind = forced ?? kinds[rint(rand, 0, kinds.length - 1)]

  for (;;) {
    let values = sortedValues(rint(rand, 10, 14), rand)
    const n = values.length
    // Targets deep in the array give at least 3 rounds, so the mistake is not always first.
    const targetIndex = rand() < 0.5 ? rint(rand, 0, 1) : rint(rand, n - 2, n - 1)
    const target = values[targetIndex]

    if (kind === 'unsorted') {
      // Shuffle a few items so the list is clearly not sorted; the start row is then the mistake.
      values = values.slice()
      for (let k = 0; k < 3; k++) {
        const i = rint(rand, 0, n - 1)
        const j = rint(rand, 0, n - 1)
        ;[values[i], values[j]] = [values[j], values[i]]
      }
      if (values.every((v, i) => i === 0 || values[i - 1] < v)) continue
    }

    const rows: TraceRow[] = [
      {
        text: `Start: search for ${target} in [${values.join(', ')}]. LEFT = 0, RIGHT = ${n - 1}.`,
      },
    ]
    // The unsorted list is wrong from the start; for the others pick which round goes wrong.
    const mistakeRound = kind === 'unsorted' ? -1 : rint(rand, 1, 2)
    let left = 0
    let right = n - 1
    let wrongRow = kind === 'unsorted' ? 0 : -1
    let round = 0

    while (left <= right && rows.length < 7) {
      round++
      let mid = midOf(left, right)
      const isMistake = round === mistakeRound
      if (isMistake && kind === 'wrong-mid') {
        if (mid + 1 > right) break // no room to get it wrong here; try a new task
        mid = mid + 1
      }
      const value = values[mid]
      let nextLeft = left
      let nextRight = right
      if (value !== target) {
        let goRight = value < target
        if (isMistake && kind === 'wrong-direction') goRight = !goRight
        if (goRight) nextLeft = isMistake && kind === 'off-by-one' ? mid : mid + 1
        else nextRight = isMistake && kind === 'off-by-one' ? mid : mid - 1
      } else if (isMistake) {
        break // found before the planned mistake; try a new task
      }
      rows.push({
        text: describeRound(left, right, mid, value, target, nextLeft, nextRight),
        round: { left, right, mid, value, nextLeft, nextRight },
      })
      if (isMistake) wrongRow = rows.length - 1
      if (value === target) break
      left = nextLeft
      right = nextRight
      // Show a few rounds after an unsorted start (so it is not obvious), one after other mistakes.
      const roundsAfter = kind === 'unsorted' ? 3 : 1
      if (wrongRow >= 0 && rows.length - 1 >= wrongRow + roundsAfter) break
    }
    if (wrongRow < 0) continue
    if (kind !== 'unsorted' && wrongRow === rows.length - 1 && rows.length < 3) continue

    const r = rows[wrongRow].round
    const why =
      kind === 'unsorted'
        ? 'The list is not sorted, so Binary Search cannot be used at all: ruling out half of the list only works when everything to the left is smaller and everything to the right is larger.'
        : kind === 'wrong-mid'
          ? `MID should be (${r!.left} + ${r!.right}) div 2 = ${midOf(r!.left, r!.right)}, not ${r!.mid}.${(r!.left + r!.right) % 2 === 1 ? ' "div" rounds down.' : ''}`
          : kind === 'wrong-direction'
            ? `${r!.value} ${r!.value < target ? '<' : '>'} ${target}, so the target can only be to the ${r!.value < target ? 'right' : 'left'}. The search went the wrong way.`
            : `The middle item was already checked, so it must be ruled out too: the new bound should be ${r!.value < target ? `LEFT = MID + 1 = ${r!.mid + 1}` : `RIGHT = MID - 1 = ${r!.mid - 1}`}.`
    return { values, target, rows, wrongRow, kind, why }
  }
}

/* ------------------------------ Big arrays ------------------------------ */

/**
 * Comparisons each search needs to find the item at `index` in a sorted array of size n,
 * without building the array (n can be a million).
 */
export function comparisonsFor(n: number, index: number): { linear: number; binary: number } {
  let left = 0
  let right = n - 1
  let binary = 0
  while (left <= right) {
    const mid = midOf(left, right)
    binary++
    if (mid === index) break
    if (mid < index) left = mid + 1
    else right = mid - 1
  }
  return { linear: index + 1, binary }
}

export const COMPLEXITY_PAIRS = [
  { size: 10, label: '10 items', max: 4 },
  { size: 100, label: '100 items', max: 7 },
  { size: 1000, label: '1,000 items', max: 10 },
  { size: 1_000_000, label: '1,000,000 items', max: 20 },
] as const
