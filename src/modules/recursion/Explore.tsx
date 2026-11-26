import { useMemo, useState } from 'react'
import {
  MAX_RECURSION_INPUT,
  MIN_RECURSION_INPUT,
  RECURSION_EXAMPLES,
} from '../../algorithms/recursion'
import { Controls, KeyboardHint } from '../../components/visualizers/Controls'
import {
  CodePanel,
  Legend,
  StatsPanel,
  StepMessage,
  Swatch,
} from '../../components/visualizers/Panels'
import { Callout, Segmented } from '../../components/ui'
import type { ModuleId } from '../../content/modules'
import type { RecursionExampleId } from '../../engine/types'
import { usePlayer } from '../../engine/usePlayer'
import { ExploreLayout, Field } from '../shared/lesson'
import { useMarkStageDone } from '../shared/useMarkStageDone'
import { CallStack } from './CallStack'
import { STATUS_META } from './frameStatus'
import s from './recursion.module.css'

const INPUTS = Array.from(
  { length: MAX_RECURSION_INPUT - MIN_RECURSION_INPUT + 1 },
  (_, i) => MIN_RECURSION_INPUT + i,
)

export default function Explore({ moduleId }: { moduleId: ModuleId }) {
  const [exampleId, setExampleId] = useState<RecursionExampleId>('countdown')
  const [inputs, setInputs] = useState<Record<RecursionExampleId, number>>({
    countdown: RECURSION_EXAMPLES.countdown.defaultInput,
    factorial: RECURSION_EXAMPLES.factorial.defaultInput,
  })
  const example = RECURSION_EXAMPLES[exampleId]
  const n = inputs[exampleId]
  const trace = useMemo(() => example.trace(n), [example, n])
  const player = usePlayer(trace)
  useMarkStageDone(moduleId, 'explore', player.isLast)

  const { state, stats } = player.step
  const active = state.stack.find((f) => f.id === state.activeId)
  const isCountdown = exampleId === 'countdown'
  const finished = player.step.kind === 'done'

  return (
    <ExploreLayout
      intro={
        <>
          Pick an example and an input, then step through it. Watch each call add a frame to the
          call stack, and see the frames come off again as the calls return.
        </>
      }
      setup={
        <>
          <Field label="Example">
            <Segmented<RecursionExampleId>
              label="Example"
              value={exampleId}
              onChange={setExampleId}
              options={[
                { value: 'countdown', label: 'Countdown' },
                { value: 'factorial', label: 'Factorial' },
              ]}
            />
          </Field>
          <Field label={`Input n (${MIN_RECURSION_INPUT}–${MAX_RECURSION_INPUT})`}>
            <Segmented<number>
              label="Input n"
              value={n}
              onChange={(v) => setInputs((prev) => ({ ...prev, [exampleId]: v }))}
              options={INPUTS.map((v) => ({ value: v, label: String(v) }))}
            />
          </Field>
          <p className={s.setupIdea}>{example.idea}</p>
        </>
      }
      visual={
        <div className={s.exploreVisual}>
          <CallStack stack={state.stack} activeId={state.activeId} />
          {isCountdown ? (
            <div className={s.console} role="group" aria-label="Printed output">
              <p className={s.consoleTitle}>Output</p>
              <pre className={s.consoleBody}>
                {state.output.length ? state.output.join('\n') : ' '}
              </pre>
            </div>
          ) : (
            <div className={s.result}>
              <p className={s.consoleTitle}>Result</p>
              <p className={s.resultValue}>
                {finished ? (
                  <>
                    {n}! = {state.lastReturn}
                  </>
                ) : (
                  <>{n}! = ?</>
                )}
              </p>
              <p className={s.resultHint}>
                {finished
                  ? 'Every waiting multiplication has been worked out.'
                  : 'The answer appears once every call has returned.'}
              </p>
            </div>
          )}
        </div>
      }
      legend={
        <Legend
          items={[
            {
              label: 'Running',
              swatch: <Swatch color="var(--uwc-blue)" symbol={STATUS_META.calling.icon} />,
            },
            {
              label: 'Waiting for a call',
              swatch: <Swatch color="var(--ink-muted)" symbol={STATUS_META.waiting.icon} />,
            },
            {
              label: 'Base case',
              swatch: <Swatch color="var(--state-base)" symbol={STATUS_META['base-case'].icon} />,
            },
            {
              label: 'Returning',
              swatch: <Swatch color="var(--tile-purple)" symbol={STATUS_META.returning.icon} />,
            },
          ]}
        />
      }
      message={
        <StepMessage tone={finished ? 'success' : undefined}>{player.step.message}</StepMessage>
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
            listing={example.code}
            line={player.step.line}
            pyLine={player.step.pyLine}
            title={`${example.name} code`}
          />
          <StatsPanel
            items={[
              {
                label: 'Current call',
                value: active ? `${active.fn}(${active.arg})` : '—',
                emphasis: true,
              },
              {
                label: 'Stack depth',
                value: stats.depth,
                hint: 'How many calls are on the stack right now',
              },
              { label: 'Calls so far', value: stats.calls },
              {
                label: 'Return value',
                value: isCountdown ? 'none' : (state.lastReturn ?? '—'),
                hint: isCountdown
                  ? 'Countdown prints instead of returning a value'
                  : 'The value most recently returned by a call',
              },
            ]}
          />
        </>
      }
      below={
        <Callout kind="predict" title="Try this">
          <ul>
            <li>Set n to 0. How many calls happen? Why is that the shortest possible run?</li>
            <li>
              Before you press play on factorial(5), predict the deepest the stack will get. Check
              it with the stack depth counter.
            </li>
            <li>
              In countdown, the output is printed on the way <em>down</em>. In factorial, the answer
              is built on the way <em>back up</em>. Find the step where that happens.
            </li>
          </ul>
        </Callout>
      }
    />
  )
}
