import type { SearchState, SearchStepKind, SearchTrace } from '../../engine/types'
import { defineListing, type Listing } from '../shared'

const KEYS = [
  'start',
  'bounds',
  'loop',
  'mid',
  'compare',
  'found',
  'goRight',
  'goLeft',
  'notFound',
] as const
type Key = (typeof KEYS)[number]

export const binaryPseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure BINARY_SEARCH(A, TARGET)'],
  '  LEFT = 0',
  ['bounds', '  RIGHT = length of A - 1'],
  ['loop', '  loop while LEFT <= RIGHT'],
  ['mid', '    MID = (LEFT + RIGHT) div 2'],
  ['compare', '    if A[MID] == TARGET then'],
  ['found', '      return MID'],
  '    else if A[MID] < TARGET then',
  ['goRight', '      LEFT = MID + 1'],
  '    else',
  ['goLeft', '      RIGHT = MID - 1'],
  '    end if',
  '  end loop',
  ['notFound', '  return -1   // not found'],
  'end procedure',
])

export const binaryPython = defineListing<Key>(KEYS, [
  ['start', 'def binary_search(a, target):'],
  '    left = 0',
  ['bounds', '    right = len(a) - 1'],
  ['loop', '    while left <= right:'],
  ['mid', '        mid = (left + right) // 2'],
  ['compare', '        if a[mid] == target:'],
  ['found', '            return mid'],
  '        elif a[mid] < target:',
  ['goRight', '            left = mid + 1'],
  '        else:',
  ['goLeft', '            right = mid - 1'],
  ['notFound', '    return -1  # not found'],
])

export function cloneSearchState(s: SearchState): SearchState {
  return { ...s, values: s.values.slice(), eliminated: s.eliminated.slice() }
}

/** Shared by linear and binary search. */
export class SearchRecorder<K extends string> {
  readonly steps: SearchTrace = []
  comparisons = 0
  private readonly pseudo: Listing<K>
  private readonly python: Listing<K>

  constructor(pseudo: Listing<K>, python: Listing<K>) {
    this.pseudo = pseudo
    this.python = python
  }

  push(kind: SearchStepKind, state: SearchState, line: K, message: string, remaining: number) {
    this.steps.push({
      state: cloneSearchState(state),
      line: this.pseudo.at[line],
      pyLine: this.python.at[line],
      message,
      kind,
      stats: { comparisons: this.comparisons, remaining },
    })
  }
}

export function binarySearch(values: number[], target: number): SearchTrace {
  const rec = new SearchRecorder<Key>(binaryPseudocode, binaryPython)
  const eliminated: number[] = []
  let left = 0
  let right = values.length - 1
  const size = () => Math.max(0, right - left + 1)
  const base = () => ({ values, target, left, right, eliminated })

  rec.push(
    'start',
    base(),
    'bounds',
    `Search for ${target}. LEFT starts at 0 and RIGHT at ${right}, so the whole array (${values.length} items) is in range.`,
    size(),
  )

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    rec.push(
      'compute-mid',
      { ...base(), mid },
      'mid',
      `MID = (${left} + ${right}) div 2 = ${mid}. The middle value is ${values[mid]}.`,
      size(),
    )
    const v = values[mid]
    rec.comparisons++
    if (v === target) {
      rec.push('compare', { ...base(), mid }, 'compare', `Is ${v} equal to ${target}? Yes!`, size())
      rec.push(
        'found',
        { ...base(), mid, foundIndex: mid },
        'found',
        `Found ${target} at index ${mid} after ${rec.comparisons} comparison${rec.comparisons === 1 ? '' : 's'}.`,
        size(),
      )
      return rec.steps
    }
    const goRight = v < target
    rec.push(
      'compare',
      { ...base(), mid },
      'compare',
      goRight
        ? `Is ${v} equal to ${target}? No. ${v} < ${target}, so the target can only be to the right.`
        : `Is ${v} equal to ${target}? No. ${v} > ${target}, so the target can only be to the left.`,
      size(),
    )
    if (goRight) {
      for (let i = left; i <= mid; i++) eliminated.push(i)
      left = mid + 1
      rec.push(
        'go-right',
        { ...base(), mid },
        'goRight',
        `Move LEFT to ${left}. Indices up to ${mid} are ruled out; ${size()} item${size() === 1 ? '' : 's'} remaining.`,
        size(),
      )
    } else {
      for (let i = mid; i <= right; i++) eliminated.push(i)
      right = mid - 1
      rec.push(
        'go-left',
        { ...base(), mid },
        'goLeft',
        `Move RIGHT to ${right}. Indices from ${mid} on are ruled out; ${size()} item${size() === 1 ? '' : 's'} remaining.`,
        size(),
      )
    }
  }

  eliminated.sort((a, b) => a - b)
  rec.push(
    'not-found',
    { ...base(), foundIndex: -1 },
    'notFound',
    `LEFT (${left}) is now greater than RIGHT (${right}), so the range is empty: ${target} is not in the array.`,
    0,
  )
  return rec.steps
}
