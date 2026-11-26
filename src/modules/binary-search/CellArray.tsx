import { motion } from 'motion/react'
import { cx } from '../../components/ui/cx'
import { Legend, Swatch } from '../../components/visualizers/Panels'
import { useReducedMotion } from '../../engine/useReducedMotion'
import s from './binarySearch.module.css'

/** What the cell row needs to draw one moment of a search. */
export type CellView = {
  values: number[]
  left?: number
  right?: number
  mid?: number
  /** Linear search: index being checked. */
  current?: number
  eliminated?: number[]
  /** Index found, or -1 when the search failed. */
  foundIndex?: number
  /** Cells outside this range are drawn faded (used by practice exercises). */
  dimOutside?: [number, number]
}

type CellState = 'found' | 'mid' | 'current' | 'eliminated' | 'range' | 'idle'

function cellState(v: CellView, i: number): CellState {
  if (v.foundIndex !== undefined && v.foundIndex === i) return 'found'
  if (v.mid === i) return 'mid'
  if (v.current === i) return 'current'
  if (v.eliminated?.includes(i)) return 'eliminated'
  if (v.dimOutside && (i < v.dimOutside[0] || i > v.dimOutside[1])) return 'eliminated'
  if (v.left !== undefined && v.right !== undefined && i >= v.left && i <= v.right) return 'range'
  return 'idle'
}

const STATE_TEXT: Record<CellState, string> = {
  found: 'found',
  mid: 'middle',
  current: 'checking',
  eliminated: 'ruled out',
  range: 'in range',
  idle: '',
}

/**
 * A row of numbered cells for binary and linear search. States are shown with color *and*
 * labels/patterns (L, R, M markers, hatching, ✓), never color alone.
 */
export function CellArray({
  view,
  onCellClick,
  size = 'md',
  label = 'Array',
  showIndices = true,
}: {
  view: CellView
  /** Makes cells clickable (e.g. to choose a target). */
  onCellClick?: (index: number) => void
  size?: 'md' | 'sm'
  label?: string
  showIndices?: boolean
}) {
  const reduced = useReducedMotion()
  const inRange = (i: number) =>
    view.left !== undefined && view.right !== undefined && i >= view.left && i <= view.right
  const failed = view.foundIndex === -1

  return (
    <ol
      className={cx(s.cells, size === 'sm' && s.cellsSm, failed && s.cellsFailed)}
      style={{ '--n': view.values.length } as React.CSSProperties}
      aria-label={label}
    >
      {view.values.map((value, i) => {
        const st = cellState(view, i)
        const markers = [
          view.left === i && 'L',
          view.mid === i && 'M',
          view.right === i && 'R',
        ].filter(Boolean) as string[]
        const desc = [
          `index ${i}, value ${value}`,
          STATE_TEXT[st],
          markers.length ? `marker ${markers.join(' and ')}` : '',
        ]
          .filter(Boolean)
          .join(', ')
        const box = (
          <motion.span
            className={cx(s.cell, s[`cell-${st}`])}
            animate={st === 'found' && !reduced ? { scale: [1, 1.18, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            {value}
            {st === 'found' && (
              <span className={s.foundTick} aria-hidden="true">
                ✓
              </span>
            )}
          </motion.span>
        )
        return (
          <li
            key={i}
            className={cx(
              s.slot,
              inRange(i) && s.slotRange,
              view.left === i && s.slotRangeStart,
              view.right === i && s.slotRangeEnd,
            )}
          >
            {showIndices && (
              <span className={s.index} aria-hidden="true">
                {i}
              </span>
            )}
            {onCellClick ? (
              <button
                type="button"
                className={s.cellButton}
                onClick={() => onCellClick(i)}
                aria-label={`Search for ${value} (${desc})`}
              >
                {box}
              </button>
            ) : (
              <span className={s.cellWrap} aria-label={desc} role="img">
                {box}
              </span>
            )}
            <span className={s.markers} aria-hidden="true">
              {markers.map((m) => (
                <span key={m} className={cx(s.marker, s[`marker-${m}`])}>
                  {m}
                </span>
              ))}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Legend for the cell states, shared by Explore and Learn. */
export function SearchLegend() {
  return (
    <Legend
      items={[
        { label: 'Search range (L to R)', swatch: <span className={s.swatchRange} /> },
        { label: 'Middle (M)', swatch: <Swatch color="var(--uwc-orange)" symbol="M" /> },
        { label: 'Ruled out', swatch: <Swatch color="" hatch /> },
        { label: 'Found', swatch: <Swatch color="var(--uwc-teal)" symbol="✓" /> },
      ]}
    />
  )
}
