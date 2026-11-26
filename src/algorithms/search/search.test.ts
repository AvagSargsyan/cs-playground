import { describe, expect, it } from 'vitest'
import { randomInt } from '../shared'
import {
  binarySearch,
  generateSortedUnique,
  linearSearch,
  maxBinaryComparisons,
  pickTarget,
  SEARCH_LISTINGS,
  validateSortedUnique,
} from './index'

const last = <T>(a: T[]) => a[a.length - 1]

describe('binary search', () => {
  it('finds every element with at most floor(log2 n) + 1 comparisons', () => {
    for (let r = 0; r < 200; r++) {
      const values = generateSortedUnique(randomInt(1, 31))
      values.forEach((v, i) => {
        const trace = binarySearch(values, v)
        const end = last(trace)
        expect(end.kind).toBe('found')
        expect(end.state.foundIndex).toBe(i)
        expect(end.stats.comparisons).toBeLessThanOrEqual(maxBinaryComparisons(values.length))
      })
    }
  })

  it('reports missing targets with foundIndex -1 and an empty range', () => {
    const values = [3, 8, 15, 21, 30, 42, 57]
    for (const t of [1, 10, 25, 60]) {
      const end = last(binarySearch(values, t))
      expect(end.kind).toBe('not-found')
      expect(end.state.foundIndex).toBe(-1)
      expect(end.stats.remaining).toBe(0)
      expect(end.state.eliminated).toEqual([0, 1, 2, 3, 4, 5, 6])
      expect(end.state.left! > end.state.right!).toBe(true)
    }
  })

  it('uses mid = floor((left + right) / 2) and inclusive bounds', () => {
    const values = [2, 4, 6, 8, 10, 12, 14, 16] // even length
    const trace = binarySearch(values, 14)
    const mids = trace.filter((s) => s.kind === 'compute-mid').map((s) => s.state.mid)
    expect(mids).toEqual([3, 5, 6]) // (0+7)/2=3 → L=4; (4+7)/2=5 → L=6; (6+7)/2=6 → found
    const first = trace[0]
    expect([first.state.left, first.state.right]).toEqual([0, 7])
  })

  it('tracks remaining range size and accumulates eliminated indices', () => {
    const trace = binarySearch([1, 3, 5, 7, 9, 11, 13], 11)
    expect(trace[0].stats.remaining).toBe(7)
    const right = trace.find((s) => s.kind === 'go-right')!
    expect(right.state.left).toBe(4)
    expect(right.stats.remaining).toBe(3)
    expect(right.state.eliminated).toEqual([0, 1, 2, 3])
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i].state.eliminated.length).toBeGreaterThanOrEqual(
        trace[i - 1].state.eliminated.length,
      )
      expect(trace[i].state.eliminated).not.toBe(trace[i - 1].state.eliminated)
    }
  })

  it('handles an empty array', () => {
    const end = last(binarySearch([], 5))
    expect(end.kind).toBe('not-found')
    expect(end.stats.comparisons).toBe(0)
  })
})

describe('linear search', () => {
  it('finds index i after i + 1 comparisons', () => {
    const values = [9, 4, 7, 1, 8]
    values.forEach((v, i) => {
      const end = last(linearSearch(values, v))
      expect(end.kind).toBe('found')
      expect(end.state.foundIndex).toBe(i)
      expect(end.stats.comparisons).toBe(i + 1)
    })
  })

  it('needs n comparisons when the target is missing', () => {
    const end = last(linearSearch([9, 4, 7], 5))
    expect(end.kind).toBe('not-found')
    expect(end.stats.comparisons).toBe(3)
    expect(end.state.foundIndex).toBe(-1)
  })
})

describe('listings', () => {
  it('every step line is inside its listing', () => {
    const traces = {
      binary: [binarySearch([1, 4, 9, 16, 25], 16), binarySearch([1, 4, 9], 5)],
      linear: [linearSearch([1, 4, 9], 9), linearSearch([1, 4, 9], 5)],
    }
    for (const id of ['binary', 'linear'] as const) {
      for (const trace of traces[id]) {
        for (const s of trace) {
          expect(s.line).toBeGreaterThan(0)
          expect(s.line).toBeLessThanOrEqual(SEARCH_LISTINGS[id].pseudocode.lines)
          expect(s.pyLine).toBeGreaterThan(0)
          expect(s.pyLine).toBeLessThanOrEqual(SEARCH_LISTINGS[id].python.lines)
        }
      }
    }
  })
})

describe('helpers', () => {
  it('generateSortedUnique gives strictly increasing values in range', () => {
    for (let r = 0; r < 100; r++) {
      const size = randomInt(1, 31)
      const v = generateSortedUnique(size, 1, 99)
      expect(v).toHaveLength(size)
      expect(validateSortedUnique(v)).toBeNull()
      expect(v[0]).toBeGreaterThanOrEqual(1)
      expect(v[v.length - 1]).toBeLessThanOrEqual(99)
    }
  })

  it('validateSortedUnique explains problems', () => {
    expect(validateSortedUnique([1, 2, 2])).toMatch(/more than once/)
    expect(validateSortedUnique([1, 5, 3])).toMatch(/sorted/)
    expect(validateSortedUnique([1, 5, 9])).toBeNull()
  })

  it('pickTarget returns a missing value when asked', () => {
    const values = [2, 4, 6, 8]
    for (let r = 0; r < 50; r++) expect(values).not.toContain(pickTarget(values, false))
    for (let r = 0; r < 50; r++) expect(values).toContain(pickTarget(values, true))
  })

  it('maxBinaryComparisons matches the complexity exercise', () => {
    expect([10, 100, 1000, 1_000_000].map(maxBinaryComparisons)).toEqual([4, 7, 10, 20])
  })
})
