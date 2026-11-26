import { cx } from '../../../components/ui/cx'
import type { SortState } from '../types'
import s from '../sorting.module.css'

/** Bar drawn inside a selectable button (used with SelectItems and the manual sort). */
export function PickBar({ state, index, max }: { state: SortState; index: number; max: number }) {
  const v = state.values[index]
  const sorted = state.sorted.includes(index)
  const compare = state.comparing?.includes(index)
  return (
    <span className={cx(s.pickCell, sorted && s.pickSorted, compare && s.pickCompare)}>
      <span style={{ height: `${Math.max(6, (v / max) * 84)}px` }} />
      <span>
        {v}
        {sorted && <span className="visually-hidden"> (sorted)</span>}
        {compare && <span className="visually-hidden"> (being compared)</span>}
      </span>
    </span>
  )
}
