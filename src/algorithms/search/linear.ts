import type { SearchTrace } from '../../engine/types'
import { defineListing } from '../shared'
import { SearchRecorder } from './binary'

const KEYS = ['start', 'loop', 'compare', 'found', 'notFound'] as const
type Key = (typeof KEYS)[number]

export const linearPseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure LINEAR_SEARCH(A, TARGET)'],
  ['loop', '  loop I from 0 to length of A - 1'],
  ['compare', '    if A[I] == TARGET then'],
  ['found', '      return I'],
  '    end if',
  '  end loop',
  ['notFound', '  return -1   // not found'],
  'end procedure',
])

export const linearPython = defineListing<Key>(KEYS, [
  ['start', 'def linear_search(a, target):'],
  ['loop', '    for i in range(len(a)):'],
  ['compare', '        if a[i] == target:'],
  ['found', '            return i'],
  ['notFound', '    return -1  # not found'],
])

export function linearSearch(values: number[], target: number): SearchTrace {
  const rec = new SearchRecorder<Key>(linearPseudocode, linearPython)
  const eliminated: number[] = []
  const n = values.length

  rec.push(
    'start',
    { values, target, eliminated },
    'loop',
    `Search for ${target} by checking every item from left to right.`,
    n,
  )

  for (let i = 0; i < n; i++) {
    rec.comparisons++
    const hit = values[i] === target
    rec.push(
      'check',
      { values, target, eliminated, current: i },
      'compare',
      hit
        ? `Check index ${i}: is ${values[i]} equal to ${target}? Yes!`
        : `Check index ${i}: is ${values[i]} equal to ${target}? No, move on.`,
      n - i,
    )
    if (hit) {
      rec.push(
        'found',
        { values, target, eliminated, current: i, foundIndex: i },
        'found',
        `Found ${target} at index ${i} after ${rec.comparisons} comparison${rec.comparisons === 1 ? '' : 's'}.`,
        n - i,
      )
      return rec.steps
    }
    eliminated.push(i)
  }

  rec.push(
    'not-found',
    { values, target, eliminated, foundIndex: -1 },
    'notFound',
    `Every item has been checked, so ${target} is not in the array.`,
    0,
  )
  return rec.steps
}
