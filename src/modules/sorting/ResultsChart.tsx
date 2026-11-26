import { useMemo } from 'react'
import { SORT_ALGORITHM_IDS, SORT_ALGORITHMS } from '../../algorithms/sorting'
import type { SortOrder } from '../../engine/types'
import s from './sorting.module.css'

/** Total comparisons and swaps/writes of every algorithm on the same array. */
export function ResultsChart({ values, order }: { values: number[]; order: SortOrder }) {
  const results = useMemo(
    () =>
      SORT_ALGORITHM_IDS.map((id) => {
        const trace = SORT_ALGORITHMS[id].trace(values, order)
        const { comparisons, moves } = trace[trace.length - 1].stats
        return {
          id,
          name: SORT_ALGORITHMS[id].name,
          label: SORT_ALGORITHMS[id].statLabels.moves,
          comparisons,
          moves,
        }
      }),
    [values, order],
  )
  const top = Math.max(1, ...results.flatMap((r) => [r.comparisons, r.moves]))
  // Leave room for the number label next to the longest bar.
  const pct = (n: number) => `${(n / top) * 62}%`

  return (
    <div className={s.chart}>
      <div className={s.chartKey} aria-hidden="true">
        <span className={s.keyCompare}>Comparisons</span>
        <span className={s.keyMoves}>Swaps or writes</span>
      </div>
      {results.map((r) => (
        <div key={r.id} className={s.chartRow}>
          <span className={s.chartName}>{r.name}</span>
          <div className={s.chartBars}>
            <span className={s.chartBar}>
              <span
                className={`${s.chartFill} ${s.fillCompare}`}
                style={{ width: pct(r.comparisons) }}
              />
              {r.comparisons} comparisons
            </span>
            <span className={s.chartBar}>
              <span className={`${s.chartFill} ${s.fillMoves}`} style={{ width: pct(r.moves) }} />
              {r.moves} {r.label.toLowerCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
