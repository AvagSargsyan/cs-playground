import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { cx } from '../../components/ui/cx'
import { CodeBlock } from '../../components/visualizers/Panels'
import { useReducedMotion } from '../../engine/useReducedMotion'
import s from './recursion.module.css'

/* ------------------------------ Nesting dolls ------------------------------ */

const DOLL_COUNT = 5
const DOLL_COLORS = ['#69256d', '#86448a', '#a066a3', '#bb8bbd', '#00807b']

function DollSvg({ size, color, open }: { size: number; color: string; open: boolean }) {
  const w = size * 0.62
  return (
    <svg width={w} height={size} viewBox="0 0 62 100" aria-hidden="true">
      {/* body */}
      <path
        d="M31 30 C 8 30, 4 62, 8 84 C 10 96, 52 96, 54 84 C 58 62, 54 30, 31 30 Z"
        fill={color}
        opacity={open ? 0.35 : 1}
      />
      {/* head */}
      <circle cx="31" cy="24" r="17" fill={color} opacity={open ? 0.35 : 1} />
      <circle cx="31" cy="25" r="11" fill="#fdf3e7" opacity={open ? 0.5 : 1} />
      <circle cx="27" cy="24" r="1.6" fill="#1b1e23" opacity={open ? 0.4 : 1} />
      <circle cx="35" cy="24" r="1.6" fill="#1b1e23" opacity={open ? 0.4 : 1} />
      <path d="M28 29 q3 2 6 0" stroke="#c83461" strokeWidth="1.5" fill="none" />
      {/* belly flower */}
      <circle cx="31" cy="66" r="7" fill="#fff" opacity={open ? 0.3 : 0.85} />
      {open && (
        <line
          x1="6"
          y1="52"
          x2="56"
          y2="52"
          stroke="#1b1e23"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}
    </svg>
  )
}

/**
 * Open the dolls one by one. Each doll holds a smaller copy of itself, until the smallest one,
 * which is solid: the base case.
 */
export function NestingDolls() {
  const [opened, setOpened] = useState(0)
  const current = Math.min(opened, DOLL_COUNT - 1)
  const atBase = opened >= DOLL_COUNT - 1

  const status =
    opened === 0
      ? 'Click the big doll to open it.'
      : atBase
        ? `Doll ${DOLL_COUNT} is solid. It cannot be opened, so we stop. That is the base case.`
        : `Inside doll ${opened} is doll ${opened + 1}: the same kind of thing, only smaller. Open it the same way.`

  return (
    <div className={s.dolls}>
      <div className={s.dollRow}>
        {Array.from({ length: current + 1 }, (_, i) => {
          const isCurrent = i === current
          const size = 140 - i * 20
          return (
            <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              <button
                type="button"
                className={s.doll}
                disabled={!isCurrent || atBase}
                onClick={() => setOpened((o) => o + 1)}
                aria-label={
                  isCurrent && !atBase
                    ? `Open doll ${i + 1}`
                    : `Doll ${i + 1}${i < current ? ' (opened)' : ' (solid)'}`
                }
              >
                <DollSvg size={size} color={DOLL_COLORS[i]} open={i < current} />
              </button>
              <p className={s.dollCaption}>
                {i < current ? 'opened' : atBase && isCurrent ? 'solid ■' : `doll ${i + 1}`}
              </p>
            </div>
          )
        })}
      </div>
      <p className={s.dollStatus} role="status">
        {status}
      </p>
      {opened > 0 && (
        <div className={s.dollActions}>
          <Button size="small" variant="ghost" onClick={() => setOpened(0)}>
            Close them all
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Stack overflow demo ------------------------------ */

const NO_BASE_CODE = `def countdown(n):
    print(n)
    countdown(n - 1)   # no base case!`

/** We stop the demo at this depth so it fits on screen; Python's real limit is about 1000. */
const DEMO_LIMIT = 12
const FRAME_MS = 140

/** Frames pile up because nothing stops the calls, until the program runs out of room. */
export function StackOverflowDemo() {
  const reduced = useReducedMotion()
  const [depth, setDepth] = useState(0)
  const [running, setRunning] = useState(false)
  const crashed = depth >= DEMO_LIMIT

  useEffect(() => {
    if (!running || crashed) return
    const t = window.setTimeout(() => setDepth((d) => d + 1), FRAME_MS)
    return () => window.clearTimeout(t)
  }, [running, crashed, depth])

  const start = () => {
    if (reduced) {
      setDepth(DEMO_LIMIT)
      return
    }
    setDepth(0)
    setRunning(true)
  }
  const reset = () => {
    setRunning(false)
    setDepth(0)
  }

  return (
    <div className={s.overflowGrid}>
      <div>
        <CodeBlock code={NO_BASE_CODE} language="python" label="Countdown without a base case" />
        <div className={s.overflowActions} style={{ marginTop: 'var(--space-3)' }}>
          <Button size="small" onClick={start} disabled={running && !crashed}>
            Run countdown(3)
          </Button>
          {depth > 0 && (
            <Button size="small" variant="ghost" onClick={reset}>
              Reset
            </Button>
          )}
          <span aria-live="polite">{depth > 0 && `Stack depth: ${depth}`}</span>
        </div>
      </div>
      <div className={s.overflow}>
        <div
          className={cx(s.overflowStack, crashed && s.overflowCrashed)}
          role="group"
          aria-label="Call stack"
        >
          {Array.from({ length: depth }, (_, i) => (
            <div key={i} className={s.overflowFrame}>
              countdown({3 - i})
            </div>
          ))}
        </div>
        {crashed && (
          <p className={s.overflowError} role="alert">
            RecursionError: maximum recursion depth exceeded
          </p>
        )}
        {crashed && (
          <p className={s.overflowNote}>
            (The demo stops at {DEMO_LIMIT} calls; Python&rsquo;s real limit is about 1,000.)
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ Plates ------------------------------ */

/** The call stack as a pile of plates: you add to the top and take from the top. */
export function PlatesArt() {
  const plates = ['factorial(3)', 'factorial(2)', 'factorial(1)', 'factorial(0)']
  return (
    <svg
      viewBox="0 0 420 220"
      role="img"
      aria-label="A pile of four plates. The bottom plate is factorial(3), the top plate is factorial(0). New plates go on top and are taken from the top."
      width="420"
    >
      {plates.map((p, i) => {
        const y = 170 - i * 38
        const top = i === plates.length - 1
        return (
          <g key={p}>
            <ellipse cx="150" cy={y + 14} rx="110" ry="14" fill="#d9d4cb" />
            <ellipse
              cx="150"
              cy={y}
              rx="110"
              ry="16"
              fill={top ? 'var(--uwc-teal-tint)' : '#fff'}
              stroke={top ? 'var(--uwc-teal)' : '#cfcac0'}
              strokeWidth="2"
            />
            <text
              x="150"
              y={y + 5}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="13"
              fill="#1b1e23"
            >
              {p}
            </text>
          </g>
        )
      })}
      <path d="M300 60 v-30 h40" fill="none" stroke="var(--uwc-blue)" strokeWidth="2.5" />
      <text x="346" y="35" fontSize="13" fontFamily="Inter, sans-serif" fill="var(--uwc-blue-dark)">
        new call:
      </text>
      <text x="346" y="51" fontSize="13" fontFamily="Inter, sans-serif" fill="var(--uwc-blue-dark)">
        on top
      </text>
      <path d="M300 92 h40" fill="none" stroke="var(--tile-purple)" strokeWidth="2.5" />
      <text x="346" y="90" fontSize="13" fontFamily="Inter, sans-serif" fill="var(--tile-purple)">
        returns:
      </text>
      <text x="346" y="106" fontSize="13" fontFamily="Inter, sans-serif" fill="var(--tile-purple)">
        off the top
      </text>
    </svg>
  )
}

/* ------------------------------ Mini stack for walkthroughs ------------------------------ */

/** Tiny stack drawing for StepFrames. `frames` are listed bottom first. */
export function MiniStack({
  frames,
  activeTop = true,
  baseTop = false,
  output,
}: {
  frames: string[]
  activeTop?: boolean
  baseTop?: boolean
  output?: string
}) {
  return (
    <div>
      <div className={s.mini} role="group" aria-label="Call stack, top first">
        {frames.length === 0 && <div className={s.miniFrame}>(empty)</div>}
        {[...frames].reverse().map((f, i) => (
          <div
            key={f}
            className={cx(
              s.miniFrame,
              i === 0 && activeTop && s.miniActive,
              i === 0 && baseTop && s.miniBase,
            )}
          >
            {f}
          </div>
        ))}
      </div>
      {output !== undefined && <p className={s.miniOut}>output: {output || '—'}</p>}
    </div>
  )
}
