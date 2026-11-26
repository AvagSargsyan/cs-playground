import { motion } from 'motion/react'
import { cx } from '../../components/ui/cx'
import type { SortState } from '../../engine/types'
import { useReducedMotion } from '../../engine/useReducedMotion'
import { barStatus, describeState, type BarStatus } from './barStatus'
import s from './sorting.module.css'

/** Non-color cue shown above each bar, so states never rely on color alone. */
const MARKER: Record<BarStatus, string> = {
  default: '',
  compare: '▲',
  swap: '⇄',
  candidate: '◆',
  sorted: '✓',
  merge: '',
}

export function Bars({
  state,
  max,
  compact,
  order = 'asc',
}: {
  state: SortState
  /** Largest value of the input, so heights stay stable while sorting. */
  max: number
  compact?: boolean
  order?: 'asc' | 'desc'
}) {
  const reduced = useReducedMotion()
  const n = state.values.length
  const showValues = n <= 16
  const range = state.activeRange
  const cols = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }
  const m = state.merging

  return (
    <div className={cx(s.bars, compact && s.compact)}>
      <div className={s.barsTop}>
        {state.key ? (
          <span className={s.keyChip}>
            Key: {state.key.value}
            <span className="visually-hidden">, taken out from position {state.key.from}</span>
          </span>
        ) : (
          <span />
        )}
        {state.candidate !== undefined && (
          <span>◆ = {order === 'asc' ? 'smallest' : 'largest'} so far</span>
        )}
      </div>
      <div className={s.columns} style={cols} role="img" aria-label={describeState(state)}>
        {state.values.map((v, i) => {
          const st = barStatus(state, i)
          const outside =
            range && st !== 'sorted' && (i < range[0] || i > range[1]) && !state.sorted.includes(i)
          const inRange = range && i >= range[0] && i <= range[1]
          return (
            <div key={i} className={s.col}>
              <span className={cx(s.marker, s[`mk-${st}`])} aria-hidden="true">
                {MARKER[st]}
              </span>
              <div className={s.barArea}>
                <motion.div
                  className={cx(s.bar, s[`st-${st}`], outside && s.dim)}
                  initial={false}
                  animate={{ height: `${Math.max(3, (v / Math.max(1, max)) * 100)}%` }}
                  transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
                />
              </div>
              <span className={s.value} aria-hidden="true">
                {showValues ? v : ''}
              </span>
              <span
                aria-hidden="true"
                className={cx(
                  s.range,
                  inRange && s.inRange,
                  inRange && i === range[0] && s.rangeStart,
                  inRange && i === range[1] && s.rangeEnd,
                )}
              />
            </div>
          )
        })}
      </div>
      {m && (
        <>
          <p className={s.auxLabel}>Merge buffer</p>
          <div className={s.auxRow} style={cols} role="group" aria-label="Merge buffer">
            {state.values.map((_, i) => {
              const lo = m.left[0]
              const inMerge = i >= lo && i <= m.right[1]
              if (!inMerge) return <span key={i} />
              const v = m.aux[i - lo]
              return (
                <span
                  key={i}
                  className={cx(
                    s.auxCell,
                    v !== null && s.auxFilled,
                    v === null && m.auxPointer === i - lo && s.auxNext,
                  )}
                >
                  {v ?? ''}
                </span>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
