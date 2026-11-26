import type { CodeListing, Complexity, SearchTrace } from '../../engine/types'
import { randomInt, shuffle } from '../shared'
import { binaryPseudocode, binaryPython, binarySearch } from './binary'
import { linearPseudocode, linearPython, linearSearch } from './linear'

export { binarySearch, linearSearch }

export type SearchAlgorithmId = 'linear' | 'binary'

export type SearchAlgorithm = {
  id: SearchAlgorithmId
  name: string
  trace: (values: number[], target: number) => SearchTrace
  code: CodeListing
  complexity: Complexity
  idea: string
}

export const SEARCH_ALGORITHMS: Record<SearchAlgorithmId, SearchAlgorithm> = {
  linear: {
    id: 'linear',
    name: 'Linear Search',
    trace: linearSearch,
    code: { pseudocode: linearPseudocode.text, python: linearPython.text },
    complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    idea: 'Check the items one by one',
  },
  binary: {
    id: 'binary',
    name: 'Binary Search',
    trace: binarySearch,
    code: { pseudocode: binaryPseudocode.text, python: binaryPython.text },
    complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    idea: 'Check the middle and rule out half of what is left',
  },
}

export const SEARCH_LISTINGS = {
  linear: { pseudocode: linearPseudocode, python: linearPython },
  binary: { pseudocode: binaryPseudocode, python: binaryPython },
} as const

/** Most comparisons binary search can need for n items: floor(log2 n) + 1. */
export function maxBinaryComparisons(n: number): number {
  return n <= 0 ? 0 : Math.floor(Math.log2(n)) + 1
}

/** A strictly increasing array of `size` distinct whole numbers in [min, max]. */
export function generateSortedUnique(size: number, min = 1, max = 99): number[] {
  const hi = Math.max(max, min + size - 1)
  const pool = Array.from({ length: hi - min + 1 }, (_, i) => min + i)
  return shuffle(pool)
    .slice(0, size)
    .sort((a, b) => a - b)
}

/** A target for practice: present (from the array) or missing (in range, not in the array). */
export function pickTarget(values: number[], present = Math.random() < 0.75): number {
  if (present || values.length === 0) return values[randomInt(0, values.length - 1)]
  const set = new Set(values)
  const lo = values[0] - 1
  const hi = values[values.length - 1] + 1
  for (let tries = 0; tries < 100; tries++) {
    const t = randomInt(lo, hi)
    if (!set.has(t)) return t
  }
  return hi
}

/** Returns a student-friendly error, or null when the values are sorted with no repeats. */
export function validateSortedUnique(values: number[]): string | null {
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      return `${values[i]} appears more than once. Use each number only once.`
    }
    if (values[i] < values[i - 1]) {
      return `The values must be sorted from smallest to largest: ${values[i - 1]} comes before ${values[i]}.`
    }
  }
  return null
}
