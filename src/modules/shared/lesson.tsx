/**
 * Shared building blocks for lesson stages, so all three lessons look and behave the same.
 *
 * Learn:    <LearnPage> → <LessonSection>s → <Figure>, <CheckYourself>, <Callout> … → <LearnEnd>
 * Explore:  <ExploreLayout ... /> + useMarkStageDone(moduleId, 'explore', player.isLast) from ./useMarkStageDone
 * Practice: <PracticeRunner moduleId exercises /> (components/exercises/ExerciseShell)
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button } from '../../components/ui'
import { cx } from '../../components/ui/cx'
import type { ModuleId } from '../../content/modules'
import { REFERENCES, type Reference, type ReferenceGroup } from '../../content/references'
import { useMarkStageDone } from './useMarkStageDone'
import s from './lesson.module.css'

/* ------------------------------ Learn page ------------------------------ */

type LearnCtx = { register: (id: string) => void; answered: (id: string) => void }
const LearnContext = createContext<LearnCtx | null>(null)

/**
 * Wraps a Learn stage. Learn counts as done when the student has reached the end of the page
 * and answered every "Check yourself" question on it (right or wrong).
 */
export function LearnPage({
  moduleId,
  intro,
  toc,
  children,
}: {
  moduleId: ModuleId
  /** One or two sentences under the stage title. */
  intro: ReactNode
  /** Section anchors for the "On this page" list: [id, label]. */
  toc?: [string, string][]
  children: ReactNode
}) {
  const [questions, setQuestions] = useState<Set<string>>(new Set())
  const [answers, setAnswers] = useState<Set<string>>(new Set())
  const [reachedEnd, setReachedEnd] = useState(false)
  const register = useCallback((id: string) => setQuestions((q) => new Set(q).add(id)), [])
  const answered = useCallback((id: string) => setAnswers((a) => new Set(a).add(id)), [])
  const allAnswered = [...questions].every((q) => answers.has(q))
  useMarkStageDone(moduleId, 'learn', reachedEnd && allAnswered)
  const ctx = useMemo(() => ({ register, answered }), [register, answered])

  return (
    <LearnContext.Provider value={ctx}>
      <div className={`container ${s.learn}`}>
        <div className={s.learnMain}>
          <p className={s.stageIntro}>{intro}</p>
          {children}
          <ReferenceList id="references" groups={REFERENCES[moduleId]} />
          <EndMarker onReach={() => setReachedEnd(true)} />
          {reachedEnd && !allAnswered && (
            <p className={s.endHint} role="status">
              Answer the “Check yourself” questions above to complete this stage.
            </p>
          )}
        </div>
        {toc && toc.length > 0 && (
          <nav className={s.toc} aria-label="On this page">
            <p className={s.tocTitle}>On this page</p>
            <ol>
              {[...toc, ['references', 'References'] as [string, string]].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </LearnContext.Provider>
  )
}

function EndMarker({ onReach }: { onReach: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      onReach()
      return
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) onReach()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [onReach])
  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />
}

/** "References and further reading" block: grouped list of sources with links. */
export function ReferenceList({
  id,
  groups,
  title = 'References and further reading',
}: {
  id: string
  groups: ReferenceGroup[]
  title?: string
}) {
  return (
    <section id={id} className={cx(s.section, s.references)} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className={s.sectionTitle}>
        {title}
      </h2>
      {groups.map((g) => (
        <div key={g.heading} className={s.refGroup}>
          <h3 className={s.refHeading}>{g.heading}</h3>
          <ul className={s.refList}>
            {g.items.map((r) => (
              <ReferenceItem key={r.title} reference={r} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function ReferenceItem({ reference: r }: { reference: Reference }) {
  return (
    <li className={s.refItem}>
      <span className={s.refTitle}>
        {r.url ? (
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            {r.title}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <cite>{r.title}</cite>
        )}
      </span>
      <span className={s.refSource}>{r.source}</span>
      <span className={s.refNote}>{r.note}</span>
    </li>
  )
}

/** A titled part of a Learn page. `id` is used for the "On this page" links. */
export function LessonSection({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string
  title: ReactNode
  eyebrow?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      {eyebrow && <p className={s.sectionEyebrow}>{eyebrow}</p>}
      <h2 id={`${id}-h`} className={s.sectionTitle}>
        {title}
      </h2>
      <div className={s.prose}>{children}</div>
    </section>
  )
}

/** Smaller heading inside a section (e.g. one per algorithm). */
export function SubSection({
  id,
  title,
  children,
}: {
  id?: string
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div id={id} className={s.subSection}>
      <h3 className={s.subTitle}>{title}</h3>
      {children}
    </div>
  )
}

/** An illustration (inline SVG or step frames) with a caption. */
export function Figure({
  children,
  caption,
  wide,
}: {
  children: ReactNode
  caption?: ReactNode
  wide?: boolean
}) {
  return (
    <figure className={cx(s.figure, wide && s.figureWide)}>
      <div className={s.figureBody}>{children}</div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  )
}

/** Horizontal row of small step frames for illustrated walkthroughs. */
export function StepFrames({
  frames,
}: {
  frames: { label: ReactNode; body: ReactNode; note?: ReactNode }[]
}) {
  return (
    <ol className={s.frames}>
      {frames.map((f, i) => (
        <li key={i} className={s.frame}>
          <p className={s.frameLabel}>{f.label}</p>
          <div className={s.frameBody}>{f.body}</div>
          {f.note && <p className={s.frameNote}>{f.note}</p>}
        </li>
      ))}
    </ol>
  )
}

/** A grid of real-world example cards (title + one sentence). */
export function ExampleGrid({ items }: { items: { title: ReactNode; text: ReactNode }[] }) {
  return (
    <ul className={s.examples}>
      {items.map((it, i) => (
        <li key={i} className={s.example}>
          <div>
            <p className={s.exampleTitle}>{it.title}</p>
            <p className={s.exampleText}>{it.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Simple table for complexity comparisons. */
export function DataTable({
  caption,
  head,
  rows,
}: {
  caption?: ReactNode
  head: ReactNode[]
  rows: ReactNode[][]
}) {
  return (
    <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Table">
      <table className={s.table}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={j}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Pseudocode/Python block with short notes on important lines. */
export function AnnotatedCode({
  children,
  notes,
}: {
  /** Usually a <CodeBlock/> or <CodePanel/>. */
  children: ReactNode
  notes: { line: ReactNode; text: ReactNode }[]
}) {
  return (
    <div className={s.annotated}>
      {children}
      <dl className={s.notes}>
        {notes.map((n, i) => (
          <div key={i}>
            <dt>{n.line}</dt>
            <dd>{n.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * Quick inline question inside a Learn page. Not graded or stored per question; answering it
 * (right or wrong) counts toward completing the Learn stage.
 */
export function CheckYourself({
  question,
  options,
  correct,
  explanation,
}: {
  question: ReactNode
  options: string[]
  /** Index of the correct option. */
  correct: number
  explanation: ReactNode
}) {
  const id = useId()
  const ctx = useContext(LearnContext)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  useEffect(() => ctx?.register(id), [ctx, id])

  const right = picked === correct
  return (
    <div className={s.check} role="group" aria-labelledby={`${id}-q`}>
      <p className={s.checkTitle}>Check yourself</p>
      <p id={`${id}-q`} className={s.checkQuestion}>
        {question}
      </p>
      <div className={s.checkOptions}>
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            aria-pressed={picked === i}
            disabled={checked}
            className={cx(
              s.checkOption,
              picked === i && s.checkPicked,
              checked && i === correct && s.checkRight,
              checked && picked === i && !right && s.checkWrong,
            )}
            onClick={() => setPicked(i)}
          >
            {checked && i === correct && <span aria-hidden="true">✓ </span>}
            {checked && picked === i && !right && <span aria-hidden="true">✗ </span>}
            {o}
          </button>
        ))}
      </div>
      {!checked ? (
        <Button
          size="small"
          disabled={picked === null}
          onClick={() => {
            setChecked(true)
            ctx?.answered(id)
          }}
        >
          Check
        </Button>
      ) : (
        <div
          className={cx(s.checkFeedback, right ? s.checkFeedbackRight : s.checkFeedbackWrong)}
          role="status"
        >
          <strong>{right ? 'Correct! ' : 'Not quite. '}</strong>
          {explanation}{' '}
          {!right && (
            <button
              type="button"
              className={s.linkButton}
              onClick={() => {
                setChecked(false)
                setPicked(null)
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Explore page ------------------------------ */

/**
 * Standard Explore layout. Desktop: visual + controls + message on the left, code and stats on
 * the right. Mobile: everything stacked, visual first.
 */
export function ExploreLayout({
  intro,
  setup,
  visual,
  legend,
  controls,
  message,
  side,
  below,
}: {
  intro?: ReactNode
  /** Inputs: algorithm picker, array size, presets, custom values… */
  setup: ReactNode
  visual: ReactNode
  legend?: ReactNode
  controls: ReactNode
  message: ReactNode
  /** Code panel, stats panel. */
  side: ReactNode
  /** Extra sections under the playground (comparisons, tables). */
  below?: ReactNode
}) {
  return (
    <div className={`container ${s.explore}`}>
      {intro && <p className={s.stageIntro}>{intro}</p>}
      <div className={s.setup}>{setup}</div>
      <div className={s.playground}>
        <div className={s.stageArea}>
          <div className={s.visual}>{visual}</div>
          {legend}
          {message}
          {controls}
        </div>
        <div className={s.side}>{side}</div>
      </div>
      {below && <div className={s.below}>{below}</div>}
    </div>
  )
}

/** Labeled input group for the Explore setup bar. */
export function Field({
  label,
  children,
  hint,
}: {
  label: ReactNode
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      {children}
      {hint && <span className={s.fieldHint}>{hint}</span>}
    </div>
  )
}

/** Practice intro paragraph, for consistency across lessons. */
export function PracticeIntro({ children }: { children: ReactNode }) {
  return (
    <div className="container">
      <p className={s.stageIntro}>{children}</p>
    </div>
  )
}
