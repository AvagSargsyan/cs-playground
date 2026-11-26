import type { SortOrder, SortState, SortTrace } from '../../engine/types'
import { defineListing, rel } from '../shared'
import { outOfOrder, range, SortRecorder } from './recorder'

const KEYS = ['start', 'base', 'split', 'merge', 'compare', 'leftover', 'write'] as const
type Key = (typeof KEYS)[number]

export const mergePseudocode = defineListing<Key>(KEYS, [
  ['start', 'procedure MERGE_SORT(A, LO, HI)'],
  '  if LO >= HI then',
  ['base', '    return   // 0 or 1 element: already sorted'],
  '  end if',
  ['split', '  MID = (LO + HI) div 2'],
  '  MERGE_SORT(A, LO, MID)',
  '  MERGE_SORT(A, MID+1, HI)',
  ['merge', '  MERGE(A, LO, MID, HI)'],
  'end procedure',
  '',
  'procedure MERGE(A, LO, MID, HI)',
  '  I = LO,  J = MID + 1,  TEMP = empty list',
  '  loop while I <= MID and J <= HI',
  ['compare', '    if A[I] <= A[J] then'],
  '      add A[I] to TEMP,  I = I + 1',
  '    else',
  '      add A[J] to TEMP,  J = J + 1',
  '    end if',
  '  end loop',
  ['leftover', '  add what is left of A[I..MID] and A[J..HI] to TEMP'],
  ['write', '  copy TEMP back into A[LO..HI]'],
  'end procedure',
])

export const mergePython = defineListing<Key>(KEYS, [
  ['start', 'def merge_sort(a, lo, hi):'],
  '    if lo >= hi:',
  ['base', '        return  # 0 or 1 element: already sorted'],
  ['split', '    mid = (lo + hi) // 2'],
  '    merge_sort(a, lo, mid)',
  '    merge_sort(a, mid + 1, hi)',
  ['merge', '    merge(a, lo, mid, hi)'],
  '',
  'def merge(a, lo, mid, hi):',
  '    i, j, temp = lo, mid + 1, []',
  '    while i <= mid and j <= hi:',
  ['compare', '        if a[i] <= a[j]:'],
  '            temp.append(a[i]); i += 1',
  '        else:',
  '            temp.append(a[j]); j += 1',
  ['leftover', '    temp += a[i:mid + 1] + a[j:hi + 1]'],
  ['write', '    a[lo:hi + 1] = temp'],
])

const fmt = (values: number[], lo: number, hi: number) => values.slice(lo, hi + 1).join(', ')

export function mergeSort(input: number[], order: SortOrder = 'asc'): SortTrace {
  const values = input.slice()
  const n = values.length
  const rec = new SortRecorder<Key>(mergePseudocode, mergePython)
  const sorted: number[] = []

  rec.push(
    'start',
    { values, sorted, activeRange: n ? [0, n - 1] : undefined },
    'start',
    'Merge Sort uses divide and conquer: split the array in half, sort each half, then merge the two sorted halves.',
  )

  const sortRange = (lo: number, hi: number) => {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    rec.push(
      'split',
      { values, sorted, activeRange: [lo, hi] },
      'split',
      `Split [${fmt(values, lo, hi)}] into [${fmt(values, lo, mid)}] and [${fmt(values, mid + 1, hi)}].`,
    )
    sortRange(lo, mid)
    sortRange(mid + 1, hi)
    merge(lo, mid, hi)
  }

  const merge = (lo: number, mid: number, hi: number) => {
    const aux: (number | null)[] = Array(hi - lo + 1).fill(null)
    let k = 0
    const state = (extra: Partial<SortState> = {}): SortState => ({
      values,
      sorted,
      activeRange: [lo, hi],
      merging: { left: [lo, mid], right: [mid + 1, hi], aux, auxPointer: k },
      ...extra,
    })

    rec.push(
      'start',
      state(),
      'merge',
      `Merge the sorted halves [${fmt(values, lo, mid)}] and [${fmt(values, mid + 1, hi)}].`,
    )

    let i = lo
    let j = mid + 1
    while (i <= mid && j <= hi) {
      const a = values[i]
      const b = values[j]
      rec.comparisons++
      // Taking from the left on ties keeps Merge Sort stable.
      const takeRight = outOfOrder(a, b, order)
      const taken = takeRight ? b : a
      aux[k] = taken
      rec.push(
        'compare',
        state({ comparing: [i, j] }),
        'compare',
        `Compare ${a} and ${b}. ${a} ${rel(a, b)} ${b}, so ${taken} goes next into the merge buffer.`,
      )
      k++
      if (takeRight) j++
      else i++
    }

    const rest = [...values.slice(i, mid + 1), ...values.slice(j, hi + 1)]
    if (rest.length) {
      for (const v of rest) aux[k++] = v
      rec.push(
        'write',
        state(),
        'leftover',
        `One half is used up, so copy what is left (${rest.join(', ')}) into the buffer.`,
      )
    }

    for (let t = 0; t < aux.length; t++) {
      const v = aux[t] as number
      values[lo + t] = v
      rec.moves++
      rec.push(
        'write',
        state({ writing: lo + t }),
        'write',
        `Write ${v} back to position ${lo + t}.`,
      )
    }
  }

  sortRange(0, n - 1)
  if (n > 0) sorted.splice(0, sorted.length, ...range(0, n - 1))
  rec.push('done', { values, sorted }, null, 'Done! The array is sorted.')
  return rec.steps
}
