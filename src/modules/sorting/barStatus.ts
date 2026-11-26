import type { SortState } from '../../engine/types'

export type BarStatus = 'default' | 'compare' | 'swap' | 'candidate' | 'sorted' | 'merge'

/** Visual state of one bar. The order of checks is the priority when states overlap. */
export function barStatus(state: SortState, i: number): BarStatus {
  if (state.swapping?.includes(i) || state.writing === i) return 'swap'
  if (state.comparing?.includes(i)) return 'compare'
  if (state.candidate === i) return 'candidate'
  if (state.sorted.includes(i)) return 'sorted'
  const m = state.merging
  if (m && i >= m.left[0] && i <= m.right[1]) return 'merge'
  return 'default'
}

export function describeState(state: SortState): string {
  return `Bars with values ${state.values.join(', ')}.`
}
