import { useMemo, useState } from 'react'
import { SORT_ALGORITHM_IDS, SORT_ALGORITHMS } from '../../algorithms/sorting'
import { Controls } from '../../components/visualizers/Controls'
import type { SortAlgorithmId, SortOrder } from '../../engine/types'
import { usePlayer } from '../../engine/usePlayer'
import { Bars } from './Bars'
import s from './sorting.module.css'

/**
 * Two algorithms on the same array, driven by one shared step index. Each side stops at its own
 * last step, so the shorter trace visibly finishes first.
 */
export function RaceMode({
  values,
  order,
  max,
}: {
  values: number[]
  order: SortOrder
  max: number
}) {
  const [left, setLeft] = useState<SortAlgorithmId>('bubble')
  const [right, setRight] = useState<SortAlgorithmId>('merge')
  const traces = useMemo(
    () => [SORT_ALGORITHMS[left].trace(values, order), SORT_ALGORITHMS[right].trace(values, order)],
    [left, right, values, order],
  )
  const longest = traces[0].length >= traces[1].length ? traces[0] : traces[1]
  const player = usePlayer(longest)

  const sides: [SortAlgorithmId, (id: SortAlgorithmId) => void][] = [
    [left, setLeft],
    [right, setRight],
  ]

  return (
    <>
      <div className={s.race}>
        {sides.map(([id, setId], k) => {
          const trace = traces[k]
          const i = Math.min(player.index, trace.length - 1)
          const step = trace[i]
          const done = player.index >= trace.length - 1
          const algo = SORT_ALGORITHMS[id]
          return (
            <div key={k} className={s.racer}>
              <div className={s.racerHead}>
                <select
                  value={id}
                  aria-label={k === 0 ? 'Left algorithm' : 'Right algorithm'}
                  onChange={(e) => setId(e.target.value as SortAlgorithmId)}
                >
                  {SORT_ALGORITHM_IDS.map((a) => (
                    <option key={a} value={a}>
                      {SORT_ALGORITHMS[a].name}
                    </option>
                  ))}
                </select>
                {done && <span className={s.finished}>✓ Finished in {trace.length} steps</span>}
              </div>
              <Bars state={step.state} max={max} compact order={order} />
              <p className={s.racerStats} aria-live="polite">
                <span>
                  Comparisons <strong>{step.stats.comparisons}</strong>
                </span>
                <span>
                  {algo.statLabels.moves} <strong>{step.stats.moves}</strong>
                </span>
                <span>
                  Step <strong>{i + 1}</strong> / {trace.length}
                </span>
              </p>
            </div>
          )
        })}
      </div>
      <Controls player={player} keyboard={false} label="Race controls" />
    </>
  )
}
