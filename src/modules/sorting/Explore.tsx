import { useMemo, useState } from 'react'
import {
  ARRAY_PRESETS,
  parseNumberList,
  presetArray,
  type ArrayPreset,
} from '../../algorithms/shared'
import { SORT_ALGORITHM_IDS, SORT_ALGORITHMS } from '../../algorithms/sorting'
import { Button, Segmented } from '../../components/ui'
import { Controls, KeyboardHint } from '../../components/visualizers/Controls'
import {
  CodePanel,
  Legend,
  StatsPanel,
  StepMessage,
  Swatch,
  type LegendItem,
} from '../../components/visualizers/Panels'
import type { ModuleId } from '../../content/modules'
import type { SortAlgorithmId, SortOrder } from '../../engine/types'
import { usePlayer } from '../../engine/usePlayer'
import { sortOrderChanged } from '../../store/preferencesSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { DataTable, ExploreLayout, Field } from '../shared/lesson'
import { useMarkStageDone } from '../shared/useMarkStageDone'
import { Bars } from './Bars'
import { RaceMode } from './RaceMode'
import { ResultsChart } from './ResultsChart'
import s from './sorting.module.css'

const SORT_LEGEND: LegendItem[] = [
  { label: 'Comparing', swatch: <Swatch color="var(--state-compare)" symbol="▲" /> },
  { label: 'Swapping / writing', swatch: <Swatch color="var(--state-swap)" symbol="⇄" /> },
  { label: 'Sorted', swatch: <Swatch color="var(--state-sorted)" symbol="✓" /> },
  { label: 'Smallest so far', swatch: <Swatch color="var(--uwc-blue)" symbol="◆" /> },
  { label: 'Being merged', swatch: <Swatch color="#d9c6db" symbol="┆" /> },
  { label: 'Active section', swatch: <Swatch color="var(--state-active)" symbol="⌴" /> },
]

const DEFAULT_SIZE = 10

export default function Explore({ moduleId }: { moduleId: ModuleId }) {
  const dispatch = useAppDispatch()
  const order = useAppSelector((st) => st.preferences.sortOrder)
  const [algorithm, setAlgorithm] = useState<SortAlgorithmId>('bubble')
  const [preset, setPreset] = useState<ArrayPreset>('random')
  const [values, setValues] = useState(() => presetArray('random', DEFAULT_SIZE))
  const [custom, setCustom] = useState('')
  const [error, setError] = useState('')

  const algo = SORT_ALGORITHMS[algorithm]
  const trace = useMemo(() => algo.trace(values, order), [algo, values, order])
  const player = usePlayer(trace)
  const { state, stats } = player.step
  const max = Math.max(...values, 1)
  useMarkStageDone(moduleId, 'explore', player.isLast && player.total > 1)

  const regenerate = (p: ArrayPreset, size = values.length) => {
    setPreset(p)
    setError('')
    setValues(presetArray(p, size))
  }

  const applyCustom = () => {
    const parsed = parseNumberList(custom, { min: 1, max: 99, minLength: 2, maxLength: 32 })
    if ('error' in parsed) {
      setError(parsed.error)
      return
    }
    setError('')
    setValues(parsed.values)
  }

  const setup = (
    <>
      <Field label="Algorithm">
        <Segmented<SortAlgorithmId>
          label="Sorting algorithm"
          value={algorithm}
          onChange={setAlgorithm}
          options={SORT_ALGORITHM_IDS.map((id) => ({
            value: id,
            label: SORT_ALGORITHMS[id].name.replace(' Sort', ''),
          }))}
        />
      </Field>
      <Field label="Order">
        <Segmented<SortOrder>
          label="Sort order"
          value={order}
          onChange={(o) => dispatch(sortOrderChanged(o))}
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
        />
      </Field>
      <Field label="Number of values">
        <span className={s.sizeRow}>
          <input
            type="range"
            min={4}
            max={32}
            value={values.length}
            aria-label="Number of values"
            onChange={(e) => regenerate(preset, Number(e.target.value))}
          />
          <output>{values.length}</output>
        </span>
      </Field>
      <Field label="New array">
        <span className={s.presets}>
          {ARRAY_PRESETS.map((p) => (
            <Button
              key={p.id}
              size="small"
              variant={p.id === preset ? 'secondary' : 'ghost'}
              onClick={() => regenerate(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </span>
      </Field>
      <Field
        label="Your own values"
        hint={error ? <span className={s.error}>{error}</span> : '2–32 whole numbers from 1 to 99'}
      >
        <form
          className={s.customRow}
          onSubmit={(e) => {
            e.preventDefault()
            applyCustom()
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 5, 2, 9, 1"
            value={custom}
            aria-invalid={!!error}
            aria-label="Your own values, separated by commas"
            onChange={(e) => setCustom(e.target.value)}
          />
          <Button type="submit" size="small" variant="ghost">
            Use
          </Button>
        </form>
      </Field>
    </>
  )

  return (
    <ExploreLayout
      intro={
        <>
          Pick an algorithm and press play, or step through it one move at a time. Switching
          algorithms keeps the same array, so you can compare how each one works.
        </>
      }
      setup={setup}
      visual={<Bars state={state} max={max} order={order} />}
      legend={<Legend items={SORT_LEGEND} />}
      message={
        <StepMessage tone={player.isLast ? 'success' : undefined}>
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
          <StatsPanel
            items={[
              { label: 'Comparisons', value: stats.comparisons, emphasis: true },
              {
                label: algo.statLabels.moves,
                value: stats.moves,
                hint:
                  algo.statLabels.moves === 'Swaps'
                    ? 'Two values trade places'
                    : 'A value is written into a position',
              },
              {
                label: 'Operations',
                value: stats.operations,
                hint: `Comparisons + ${algo.statLabels.moves.toLowerCase()}`,
              },
              { label: 'Step', value: `${player.index + 1} / ${player.total}` },
              {
                label: 'Time (average)',
                value: algo.complexity.average,
                hint: `Best ${algo.complexity.best}, worst ${algo.complexity.worst}`,
              },
            ]}
          />
          <CodePanel
            listing={algo.code}
            line={player.step.line}
            pyLine={player.step.pyLine}
            title={algo.name}
          />
        </>
      }
      below={
        <>
          <section className={s.belowSection} aria-labelledby="race-title">
            <h2 id="race-title">Race two algorithms</h2>
            <p>
              Both algorithms sort the same array. Each press of a button moves both one step, so
              you can see which one needs fewer steps to finish.
            </p>
            <RaceMode values={values} order={order} max={max} />
          </section>
          <section className={s.belowSection} aria-labelledby="results-title">
            <h2 id="results-title">How much work does each algorithm do?</h2>
            <p>
              The total number of comparisons and swaps/writes each algorithm needs for your current
              array of {values.length} values. Try the presets: a nearly sorted array changes the
              picture a lot.
            </p>
            <ResultsChart values={values} order={order} />
          </section>
          <section className={s.belowSection} aria-labelledby="complexity-title">
            <h2 id="complexity-title">Time complexity</h2>
            <p>How the work grows as the array gets bigger (n is the number of values).</p>
            <DataTable
              head={['Algorithm', 'Best case', 'Average case', 'Worst case', 'Extra memory']}
              rows={SORT_ALGORITHM_IDS.map((id) => {
                const c = SORT_ALGORITHMS[id].complexity
                return [SORT_ALGORITHMS[id].name, c.best, c.average, c.worst, c.space]
              })}
            />
          </section>
        </>
      }
    />
  )
}
