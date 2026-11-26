import type { SortOrder, SortTrace } from '../../engine/types'
import { defineListing, rel } from '../shared'
import { outOfOrder, range, SortRecorder } from './recorder'

const KEYS = ['start', 'pass', 'key', 'compare', 'shift', 'insert'] as const
type Key = (typeof KEYS)[number]

export const insertionPseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure INSERTION_SORT(A)'],
  ['pass', '  loop I from 1 to length of A - 1'],
  ['key', '    KEY = A[I]'],
  '    J = I - 1',
  ['compare', '    loop while J >= 0 and A[J] > KEY'],
  ['shift', '      A[J+1] = A[J]'],
  '      J = J - 1',
  '    end loop',
  ['insert', '    A[J+1] = KEY'],
  '  end loop',
  'end procedure',
])

export const insertionPython = defineListing<Key>(KEYS, [
  ['start', 'def insertion_sort(a):'],
  ['pass', '    for i in range(1, len(a)):'],
  ['key', '        key = a[i]'],
  '        j = i - 1',
  ['compare', '        while j >= 0 and a[j] > key:'],
  ['shift', '            a[j + 1] = a[j]'],
  '            j -= 1',
  ['insert', '        a[j + 1] = key'],
])

export function insertionSort(input: number[], order: SortOrder = 'asc'): SortTrace {
  const values = input.slice()
  const n = values.length
  const rec = new SortRecorder<Key>(insertionPseudocode, insertionPython)
  const sorted: number[] = []

  rec.push(
    'start',
    { values, sorted, activeRange: n ? [0, 0] : undefined },
    'start',
    'Insertion Sort builds a sorted section on the left. Each new value is taken out and inserted into its correct place in that section.',
  )

  for (let i = 1; i < n; i++) {
    const keyValue = values[i]
    const active: [number, number] = [0, i]
    const key = { value: keyValue, from: i }
    rec.push(
      'start',
      { values, sorted, activeRange: active, key },
      'key',
      `Take ${keyValue} out as the key. Positions 0 to ${i - 1} are already sorted.`,
    )
    let j = i - 1
    while (j >= 0) {
      const a = values[j]
      rec.comparisons++
      const move = outOfOrder(a, keyValue, order)
      rec.push(
        'compare',
        { values, sorted, activeRange: active, key, comparing: [j, j + 1] },
        'compare',
        move
          ? `Compare ${a} with the key ${keyValue}. ${a} ${rel(a, keyValue)} ${keyValue}, so ${a} must move right.`
          : `Compare ${a} with the key ${keyValue}. ${a} ${rel(a, keyValue)} ${keyValue}, so the key belongs right after it.`,
      )
      if (!move) break
      values[j + 1] = a
      rec.moves++
      rec.push(
        'shift',
        { values, sorted, activeRange: active, key, writing: j + 1 },
        'shift',
        `Shift ${a} one place right, to position ${j + 1}.`,
      )
      j--
    }
    const target = j + 1
    if (target !== i) {
      values[target] = keyValue
      rec.moves++
      rec.push(
        'insert',
        { values, sorted, activeRange: active, writing: target },
        'insert',
        `Insert the key ${keyValue} at position ${target}.`,
      )
    } else {
      rec.push(
        'insert',
        { values, sorted, activeRange: active },
        'insert',
        `${keyValue} is already in the right place, so it stays at position ${i}.`,
      )
    }
  }

  if (n > 0) sorted.splice(0, sorted.length, ...range(0, n - 1))
  rec.push('done', { values, sorted }, null, 'Done! The array is sorted.')
  return rec.steps
}
