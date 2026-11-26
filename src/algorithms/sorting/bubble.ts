import type { SortOrder, SortTrace } from '../../engine/types'
import { defineListing, rel } from '../shared'
import { outOfOrder, range, SortRecorder } from './recorder'

const KEYS = ['start', 'pass', 'compare', 'swap', 'check', 'exit'] as const
type Key = (typeof KEYS)[number]

export const bubblePseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure BUBBLE_SORT(A)'],
  '  N = length of A',
  ['pass', '  loop I from 0 to N-2'],
  '    SWAPPED = false',
  '    loop J from 0 to N-2-I',
  ['compare', '      if A[J] > A[J+1] then'],
  ['swap', '        swap A[J] and A[J+1]'],
  '        SWAPPED = true',
  '      end if',
  '    end loop',
  ['check', '    if SWAPPED == false then'],
  ['exit', '      stop   // no swaps: already sorted'],
  '    end if',
  '  end loop',
  'end procedure',
])

export const bubblePython = defineListing<Key>(KEYS, [
  ['start', 'def bubble_sort(a):'],
  '    n = len(a)',
  ['pass', '    for i in range(n - 1):'],
  '        swapped = False',
  '        for j in range(n - 1 - i):',
  ['compare', '            if a[j] > a[j + 1]:'],
  ['swap', '                a[j], a[j + 1] = a[j + 1], a[j]'],
  '                swapped = True',
  ['check', '        if not swapped:'],
  ['exit', '            break  # no swaps: already sorted'],
])

export function bubbleSort(input: number[], order: SortOrder = 'asc'): SortTrace {
  const values = input.slice()
  const n = values.length
  const rec = new SortRecorder<Key>(bubblePseudocode, bubblePython)
  const sorted: number[] = []
  const goal = order === 'asc' ? 'largest' : 'smallest'

  rec.push(
    'start',
    { values, sorted, activeRange: n ? [0, n - 1] : undefined },
    'start',
    `Bubble Sort compares neighbours and swaps them when they are in the wrong order. The ${goal} value "bubbles" to the end on each pass.`,
  )

  let finishedEarly = false
  for (let i = 0; i < n - 1; i++) {
    const end = n - 1 - i
    rec.push(
      'start',
      { values, sorted, activeRange: [0, end] },
      'pass',
      `Pass ${i + 1}: walk through positions 0 to ${end} and push the ${goal} value to the end.`,
    )
    let swapped = false
    for (let j = 0; j < end; j++) {
      const a = values[j]
      const b = values[j + 1]
      rec.comparisons++
      const swap = outOfOrder(a, b, order)
      rec.push(
        'compare',
        { values, sorted, activeRange: [0, end], comparing: [j, j + 1] },
        'compare',
        swap
          ? `Compare ${a} and ${b}. ${a} ${rel(a, b)} ${b}, so they are in the wrong order.`
          : `Compare ${a} and ${b}. ${a} ${rel(a, b)} ${b}, so they are already in order: no swap.`,
      )
      if (swap) {
        ;[values[j], values[j + 1]] = [values[j + 1], values[j]]
        rec.moves++
        swapped = true
        rec.push(
          'swap',
          { values, sorted, activeRange: [0, end], swapping: [j, j + 1] },
          'swap',
          `Swap ${a} and ${b}.`,
        )
      }
    }
    if (!swapped) {
      sorted.splice(0, sorted.length, ...range(0, n - 1))
      rec.push(
        'early-exit',
        { values, sorted },
        'exit',
        'No swaps in this whole pass, so the array is already sorted. Stop early!',
      )
      finishedEarly = true
      break
    }
    sorted.push(end)
    rec.push(
      'mark-sorted',
      { values, sorted, activeRange: [0, end] },
      'check',
      `${values[end]} is now in its final place.`,
    )
  }

  if (!finishedEarly && n > 0) sorted.splice(0, sorted.length, ...range(0, n - 1))
  rec.push('done', { values, sorted }, null, `Done! The array is sorted.`)
  return rec.steps
}
