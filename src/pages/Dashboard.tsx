import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink, Chip, ProgressBar } from '../components/ui'
import { MODULE_IDS, MODULES, STAGE_IDS, STAGE_LABELS } from '../content/modules'
import { SITE } from '../content/site'
import { AuthorAvatar } from '../illustrations/BrandMark'
import { HeroPreview, ModuleArt } from '../illustrations/ModuleArt'
import { progressReset } from '../store/progressSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectContinueTarget,
  selectModuleStatuses,
  selectOverallProgress,
} from '../store/selectors'
import s from './dashboard.module.css'

function Hero() {
  const overall = useAppSelector(selectOverallProgress)
  const target = useAppSelector(selectContinueTarget)
  const last = useAppSelector((st) => st.progress.last)
  const started = overall.stagesDone > 0 || last !== null
  return (
    <section className={s.hero}>
      <div className={`container ${s.heroGrid}`}>
        <div className={s.heroText}>
          <p className={s.byline}>
            <AuthorAvatar size={32} />
            <span>
              A teaching demo by <strong>{SITE.author}</strong>
            </span>
          </p>
          <h1 className={s.heroTitle}>
            Computer science you can <span className={s.highlight}>see</span> and{' '}
            <span className={s.highlight}>try</span>.
          </h1>
          <p className={s.heroLead}>
            {SITE.name} is a set of short, interactive lessons on sorting, binary search and
            recursion. Students predict what an algorithm will do, watch it run step by step, and
            then run it themselves.
          </p>
          <div className={s.heroActions}>
            {started ? (
              <ButtonLink to={`/${target.module}/${target.stage}`}>
                Continue: {MODULES[target.module].short} · {STAGE_LABELS[target.stage]}
              </ButtonLink>
            ) : (
              <ButtonLink to="/sorting/learn">Start the first lesson</ButtonLink>
            )}
            <ButtonLink to="/about" variant="ghost">
              Why I built this
            </ButtonLink>
          </div>
          <ul className={s.facts} aria-label="At a glance">
            <li>3 lessons</li>
            <li>15 exercises</li>
            <li>No sign-up</li>
            <li>Works on phones</li>
          </ul>
        </div>
        <div className={s.heroVisual}>
          <HeroPreview />
        </div>
      </div>
    </section>
  )
}

function ModuleCards() {
  const statuses = useAppSelector(selectModuleStatuses)
  const stages = useAppSelector((st) => st.progress.modules)
  const last = useAppSelector((st) => st.progress.last)
  return (
    <section className={`container ${s.section}`} aria-labelledby="modules-title">
      <p className="eyebrow">Lessons</p>
      <h2 id="modules-title">Three big ideas, one way of learning</h2>
      <p className={`reading ${s.sectionLead}`}>
        Every lesson follows the same path: <strong>Learn</strong> the idea,{' '}
        <strong>Explore</strong> it in an interactive playground, then <strong>Practice</strong>{' '}
        with exercises that explain every answer.
      </p>
      <div className={s.cards}>
        {MODULE_IDS.map((id, n) => {
          const meta = MODULES[id]
          const st = statuses[id]
          const resume =
            last?.module === id
              ? last.stage
              : (STAGE_IDS.find((x) => stages[id].stages[x] !== 'done') ?? 'learn')
          return (
            <article
              key={id}
              className={s.card}
              style={{ '--module-color': meta.colorVar } as React.CSSProperties}
            >
              <div className={s.cardArt}>
                <ModuleArt id={id} />
              </div>
              <div className={s.cardBody}>
                <div className={s.cardMeta}>
                  <span>
                    Lesson {n + 1} · {meta.minutes} min
                  </span>
                  {st.completed ? (
                    <Chip tone="success">✓ Completed</Chip>
                  ) : st.started ? (
                    <Chip tone="ib">In progress</Chip>
                  ) : null}
                </div>
                <h3 className={s.cardTitle}>{meta.title}</h3>
                <p className={s.cardText}>{meta.description}</p>
                <ol className={s.cardStages} aria-label="Stages">
                  {STAGE_IDS.map((x) => (
                    <li key={x} data-status={stages[id].stages[x]}>
                      <span aria-hidden="true">{stages[id].stages[x] === 'done' ? '✓' : '○'}</span>{' '}
                      {STAGE_LABELS[x]}
                      <span className="visually-hidden">
                        {stages[id].stages[x] === 'done' ? ' (completed)' : ''}
                      </span>
                    </li>
                  ))}
                </ol>
                {st.started && (
                  <ProgressBar
                    value={st.stagesDone / STAGE_IDS.length}
                    label={`${meta.title} progress`}
                  />
                )}
                <ButtonLink
                  to={`/${id}/${resume}`}
                  variant={st.started ? 'primary' : 'secondary'}
                  className={s.cardButton}
                >
                  {st.completed ? 'Review lesson' : st.started ? 'Continue' : 'Start lesson'} →
                </ButtonLink>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function OverallProgress() {
  const o = useAppSelector(selectOverallProgress)
  const dispatch = useAppDispatch()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <section className={`container ${s.section}`} aria-labelledby="progress-title">
      <div className={s.progressPanel}>
        <div>
          <p className="eyebrow">Your progress</p>
          <h2 id="progress-title" className={s.progressTitle}>
            {o.percent}% complete
          </h2>
          <ProgressBar value={o.percent / 100} label="Overall progress" />
          <p className={s.progressNote}>Saved in this browser only. No account needed.</p>
        </div>
        <dl className={s.progressStats}>
          <div>
            <dt>Lessons completed</dt>
            <dd>
              {o.modulesCompleted}/{o.modulesTotal}
            </dd>
          </div>
          <div>
            <dt>Stages completed</dt>
            <dd>
              {o.stagesDone}/{o.stagesTotal}
            </dd>
          </div>
          <div>
            <dt>Exercises solved</dt>
            <dd>
              {o.exercisesCompleted}/{o.exercisesTotal}
            </dd>
          </div>
        </dl>
        <div className={s.resetRow}>
          {confirming ? (
            <>
              <span>Delete all saved progress in this browser?</span>
              <Button
                size="small"
                onClick={() => {
                  dispatch(progressReset())
                  setConfirming(false)
                  setMessage('Progress reset.')
                }}
              >
                Yes, reset
              </Button>
              <Button size="small" variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="small" variant="ghost" onClick={() => setConfirming(true)}>
              Reset progress
            </Button>
          )}
          <span role="status" className={s.resetMessage}>
            {message}
          </span>
        </div>
      </div>
    </section>
  )
}

function TeachersCorner() {
  return (
    <section className={`container ${s.section}`}>
      <div className={s.teachers}>
        <div>
          <p className="eyebrow">For teachers</p>
          <h2 className={s.teachersTitle}>Using CS Playground in class</h2>
          <p>
            Lesson plans, learning objectives, common misconceptions and discussion questions for
            each lesson, linked to the IB Diploma Programme Computer Science course.
          </p>
        </div>
        <ButtonLink to="/teachers" variant="secondary">
          Open teacher notes →
        </ButtonLink>
      </div>
      <p className={s.aside}>
        Curious how it works? Read <Link to="/about">about this demo</Link> or browse the{' '}
        <a href={SITE.github} target="_blank" rel="noreferrer">
          source code
        </a>
        .
      </p>
    </section>
  )
}

export function Dashboard() {
  useEffect(() => {
    document.title = `${SITE.name} · a teaching demo by ${SITE.author}`
  }, [])
  return (
    <>
      <Hero />
      <ModuleCards />
      <OverallProgress />
      <TeachersCorner />
    </>
  )
}
