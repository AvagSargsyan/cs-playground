import { useMemo, useState } from 'react'
import {
  binarySearch,
  generateSortedUnique,
  linearSearch,
  maxBinaryComparisons,
  pickTarget,
  SEARCH_ALGORITHMS,
  validateSortedUnique,
} from '../../algorithms/search'
import { parseNumberList } from '../../algorithms/shared'
import { Button } from '../../components/ui'
import { Controls, KeyboardHint } from '../../components/visualizers/Controls'
import { CodePanel, StatsPanel, StepMessage } from '../../components/visualizers/Panels'
import type { ModuleId } from '../../content/modules'
import type { SearchState, Step } from '../../engine/types'
import { usePlayer } from '../../engine/usePlayer'
import { ExploreLayout, Field } from '../shared/lesson'
import { useMarkStageDone } from '../shared/useMarkStageDone'
import { CellArray, SearchLegend } from './CellArray'
import { comparisonsFor, midOf } from './generators'
import s from './binarySearch.module.css'

const MIN_SIZE = 7
const MAX_SIZE = 31

function newArray(size: number) {
  const values = generateSortedUnique(size, 1, 99)
  return { values, target: pickTarget(values) }
}

export default function Explore({ moduleId }: { moduleId: ModuleId }) {
  const [size, setSize] = useState(15)
  const [{ values, target }, setData] = useState(() => newArray(15))
  const [targetText, setTargetText] = useState(String(target))
  const [customText, setCustomText] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)

  const trace = useMemo(() => binarySearch(values, target), [values, target])
  const player = usePlayer(trace)
  useMarkStageDone(moduleId, 'explore', player.isLast)

  const { state, stats, kind } = player.step
  const setTarget = (t: number) => {
    // Same target: the trace does not change, so restart the player explicitly.
    if (t === target) player.reset()
    setData((d) => ({ ...d, target: t }))
    setTargetText(String(t))
  }
  const regenerate = (n = size) => {
    const d = newArray(n)
    setData(d)
    setTargetText(String(d.target))
    setCustomError(null)
  }
  const applyCustom = () => {
    const parsed = parseNumberList(customText, {
      min: 1,
      max: 999,
      minLength: 3,
      maxLength: MAX_SIZE,
    })
    if ('error' in parsed) return setCustomError(parsed.error)
    const err = validateSortedUnique(parsed.values)
    if (err) return setCustomError(err)
    setCustomError(null)
    setSize(parsed.values.length)
    setData({ values: parsed.values, target: parsed.values[midOf(0, parsed.values.length - 1)] })
    setTargetText(String(parsed.values[midOf(0, parsed.values.length - 1)]))
  }

  const range = state.left !== undefined && state.right !== undefined && state.left <= state.right
  return (
    <ExploreLayout
      intro={
        <>
          Pick a target and press play. Watch how each comparison with the middle item rules out
          half of what is left. Click any cell to search for its value, or type a number that is not
          in the array to see what happens when the search fails.
        </>
      }
      setup={
        <>
          <Field label={`Array size: ${size}`}>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => {
                const n = Number(e.target.value)
                setSize(n)
                regenerate(n)
              }}
              aria-label="Array size"
            />
          </Field>
          <Field label="Target">
            <form
              className={s.inlineRow}
              onSubmit={(e) => {
                e.preventDefault()
                const t = Number(targetText)
                if (targetText.trim() !== '' && Number.isInteger(t)) setTarget(t)
              }}
            >
              <input
                type="number"
                className={s.targetInput}
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                aria-label="Target value"
              />
              <Button type="submit" size="small" variant="ghost">
                Search
              </Button>
            </form>
          </Field>
          <Button size="small" variant="secondary" onClick={() => regenerate()}>
            New array
          </Button>
          <Field label="Or use your own sorted values">
            <form
              className={s.inlineRow}
              onSubmit={(e) => {
                e.preventDefault()
                applyCustom()
              }}
            >
              <input
                type="text"
                className={s.customInput}
                placeholder="e.g. 2, 5, 9, 14, 20, 31"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                aria-label="Your own sorted values"
                aria-invalid={!!customError}
              />
              <Button type="submit" size="small" variant="ghost">
                Use these
              </Button>
            </form>
            {customError && (
              <p className={s.error} role="alert">
                {customError}
              </p>
            )}
          </Field>
        </>
      }
      visual={
        <div className={s.visualInner}>
          <CellArray view={state} onCellClick={(i) => setTarget(values[i])} label="Sorted array" />
          <p className={s.visualHint}>
            Searching for <strong>{target}</strong> · click a cell to search for a different value
          </p>
        </div>
      }
      legend={<SearchLegend />}
      message={
        <StepMessage
          tone={kind === 'found' ? 'success' : kind === 'not-found' ? 'error' : undefined}
        >
          {player.step.message}
        </StepMessage>
      }
      controls={
        <div>
          <Controls player={player} />
          <KeyboardHint />
        </div>
      }
      side={
        <>
          <CodePanel
            listing={SEARCH_ALGORITHMS.binary.code}
            line={player.step.line}
            pyLine={player.step.pyLine}
            title="Binary Search"
          />
          <StatsPanel
            items={[
              { label: 'Left', value: range ? state.left : '–' },
              { label: 'Right', value: range ? state.right : '–' },
              { label: 'Middle', value: state.mid ?? '–' },
              { label: 'Comparisons', value: stats.comparisons, emphasis: true },
              {
                label: 'Items remaining',
                value: stats.remaining,
                hint: 'How many items are still inside the search range',
              },
              { label: 'Step', value: `${player.index + 1} / ${player.total}` },
              {
                label: 'Worst case',
                value: maxBinaryComparisons(values.length),
                hint: 'Most comparisons Binary Search can need for this array size: floor(log₂ n) + 1. Binary Search is O(log n).',
              },
            ]}
          />
        </>
      }
      below={<LinearVsBinary values={values} target={target} />}
    />
  )
}

/* ------------------------------ Linear vs binary ------------------------------ */

type RaceState = { linear: SearchState; binary: SearchState; linMsg: string; binMsg: string }

/** Runs both searches on one shared timeline so they can be compared step by step. */
function raceTrace(values: number[], target: number): Step<RaceState>[] {
  const lin = linearSearch(values, target)
  const bin = binarySearch(values, target)
  const len = Math.max(lin.length, bin.length)
  return Array.from({ length: len }, (_, i) => {
    const l = lin[Math.min(i, lin.length - 1)]
    const b = bin[Math.min(i, bin.length - 1)]
    return {
      state: { linear: l.state, binary: b.state, linMsg: l.message, binMsg: b.message },
      line: 0,
      pyLine: 0,
      message: '',
      kind: 'race',
      stats: { linear: l.stats.comparisons, binary: b.stats.comparisons },
    }
  })
}

function LinearVsBinary({ values, target }: { values: number[]; target: number }) {
  const trace = useMemo(() => raceTrace(values, target), [values, target])
  const player = usePlayer(trace)
  const { state, stats } = player.step

  return (
    <section className={s.compareSection} aria-labelledby="race-title">
      <h2 id="race-title">Linear Search vs Binary Search</h2>
      <p className={s.compareLead}>
        Both searches run on the same array and look for the same target ({target}). Linear Search
        checks one item at a time from the left. Binary Search jumps to the middle. Count the
        comparisons.
      </p>
      <div className={s.raceRows}>
        <div className={s.raceRow}>
          <div className={s.raceHeader}>
            <p className={s.raceTitle}>Linear Search</p>
            <span className={s.raceCount}>
              {stats.linear} <small>comparisons</small>
            </span>
          </div>
          <CellArray view={state.linear} size="sm" label="Linear Search" />
          <p className={s.raceMessage}>{state.linMsg}</p>
        </div>
        <div className={s.raceRow}>
          <div className={s.raceHeader}>
            <p className={s.raceTitle}>Binary Search</p>
            <span className={s.raceCount}>
              {stats.binary} <small>comparisons</small>
            </span>
          </div>
          <CellArray view={state.binary} size="sm" label="Binary Search" />
          <p className={s.raceMessage}>{state.binMsg}</p>
        </div>
      </div>
      <Controls player={player} keyboard={false} label="Comparison playback controls" />
      <BigArrays />
    </section>
  )
}

const BIG_SIZES = [1000, 1_000_000] as const

function BigArrays() {
  const [result, setResult] = useState<{
    n: number
    index: number
    linear: number
    binary: number
  } | null>(null)
  const run = (n: number) => {
    const index = Math.floor(Math.random() * n)
    setResult({ n, index, ...comparisonsFor(n, index) })
  }
  return (
    <div className={s.bigTry}>
      <p>
        <strong>Try a much bigger array.</strong> We pick a random item in a sorted array and count
        how many comparisons each search needs to find it (too many cells to draw, so you only see
        the counts).
      </p>
      <div className={s.inlineRow}>
        {BIG_SIZES.map((n) => (
          <Button key={n} size="small" variant="secondary" onClick={() => run(n)}>
            Try {n.toLocaleString('en-US')} items
          </Button>
        ))}
      </div>
      {result && (
        <div role="status">
          <dl className={s.bigResults}>
            <div className={s.bigResult}>
              <dt>Item to find</dt>
              <dd>#{(result.index + 1).toLocaleString('en-US')}</dd>
            </div>
            <div className={s.bigResult}>
              <dt>Linear Search</dt>
              <dd>{result.linear.toLocaleString('en-US')}</dd>
            </div>
            <div className={s.bigResult}>
              <dt>Binary Search</dt>
              <dd>{result.binary}</dd>
            </div>
          </dl>
          <p className={s.raceMessage}>
            In an array of {result.n.toLocaleString('en-US')} items Binary Search never needs more
            than {maxBinaryComparisons(result.n)} comparisons.
          </p>
        </div>
      )}
    </div>
  )
}
