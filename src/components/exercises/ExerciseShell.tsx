import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ModuleId } from '../../content/modules'
import { exerciseAttempted, stageCompleted } from '../../store/progressSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { Button, Chip } from '../ui'
import { cx } from '../ui/cx'
import s from './exercises.module.css'

export type Verdict = {
  correct: boolean
  /** 0–1. Defaults to 1 when correct, 0 when not. */
  score?: number
  /** Why the answer is right or wrong. Always shown. */
  explanation: ReactNode
}

export type ExerciseRenderProps = {
  /** Call once the student submits. Locks the input until they retry. */
  submit: (v: Verdict) => void
  /** True after submitting: inputs should be read-only and show right/wrong marks. */
  locked: boolean
  /** True when the solution is being revealed. Formats should show the correct answer. */
  revealed: boolean
  /** Changes on every retry. Use it as a seed to generate a fresh variant. */
  attempt: number
}

export type ExerciseDef = {
  id: string
  title: string
  format: string
  instructions: ReactNode
  render: (p: ExerciseRenderProps) => ReactNode
  /** Shown after 2 failed attempts, or when the student asks. */
  solution?: ReactNode
}

type Status = 'answering' | 'correct' | 'incorrect'

const FAILS_BEFORE_SOLUTION = 2

export function ExerciseShell({
  moduleId,
  def,
  number,
  total,
  onNext,
  fails = 0,
  onFail,
}: {
  moduleId: ModuleId
  def: ExerciseDef
  number: number
  total: number
  onNext?: () => void
  /** Wrong answers so far on this exercise. Kept by the runner so it survives switching. */
  fails?: number
  onFail?: () => void
}) {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<Status>('answering')
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [revealed, setRevealed] = useState(false)
  // Used when the shell is rendered on its own (no runner keeping count).
  const [localFails, setLocalFails] = useState(0)
  const failCount = onFail ? fails : localFails
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'answering') feedbackRef.current?.focus()
  }, [status])

  const submit = (v: Verdict) => {
    if (status !== 'answering') return
    const score = v.score ?? (v.correct ? 1 : 0)
    setVerdict(v)
    setStatus(v.correct ? 'correct' : 'incorrect')
    if (!v.correct) {
      if (onFail) onFail()
      else setLocalFails((f) => f + 1)
    }
    dispatch(
      exerciseAttempted({ module: moduleId, exerciseId: def.id, score, completed: v.correct }),
    )
  }

  const retry = () => {
    setStatus('answering')
    setVerdict(null)
    setRevealed(false)
    setAttempt((a) => a + 1)
  }

  const canReveal = !!def.solution && status === 'incorrect' && failCount >= FAILS_BEFORE_SOLUTION

  return (
    <article className={s.exercise} aria-labelledby={`${def.id}-title`}>
      <header className={s.header}>
        <div className={s.headerTop}>
          <span className={s.counter}>
            Exercise {number} of {total}
          </span>
          <Chip tone="outline">{def.format}</Chip>
        </div>
        <h3 id={`${def.id}-title`} className={s.title}>
          {def.title}
        </h3>
        <div className={s.instructions}>{def.instructions}</div>
      </header>

      <div className={s.body} key={attempt}>
        {def.render({ submit, locked: status !== 'answering', revealed, attempt })}
      </div>

      {verdict && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={cx(s.feedback, verdict.correct ? s.feedbackCorrect : s.feedbackIncorrect)}
          role="status"
        >
          <p className={s.feedbackTitle}>
            <span aria-hidden="true">{verdict.correct ? '✓' : '✗'}</span>{' '}
            {verdict.correct ? 'Correct!' : 'Not quite.'}
            {verdict.score !== undefined && verdict.score > 0 && verdict.score < 1 && (
              <span className={s.score}> Score: {Math.round(verdict.score * 100)}%</span>
            )}
          </p>
          <div>{verdict.explanation}</div>
        </div>
      )}

      {revealed && def.solution && (
        <div className={s.solution}>
          <p className={s.feedbackTitle}>Solution</p>
          {def.solution}
        </div>
      )}

      <footer className={s.actions}>
        {status !== 'answering' && (
          <Button variant={status === 'correct' ? 'ghost' : 'primary'} onClick={retry}>
            {status === 'correct' ? 'Try another one' : 'Try again'}
          </Button>
        )}
        {canReveal && !revealed && (
          <Button variant="secondary" onClick={() => setRevealed(true)}>
            Show solution
          </Button>
        )}
        {status === 'answering' &&
          failCount > 0 &&
          failCount < FAILS_BEFORE_SOLUTION &&
          def.solution && (
            <span className={s.hintText}>
              The solution unlocks after {FAILS_BEFORE_SOLUTION} tries.
            </span>
          )}
        {onNext && status !== 'answering' && (
          <Button
            variant={status === 'correct' ? 'primary' : 'ghost'}
            onClick={onNext}
            className={s.next}
          >
            {number < total ? 'Next exercise →' : 'Finish practice →'}
          </Button>
        )}
      </footer>
    </article>
  )
}

/** One exercise at a time, with a navigator. Marks Practice done once every exercise is attempted. */
export function PracticeRunner({
  moduleId,
  exercises,
}: {
  moduleId: ModuleId
  exercises: ExerciseDef[]
}) {
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(false)
  const [fails, setFails] = useState<Record<string, number>>({})
  const records = useAppSelector((st) => st.progress.modules[moduleId].exercises)
  const dispatch = useAppDispatch()
  const topRef = useRef<HTMLDivElement>(null)

  const allAttempted = exercises.every((e) => (records[e.id]?.attempts ?? 0) > 0)
  useEffect(() => {
    if (allAttempted) dispatch(stageCompleted({ module: moduleId, stage: 'practice' }))
  }, [allAttempted, dispatch, moduleId])

  const go = (i: number) => {
    setFinished(false)
    setCurrent(i)
    topRef.current?.scrollIntoView?.({ block: 'start' })
  }

  const solved = exercises.filter((e) => records[e.id]?.completed).length

  return (
    <div ref={topRef} className={s.runner}>
      <nav aria-label="Exercises" className={s.navigator}>
        <ol>
          {exercises.map((e, i) => {
            const r = records[e.id]
            const state = r?.completed ? 'solved' : r?.attempts ? 'tried' : 'new'
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className={cx(
                    s.navItem,
                    s[`nav-${state}`],
                    i === current && !finished && s.navCurrent,
                  )}
                  aria-current={i === current && !finished ? 'step' : undefined}
                  onClick={() => go(i)}
                >
                  <span className={s.navDot} aria-hidden="true">
                    {state === 'solved' ? '✓' : i + 1}
                  </span>
                  <span className={s.navLabel}>{e.title}</span>
                  <span className="visually-hidden">
                    {state === 'solved' ? '(solved)' : state === 'tried' ? '(attempted)' : ''}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className={s.navSummary}>
          {solved} / {exercises.length} solved
        </p>
      </nav>

      {finished ? (
        <div className={s.finished} role="status">
          <h3>Practice complete</h3>
          <p>
            You solved {solved} of {exercises.length} exercises. You can retry any of them to
            improve your score; every retry gives you a fresh problem where possible.
          </p>
          <Button onClick={() => go(0)}>Start again from exercise 1</Button>
        </div>
      ) : (
        <ExerciseShell
          key={exercises[current].id}
          fails={fails[exercises[current].id] ?? 0}
          onFail={() => {
            const id = exercises[current].id
            setFails((f) => ({ ...f, [id]: (f[id] ?? 0) + 1 }))
          }}
          moduleId={moduleId}
          def={exercises[current]}
          number={current + 1}
          total={exercises.length}
          onNext={() => (current < exercises.length - 1 ? go(current + 1) : setFinished(true))}
        />
      )}
    </div>
  )
}
