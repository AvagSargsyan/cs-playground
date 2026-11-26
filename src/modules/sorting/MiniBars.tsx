import type { SortState } from '../../engine/types'
import { barStatus, type BarStatus } from './barStatus'

const FILL: Record<BarStatus, string> = {
  default: 'var(--state-default)',
  compare: 'var(--state-compare)',
  swap: 'var(--state-swap)',
  candidate: 'var(--uwc-blue)',
  sorted: 'var(--state-sorted)',
  merge: '#d9c6db',
}

const MARK: Partial<Record<BarStatus, string>> = {
  compare: '▲',
  swap: '⇄',
  candidate: '◆',
  sorted: '✓',
}

/** Small static bar chart for illustrated walkthroughs and exercises. */
export function MiniBars({
  state,
  max,
  label,
}: {
  state: SortState
  max?: number
  label?: string
}) {
  const values = state.values
  const top = max ?? Math.max(...values, 1)
  const w = 22
  const gap = 5
  const h = 70
  const width = values.length * (w + gap) - gap
  return (
    <svg
      viewBox={`0 -14 ${width} ${h + 32}`}
      width={width}
      role="img"
      aria-label={label ?? `Values ${values.join(', ')}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {values.map((v, i) => {
        const st = barStatus(state, i)
        const bh = Math.max(3, (v / top) * h)
        const x = i * (w + gap)
        return (
          <g key={i}>
            {MARK[st] && (
              <text
                x={x + w / 2}
                y={-3}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={FILL[st]}
              >
                {MARK[st]}
              </text>
            )}
            <rect
              x={x}
              y={h - bh}
              width={w}
              height={bh}
              rx="4"
              fill={FILL[st]}
              stroke={st === 'merge' ? 'var(--state-merge)' : 'none'}
              strokeDasharray={st === 'merge' ? '3 2' : undefined}
              strokeWidth="1.5"
            />
            <text
              x={x + w / 2}
              y={h + 13}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="var(--ink)"
            >
              {v}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
