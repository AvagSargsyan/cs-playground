import { useEffect, useRef, useState } from 'react'
import type { ExerciseRenderProps } from '../../../components/exercises/ExerciseShell'
import { Button } from '../../../components/ui'
import { cx } from '../../../components/ui/cx'
import { MiniBars } from '../MiniBars'
import type { SortState } from '../types'
import { makeManualTask, type ManualDecision, type ManualMode } from './generators'
import { PickBar } from './PickBars'
import s from '../sorting.module.css'
import ex from '../../../components/exercises/exercises.module.css'

const MODES: ManualMode[] = ['bubble', 'selection', 'insertion']

const NAMES: Record<ManualMode, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
}

const INSTRUCTIONS: Record<ManualMode, string> = {
  bubble: 'For each pair of orange neighbours (▲), decide: swap them or keep them?',
  selection:
    'For each pass, click the smallest value in the unsorted part. It will be swapped to the front of the unsorted part.',
  insertion:
    'The key (shown above the bars) must go into the sorted section on the left. Click the position where the key belongs.',
}

/** Message for a decision, shown after the student answers it. */
function explain(d: ManualDecision, ok: boolean): string {
  const v = d.state.values
  if (d.kind === 'swap-or-keep') {
    const [a, b] = d.state.comparing!.map((i) => v[i])
    return d.swap
      ? `${ok ? 'Right: ' : 'Not quite: '}${a} > ${b}, so they must be swapped.`
      : `${ok ? 'Right: ' : 'Not quite: '}${a} < ${b}, so they stay where they are.`
  }
  if (d.kind === 'pick-min') {
    return `${ok ? 'Right: ' : 'Not quite: '}the smallest unsorted value is ${v[d.answer]}.`
  }
  return `${ok ? 'Right: ' : 'Not quite: '}the key ${d.state.key!.value} belongs at position ${d.answer}.`
}

export function Manual({ submit, locked, attempt }: ExerciseRenderProps) {
  const mode = MODES[attempt % MODES.length]
  const [task] = useState(() => makeManualTask(mode))
  const [index, setIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [shown, setShown] = useState<SortState>(task.decisions[0]?.state ?? task.final)
  const sent = useRef(false)

  const total = task.decisions.length
  const finished = index >= total
  const decision = task.decisions[index]
  const max = Math.max(...task.values)

  useEffect(() => {
    if (!finished || sent.current) return
    sent.current = true
    const score = total ? (total - mistakes) / total : 1
    submit({
      correct: score >= 0.8,
      score,
      explanation: (
        <p>
          You made {total - mistakes} of {total} decisions correctly. {NAMES[mode]} needs exactly
          these decisions to sort [{task.values.join(', ')}]
          {score < 0.8 ? '. Aim for at least 80% to complete this exercise.' : '.'}
        </p>
      ),
    })
  }, [finished, mistakes, mode, submit, task.values, total])

  const answer = (ok: boolean) => {
    if (!ok) setMistakes((m) => m + 1)
    setFeedback({ ok, text: explain(decision, ok) })
    const next = task.decisions[index + 1]
    setShown(next ? next.state : task.final)
    setIndex((i) => i + 1)
  }

  return (
    <div>
      <p className={s.question}>
        Sort [{task.values.join(', ')}] with <strong>{NAMES[mode]}</strong>. {INSTRUCTIONS[mode]}
      </p>
      <p className={s.progressLine}>
        {finished ? 'All decisions made.' : `Decision ${index + 1} of ${total}`} · mistakes:{' '}
        {mistakes}
      </p>

      {finished || !decision || decision.kind === 'swap-or-keep' ? (
        <div>
          {shown.key && <p className={s.question}>Key: {shown.key.value}</p>}
          <div className={s.manualBars}>
            <MiniBars state={shown} max={max} />
          </div>
          {!finished && !locked && (
            <div className={s.decision}>
              <Button onClick={() => answer(decision.kind === 'swap-or-keep' && decision.swap)}>
                Swap them
              </Button>
              <Button
                variant="ghost"
                onClick={() => answer(decision.kind === 'swap-or-keep' && !decision.swap)}
              >
                Keep them
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {decision.state.key && (
            <p className={s.question}>
              Key: <strong>{decision.state.key.value}</strong>
            </p>
          )}
          <div className={ex.selectItems} role="group" aria-label="Values">
            {decision.state.values.map((_, i) => {
              const allowed =
                decision.kind === 'pick-min'
                  ? i >= decision.state.activeRange![0]
                  : i <= decision.state.key!.from
              return (
                <button
                  key={i}
                  type="button"
                  className={cx(ex.selectItem)}
                  disabled={!allowed || locked}
                  aria-label={`Position ${i}, value ${decision.state.values[i]}`}
                  onClick={() => answer(i === decision.answer)}
                >
                  <PickBar state={decision.state} index={i} max={max} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {feedback && (
        <p className={cx(s.moveFeedback, feedback.ok ? s.moveRight : s.moveWrong)} role="status">
          <span aria-hidden="true">{feedback.ok ? '✓ ' : '✗ '}</span>
          {feedback.text}
          {!feedback.ok && !finished && ' I did that move for you; carry on.'}
        </p>
      )}
    </div>
  )
}
