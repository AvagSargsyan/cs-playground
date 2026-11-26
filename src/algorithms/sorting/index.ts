import type {
  CodeListing,
  Complexity,
  SortAlgorithmId,
  SortOrder,
  SortTrace,
} from '../../engine/types'
import { bubblePseudocode, bubblePython, bubbleSort } from './bubble'
import { insertionPseudocode, insertionPython, insertionSort } from './insertion'
import { mergePseudocode, mergePython, mergeSort } from './merge'
import { selectionPseudocode, selectionPython, selectionSort } from './selection'

export { bubbleSort, insertionSort, mergeSort, selectionSort }

export type SortAlgorithm = {
  id: SortAlgorithmId
  name: string
  trace: (input: number[], order: SortOrder) => SortTrace
  code: CodeListing
  complexity: Complexity
  /** Label for the `moves` stat: swaps for exchange sorts, writes for insertion/merge. */
  statLabels: { moves: 'Swaps' | 'Writes' }
  /** Main idea in a few words. */
  idea: string
}

export const SORT_ALGORITHMS: Record<SortAlgorithmId, SortAlgorithm> = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    trace: bubbleSort,
    code: { pseudocode: bubblePseudocode.text, python: bubblePython.text },
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
    statLabels: { moves: 'Swaps' },
    idea: 'Repeated comparisons and swapping of neighbours',
  },
  selection: {
    id: 'selection',
    name: 'Selection Sort',
    trace: selectionSort,
    code: { pseudocode: selectionPseudocode.text, python: selectionPython.text },
    complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false },
    statLabels: { moves: 'Swaps' },
    idea: 'Find the smallest remaining value and put it next',
  },
  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    trace: insertionSort,
    code: { pseudocode: insertionPseudocode.text, python: insertionPython.text },
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
    statLabels: { moves: 'Writes' },
    idea: 'Build a sorted section one element at a time',
  },
  merge: {
    id: 'merge',
    name: 'Merge Sort',
    trace: mergeSort,
    code: { pseudocode: mergePseudocode.text, python: mergePython.text },
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
      stable: true,
    },
    statLabels: { moves: 'Writes' },
    idea: 'Divide and conquer: split, sort the halves, merge',
  },
}

export const SORT_ALGORITHM_IDS: SortAlgorithmId[] = ['bubble', 'selection', 'insertion', 'merge']

/** Listings with line counts, for tests and code panels. */
export const SORT_LISTINGS = {
  bubble: { pseudocode: bubblePseudocode, python: bubblePython },
  selection: { pseudocode: selectionPseudocode, python: selectionPython },
  insertion: { pseudocode: insertionPseudocode, python: insertionPython },
  merge: { pseudocode: mergePseudocode, python: mergePython },
} as const
