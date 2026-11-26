import type { SortOrder, SortTrace } from '../../engine/types'
import { defineListing, rel } from '../shared'
import { outOfOrder, range, SortRecorder } from './recorder'

const KEYS = ['start', 'pass', 'assume', 'compare', 'newMin', 'check', 'swap'] as const
type Key = (typeof KEYS)[number]

export const selectionPseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure SELECTION_SORT(A)'],
  '  N = length of A',
  ['pass', '  loop I from 0 to N-2'],
  ['assume', '    MIN = I'],
  '    loop J from I+1 to N-1',
  ['compare', '      if A[J] < A[MIN] then'],
  ['newMin', '        MIN = J'],
  '      end if',
  '    end loop',
  ['check', '    if MIN ≠ I then'],
  ['swap', '      swap A[I] and A[MIN]'],
  '    end if',
  '  end loop',
  'end procedure',
])

export const selectionPython = defineListing<Key>(KEYS, [
  ['start', 'def selection_sort(a):'],
  '    n = len(a)',
  ['pass', '    for i in range(n - 1):'],
  ['assume', '        smallest = i'],
  '        for j in range(i + 1, n):',
  ['compare', '            if a[j] < a[smallest]:'],
  ['newMin', '                smallest = j'],
  ['check', '        if smallest != i:'],
  ['swap', '            a[i], a[smallest] = a[smallest], a[i]'],
])

export function selectionSort(input: number[], order: SortOrder = 'asc'): SortTrace {
  const values = input.slice()
  const n = values.length
  const rec = new SortRecorder<Key>(selectionPseudocode, selectionPython)
  const sorted: number[] = []
  const word = order === 'asc' ? 'smallest' : 'largest'

  rec.push(
    'start',
    { values, sorted, activeRange: n ? [0, n - 1] : undefined },
    'start',
    `Selection Sort finds the ${word} value in the unsorted part and moves it to the front, one position at a time.`,
  )

  for (let i = 0; i < n - 1; i++) {
    const active: [number, number] = [i, n - 1]
    let best = i
    rec.push(
      'select-min',
      { values, sorted, activeRange: active, candidate: best },
      'assume',
      `Position ${i}: assume ${values[i]} is the ${word} value so far.`,
    )
    for (let j = i + 1; j < n; j++) {
      rec.comparisons++
      const better = outOfOrder(values[best], values[j], order)
      rec.push(
        'compare',
        { values, sorted, activeRange: active, candidate: best, comparing: [j, best] },
        'compare',
        better
          ? `Compare ${values[j]} with ${values[best]}. ${values[j]} ${rel(values[j], values[best])} ${values[best]}, so ${values[j]} is the new ${word}.`
          : `Compare ${values[j]} with ${values[best]}. ${values[j]} is not ${word === 'smallest' ? 'smaller' : 'larger'}, so keep ${values[best]}.`,
      )
      if (better) {
        best = j
        rec.push(
          'select-min',
          { values, sorted, activeRange: active, candidate: best },
          'newMin',
          `Remember position ${j} (value ${values[j]}) as the ${word} so far.`,
        )
      }
    }
    if (best !== i) {
      const a = values[i]
      const b = values[best]
      ;[values[i], values[best]] = [values[best], values[i]]
      rec.moves++
      rec.push(
        'swap',
        { values, sorted, activeRange: active, swapping: [i, best] },
        'swap',
        `Swap ${b} into position ${i} (it trades places with ${a}).`,
      )
    } else {
      rec.push(
        'no-swap',
        { values, sorted, activeRange: active, candidate: i },
        'check',
        `${values[i]} is already the ${word}, so it stays where it is: no swap.`,
      )
    }
    sorted.push(i)
    rec.push(
      'mark-sorted',
      { values, sorted, activeRange: active },
      'pass',
      `${values[i]} is now in its final place.`,
    )
  }

  if (n > 0) sorted.splice(0, sorted.length, ...range(0, n - 1))
  rec.push('done', { values, sorted }, null, 'Done! The array is sorted.')
  return rec.steps
}
