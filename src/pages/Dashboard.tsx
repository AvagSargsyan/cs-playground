import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink, Chip, ProgressBar } from '../components/ui'
import { MODULE_IDS, MODULES, STAGE_IDS, STAGE_LABELS } from '../content/modules'
import { SITE } from '../content/site'
import { HeroArt, ModuleArt } from '../illustrations/ModuleArt'
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
      <div className={s.heroArt}>
        <HeroArt />
      </div>
      <div className={`container ${s.heroInner}`}>
        <Chip tone="demo">Demo · prepared for {SITE.school}</Chip>
        <h1 className={s.heroTitle}>{SITE.name}</h1>
        <p className={s.heroLead}>
          Computer science you can see, touch and test. Learn how sorting, searching and recursion
          really work by predicting, experimenting and running the algorithms yourself.
        </p>
        <div className={s.heroActions}>
          {started ? (
            <ButtonLink to={`/${target.module}/${target.stage}`} variant="onDark">
              Continue: {MODULES[target.module].short} · {STAGE_LABELS[target.stage]}
            </ButtonLink>
          ) : (
            <ButtonLink to="/sorting/learn" variant="onDark">
              Start learning
            </ButtonLink>
          )}
          <Link to="/teachers" className={s.heroLink}>
            For teachers →
          </Link>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const items = [
    { n: '3', label: 'Modules' },
    { n: '4', label: 'Sorting algorithms' },
    { n: '15', label: 'Interactive exercises' },
    { n: '0', label: 'Sign-ups needed' },
  ]
  return (
    <section aria-label="At a glance" className={s.stats}>
      <div className={`container ${s.statsGrid}`}>
        {items.map((i) => (
          <div key={i.label} className={s.stat}>
            <span className={s.statNumber}>{i.n}</span>
            <span className={s.statLabel}>{i.label}</span>
          </div>
        ))}
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
      <p className="eyebrow">Choose a lesson</p>
      <h2 id="modules-title">Three big ideas in computer science</h2>
      <p className={`lead reading ${s.sectionLead}`}>
        Every lesson has the same three stages: <strong>Learn</strong> the idea,{' '}
        <strong>Explore</strong> it in an interactive playground, then <strong>Practice</strong>{' '}
        with exercises that give instant feedback.
      </p>
      <div className={s.cards}>
        {MODULE_IDS.map((id) => {
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
                  <span>⏱ {meta.minutes} min</span>
                  {st.completed ? (
                    <Chip tone="success">✓ Completed</Chip>
                  ) : st.started ? (
                    <Chip tone="outline">In progress</Chip>
                  ) : (
                    <Chip>Not started</Chip>
                  )}
                </div>
                <h3 className={s.cardTitle}>{meta.title}</h3>
                <p className={s.cardText}>{meta.description}</p>
                <ol className={s.cardStages} aria-label="Stages">
                  {STAGE_IDS.map((x) => (
                    <li key={x} data-status={stages[id].stages[x]}>
                      <span aria-hidden="true">{stages[id].stages[x] === 'done' ? '✓' : '•'}</span>
                      {STAGE_LABELS[x]}
                      <span className="visually-hidden">
                        {stages[id].stages[x] === 'done' ? ' (completed)' : ''}
                      </span>
                    </li>
                  ))}
                </ol>
                <ProgressBar
                  value={st.stagesDone / STAGE_IDS.length}
                  label={`${meta.title} progress`}
                />
                <ButtonLink
                  to={`/${id}/${resume}`}
                  variant={st.started ? 'primary' : 'secondary'}
                  className={s.cardButton}
                >
                  {st.completed
                    ? 'Review lesson'
                    : st.started
                      ? 'Continue learning'
                      : 'Start learning'}
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
          <p className={s.progressNote}>Saved on this device only. No account needed.</p>
        </div>
        <dl className={s.progressStats}>
          <div>
            <dt>Modules completed</dt>
            <dd>
              {o.modulesCompleted} / {o.modulesTotal}
            </dd>
          </div>
          <div>
            <dt>Stages completed</dt>
            <dd>
              {o.stagesDone} / {o.stagesTotal}
            </dd>
          </div>
          <div>
            <dt>Exercises solved</dt>
            <dd>
              {o.exercisesCompleted} / {o.exercisesTotal}
            </dd>
          </div>
        </dl>
        <div className={s.resetRow}>
          {confirming ? (
            <>
              <span>Delete all saved progress on this device?</span>
              <Button
                size="small"
                variant="primary"
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
          <p className="eyebrow" style={{ color: '#b9c8d6' }}>
            Teachers&rsquo; corner
          </p>
          <h2 className={s.teachersTitle}>Using CS Playground in class</h2>
          <p>
            Lesson plans, learning objectives, common misconceptions and discussion questions for
            each module, aligned with the IB Diploma Programme Computer Science course.
          </p>
        </div>
        <ButtonLink to="/teachers" variant="onDark">
          Open teacher notes
        </ButtonLink>
      </div>
    </section>
  )
}

export function Dashboard() {
  useEffect(() => {
    document.title = `${SITE.name} · Demo for ${SITE.school}`
  }, [])
  return (
    <>
      <Hero />
      <Stats />
      <ModuleCards />
      <OverallProgress />
      <TeachersCorner />
    </>
  )
}
