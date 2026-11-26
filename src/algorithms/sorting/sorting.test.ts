import { describe, expect, it } from 'vitest'
import type { SortAlgorithmId, SortOrder, SortTrace } from '../../engine/types'
import { randomArray, randomInt } from '../shared'
import { SORT_ALGORITHM_IDS, SORT_ALGORITHMS, SORT_LISTINGS } from './index'

const final = (t: SortTrace) => t[t.length - 1]
const stats = (t: SortTrace) => final(t).stats
const run = (id: SortAlgorithmId, input: number[], order: SortOrder = 'asc') =>
  SORT_ALGORITHMS[id].trace(input, order)

const isSorted = (a: number[], order: SortOrder) =>
  a.every((v, i) => i === 0 || (order === 'asc' ? a[i - 1] <= v : a[i - 1] >= v))
const sameMultiset = (a: number[], b: number[]) =>
  JSON.stringify(a.slice().sort((x, y) => x - y)) ===
  JSON.stringify(b.slice().sort((x, y) => x - y))

describe.each(SORT_ALGORITHM_IDS)('%s sort', (id) => {
  it('sorts 200 random arrays in both orders, as a permutation of the input', () => {
    for (let r = 0; r < 200; r++) {
      const input = randomArray(randomInt(0, 20), 1, 30)
      for (const order of ['asc', 'desc'] as const) {
        const trace = run(id, input, order)
        const last = final(trace)
        expect(last.kind).toBe('done')
        expect(isSorted(last.state.values, order)).toBe(true)
        expect(sameMultiset(last.state.values, input)).toBe(true)
        expect(last.state.sorted.slice().sort((a, b) => a - b)).toEqual(input.map((_, i) => i))
        expect(last.stats.operations).toBe(last.stats.comparisons + last.stats.moves)
      }
    }
  })

  it('does not change the input array', () => {
    const input = [5, 2, 9, 1]
    run(id, input)
    expect(input).toEqual([5, 2, 9, 1])
  })

  it('never shares array references between steps', () => {
    const trace = run(id, [6, 3, 8, 1, 5, 2])
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i].state.values).not.toBe(trace[i - 1].state.values)
      expect(trace[i].state.sorted).not.toBe(trace[i - 1].state.sorted)
      const a = trace[i].state.merging?.aux
      const b = trace[i - 1].state.merging?.aux
      if (a && b) expect(a).not.toBe(b)
    }
  })

  it('uses line numbers inside both listings and has a message on every step', () => {
    const { pseudocode, python } = SORT_LISTINGS[id]
    for (const step of run(id, [4, 1, 3, 2, 5])) {
      expect(step.line).toBeGreaterThanOrEqual(0)
      expect(step.line).toBeLessThanOrEqual(pseudocode.lines)
      expect(step.pyLine).toBeGreaterThanOrEqual(0)
      expect(step.pyLine).toBeLessThanOrEqual(python.lines)
      expect(step.message.length).toBeGreaterThan(5)
    }
  })

  it('has cumulative, never-decreasing stats', () => {
    const trace = run(id, [9, 4, 7, 1, 8, 2])
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i].stats.comparisons).toBeGreaterThanOrEqual(trace[i - 1].stats.comparisons)
      expect(trace[i].stats.moves).toBeGreaterThanOrEqual(trace[i - 1].stats.moves)
    }
  })

  it('handles empty and single-element arrays', () => {
    expect(final(run(id, [])).kind).toBe('done')
    expect(final(run(id, [7])).state.values).toEqual([7])
    expect(final(run(id, [7])).state.sorted).toEqual([0])
  })
})

describe('exact counts on [3, 1, 2] (hand-verified)', () => {
  it('bubble: 3 comparisons, 2 swaps (second pass exits early)', () => {
    expect(stats(run('bubble', [3, 1, 2]))).toEqual({ comparisons: 3, moves: 2, operations: 5 })
  })
  it('selection: 3 comparisons, 2 swaps', () => {
    expect(stats(run('selection', [3, 1, 2]))).toEqual({ comparisons: 3, moves: 2, operations: 5 })
  })
  it('insertion: 3 comparisons, 4 writes (2 shifts + 2 inserts)', () => {
    expect(stats(run('insertion', [3, 1, 2]))).toEqual({ comparisons: 3, moves: 4, operations: 7 })
  })
  it('merge: 3 comparisons, 5 writes back', () => {
    expect(stats(run('merge', [3, 1, 2]))).toEqual({ comparisons: 3, moves: 5, operations: 8 })
  })
})

describe('best and worst cases', () => {
  const sorted = [1, 2, 3, 4, 5, 6, 7, 8]
  const reversed = sorted.slice().reverse()

  it('bubble exits early on sorted input: n-1 comparisons, 0 swaps', () => {
    const trace = run('bubble', sorted)
    expect(stats(trace)).toEqual({ comparisons: 7, moves: 0, operations: 7 })
    expect(trace.some((s) => s.kind === 'early-exit')).toBe(true)
  })

  it('bubble on reversed input: n(n-1)/2 comparisons and swaps', () => {
    expect(stats(run('bubble', reversed))).toEqual({ comparisons: 28, moves: 28, operations: 56 })
  })

  it('insertion on sorted input: n-1 comparisons, 0 writes', () => {
    expect(stats(run('insertion', sorted))).toEqual({ comparisons: 7, moves: 0, operations: 7 })
  })

  it('selection always makes n(n-1)/2 comparisons', () => {
    expect(stats(run('selection', sorted)).comparisons).toBe(28)
    expect(stats(run('selection', reversed)).comparisons).toBe(28)
    expect(stats(run('selection', sorted)).moves).toBe(0)
  })

  it('merge writes n·log2(n) values for n = 8', () => {
    expect(stats(run('merge', reversed)).moves).toBe(24)
  })

  it('descending order on already-descending input is a best case for bubble', () => {
    expect(stats(run('bubble', reversed, 'desc'))).toEqual({
      comparisons: 7,
      moves: 0,
      operations: 7,
    })
  })
})

describe('step semantics', () => {
  it('bubble marks the end of each pass as sorted', () => {
    const trace = run('bubble', [4, 3, 2, 1])
    const marks = trace.filter((s) => s.kind === 'mark-sorted').map((s) => s.state.sorted)
    expect(marks[0]).toEqual([3])
    expect(marks[1]).toEqual([3, 2])
  })

  it('selection marks the front as sorted', () => {
    const marks = run('selection', [4, 3, 2, 1])
      .filter((s) => s.kind === 'mark-sorted')
      .map((s) => s.state.sorted)
    expect(marks).toEqual([[0], [0, 1], [0, 1, 2]])
  })

  it('insertion keeps the sorted prefix in activeRange and sorts nothing before done', () => {
    const trace = run('insertion', [4, 3, 2, 1])
    expect(trace.slice(0, -1).every((s) => s.state.sorted.length === 0)).toBe(true)
    const keyStep = trace.find((s) => s.state.key?.from === 2)
    expect(keyStep?.state.activeRange).toEqual([0, 2])
  })

  it('merge sort splits, merges with an aux buffer and writes back', () => {
    const trace = run('merge', [5, 1, 4, 2])
    expect(trace.filter((s) => s.kind === 'split')).toHaveLength(3)
    const write = trace.find((s) => s.kind === 'write' && s.state.writing !== undefined)
    expect(write?.state.merging?.aux.every((v) => v !== null)).toBe(true)
  })

  it('messages read naturally', () => {
    const trace = run('bubble', [7, 3])
    const compare = trace.find((s) => s.kind === 'compare')
    expect(compare?.message).toBe('Compare 7 and 3. 7 > 3, so they are in the wrong order.')
    expect(trace.find((s) => s.kind === 'swap')?.message).toBe('Swap 7 and 3.')
  })
})
