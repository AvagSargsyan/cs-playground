import { useState, type ReactNode } from 'react'
import { Button } from '../../components/ui'
import { CellArray, type CellView } from './CellArray'
import s from './binarySearch.module.css'
import l from './learn.module.css'

/* ------------------------------ Walkthrough ------------------------------ */

/**
 * A vertical, illustrated walkthrough: one row per step with the array drawn as it is at that
 * moment. Vertical (rather than side-by-side frames) so arrays of 7–9 cells stay readable.
 */
export function Walkthrough({
  steps,
}: {
  steps: { title: ReactNode; view: CellView; note: ReactNode }[]
}) {
  return (
    <ol className={l.walk}>
      {steps.map((st, i) => (
        <li key={i} className={l.walkStep}>
          <p className={l.walkTitle}>
            <span className={l.walkNo}>{i + 1}</span>
            {st.title}
          </p>
          <div className={l.walkCells} tabIndex={0}>
            <CellArray view={st.view} size="sm" label={`Step ${i + 1}`} />
          </div>
          <p className={l.walkNote}>{st.note}</p>
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------ Guess my number ------------------------------ */

const MAX = 100

/**
 * The classic higher/lower game. After winning, the student sees how many guesses always
 * picking the middle would have needed (never more than 7 for 1–100).
 */
export function GuessGame() {
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * MAX))
  const [low, setLow] = useState(1)
  const [high, setHigh] = useState(MAX)
  const [guesses, setGuesses] = useState<number[]>([])
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<string>('I am thinking of a whole number from 1 to 100.')
  const won = guesses.at(-1) === secret

  const restart = () => {
    setSecret(1 + Math.floor(Math.random() * MAX))
    setLow(1)
    setHigh(MAX)
    setGuesses([])
    setText('')
    setFeedback('New number! Again from 1 to 100.')
  }

  const guess = (g: number) => {
    if (!Number.isInteger(g) || g < 1 || g > MAX) {
      setFeedback('Type a whole number from 1 to 100.')
      return
    }
    const next = [...guesses, g]
    setGuesses(next)
    setText('')
    if (g === secret) {
      setFeedback(
        `Yes, it was ${secret}! You needed ${next.length} guess${next.length === 1 ? '' : 'es'}.`,
      )
    } else if (g < secret) {
      setLow(Math.max(low, g + 1))
      setFeedback(`${g} is too low. Go higher.`)
    } else {
      setHigh(Math.min(high, g - 1))
      setFeedback(`${g} is too high. Go lower.`)
    }
  }

  const middle = Math.floor((low + high) / 2)
  const halvingGuesses = countHalvingGuesses(secret)

  return (
    <div className={s.game}>
      <form
        className={s.gameForm}
        onSubmit={(e) => {
          e.preventDefault()
          if (!won) guess(Number(text))
        }}
      >
        <label>
          Your guess
          <input
            inputMode="numeric"
            value={text}
            onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
            disabled={won}
            aria-describedby="guess-feedback"
          />
        </label>
        <Button type="submit" disabled={won || text === ''}>
          Guess
        </Button>
        {!won && (
          <Button type="button" variant="ghost" onClick={() => guess(middle)}>
            Guess the middle ({middle})
          </Button>
        )}
        {(won || guesses.length > 0) && (
          <Button type="button" variant="ghost" onClick={restart}>
            New number
          </Button>
        )}
      </form>
      <div className={s.gameRange} aria-hidden="true">
        <div
          className={s.gameRangeFill}
          style={{
            left: `${((low - 1) / MAX) * 100}%`,
            width: `${(Math.max(0, high - low + 1) / MAX) * 100}%`,
          }}
        />
      </div>
      <div className={s.gameRangeLabels}>
        <span>1</span>
        <span>
          Still possible: {low}–{high} ({Math.max(0, high - low + 1)} numbers)
        </span>
        <span>100</span>
      </div>
      <p id="guess-feedback" className={s.gameFeedback} role="status">
        {feedback}
      </p>
      {guesses.length > 0 && (
        <ul className={s.guesses} aria-label="Your guesses">
          {guesses.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      )}
      {won && (
        <p>
          Always guessing the middle of what is still possible finds {secret} in{' '}
          <strong>{halvingGuesses}</strong> guess{halvingGuesses === 1 ? '' : 'es'}. With halving,
          no number from 1 to 100 ever needs more than <strong>7</strong> guesses. That strategy is
          Binary Search.
        </p>
      )}
    </div>
  )
}

function countHalvingGuesses(secret: number) {
  let low = 1
  let high = MAX
  let n = 0
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    n++
    if (mid === secret) return n
    if (mid < secret) low = mid + 1
    else high = mid - 1
  }
  return n
}

/* ------------------------------ Growth chart ------------------------------ */

/**
 * Worst-case comparisons for n = 1…64: linear search grows in a straight line, binary search
 * barely moves. Plotted to the same scale so the difference is obvious.
 */
export function GrowthChart() {
  const W = 520
  const H = 260
  const pad = { l: 44, r: 16, t: 16, b: 40 }
  const maxN = 64
  const x = (n: number) => pad.l + ((n - 1) / (maxN - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => H - pad.b - (v / maxN) * (H - pad.t - pad.b)
  const ns = Array.from({ length: maxN }, (_, i) => i + 1)
  const linear = ns.map((n) => `${x(n)},${y(n)}`).join(' ')
  const binary = ns.map((n) => `${x(n)},${y(Math.floor(Math.log2(n)) + 1)}`).join(' ')
  const ticks = [0, 16, 32, 48, 64]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Chart: for 64 items, Linear Search needs up to 64 comparisons, Binary Search at most 7."
      style={{ width: '100%', maxWidth: W }}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-muted)">
            {t}
          </text>
        </g>
      ))}
      {[1, 16, 32, 48, 64].map((n) => (
        <text
          key={n}
          x={x(n)}
          y={H - pad.b + 18}
          textAnchor="middle"
          fontSize="11"
          fill="var(--ink-muted)"
        >
          {n}
        </text>
      ))}
      <text x={(W + pad.l) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--ink)">
        Number of items (n)
      </text>
      <text
        x={12}
        y={(H - pad.b) / 2}
        textAnchor="middle"
        fontSize="12"
        fill="var(--ink)"
        transform={`rotate(-90 12 ${(H - pad.b) / 2})`}
      >
        Comparisons
      </text>
      <polyline points={linear} fill="none" stroke="var(--uwc-raspberry)" strokeWidth="3" />
      <polyline points={binary} fill="none" stroke="var(--uwc-teal)" strokeWidth="3" />
      <text x={x(40)} y={y(46)} fontSize="12" fontWeight="700" fill="var(--uwc-raspberry)">
        Linear Search: n
      </text>
      <text x={x(30)} y={y(12)} fontSize="12" fontWeight="700" fill="var(--uwc-teal)">
        Binary Search: about log₂ n
      </text>
    </svg>
  )
}
