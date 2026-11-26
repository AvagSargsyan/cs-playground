import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink, Duration } from '../components/ui'
import { MODULE_IDS, MODULES, STAGE_IDS, STAGE_LABELS } from '../content/modules'
import { MOTIVATION, SITE } from '../content/site'
import { ModuleArt } from '../illustrations/ModuleArt'
import { progressReset } from '../store/progressSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import s from './dashboard.module.css'

function Intro() {
  return (
    <section className={`container ${s.intro}`}>
      <p className={s.demoLabel}>Demo</p>
      <h1 className={s.title}>{SITE.name}</h1>
      <p className={s.lead}>
        An interactive demo for learning three computer science concepts: sorting, binary search and
        recursion. Each lesson has three stages: <strong>Learn</strong> the idea,{' '}
        <strong>Explore</strong> it step by step, and <strong>Practice</strong> with exercises. A
        lesson takes about 30 to 45 minutes, and your progress is saved as you go.
      </p>
      <figure className={s.motivation}>
        <blockquote>
          <p>&ldquo;{MOTIVATION}&rdquo;</p>
        </blockquote>
        <figcaption>{SITE.author}</figcaption>
      </figure>
      <p className={s.author}>
        Built by {SITE.author} for demo purposes for {SITE.school}.{' '}
        <Link to="/about">About this demo</Link>
      </p>
    </section>
  )
}

function Lessons() {
  const modules = useAppSelector((st) => st.progress.modules)
  const last = useAppSelector((st) => st.progress.last)
  const anyStarted = MODULE_IDS.some((id) => modules[id].started)
  const dispatch = useAppDispatch()
  const [confirming, setConfirming] = useState(false)

  return (
    <section className={`container ${s.section}`} aria-labelledby="lessons-title">
      <h2 id="lessons-title" className={s.sectionTitle}>
        Lessons
      </h2>
      <ol className={s.lessons}>
        {MODULE_IDS.map((id, n) => {
          const meta = MODULES[id]
          const m = modules[id]
          const resume =
            last?.module === id
              ? last.stage
              : (STAGE_IDS.find((x) => m.stages[x] !== 'done') ?? 'learn')
          return (
            <li
              key={id}
              className={s.lesson}
              style={{ '--module-color': meta.colorVar } as React.CSSProperties}
            >
              <div className={s.lessonArt}>
                <ModuleArt id={id} />
              </div>
              <div className={s.lessonBody}>
                <p className={s.lessonNumber}>
                  Lesson {n + 1} · <Duration minutes={meta.minutes} prefix="About " />
                </p>
                <h3 className={s.lessonTitle}>{meta.title}</h3>
                <p className={s.lessonText}>{meta.description}</p>
                <ul className={s.stages} aria-label={`${meta.title} stages`}>
                  {STAGE_IDS.map((x) => {
                    const done = m.stages[x] === 'done'
                    return (
                      <li key={x}>
                        <Link to={`/${id}/${x}`} className={done ? s.stageDone : undefined}>
                          {done && <span aria-hidden="true">✓ </span>}
                          {STAGE_LABELS[x]}
                          {done && <span className="visually-hidden"> (completed)</span>}{' '}
                          <Duration minutes={meta.stageMinutes[x]} className={s.stageTime} />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <ButtonLink
                  to={`/${id}/${resume}`}
                  variant={m.started ? 'primary' : 'secondary'}
                  className={s.lessonButton}
                >
                  {m.started ? 'Continue' : 'Start'}
                </ButtonLink>
              </div>
            </li>
          )
        })}
      </ol>
      {anyStarted && (
        <p className={s.reset}>
          Your progress is saved in this browser.{' '}
          {confirming ? (
            <>
              Delete it?{' '}
              <Button
                size="small"
                onClick={() => {
                  dispatch(progressReset())
                  setConfirming(false)
                }}
              >
                Yes, reset
              </Button>{' '}
              <Button size="small" variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <button type="button" className={s.linkButton} onClick={() => setConfirming(true)}>
              Reset progress
            </button>
          )}
        </p>
      )}
    </section>
  )
}

function ForTeachers() {
  return (
    <section className={`container ${s.section}`} aria-labelledby="teachers-title">
      <h2 id="teachers-title" className={s.sectionTitle}>
        For teachers
      </h2>
      <p className={s.teachersText}>
        A one-page, 60-minute lesson plan for each topic, linked to the IB Diploma Programme
        Computer Science course.
      </p>
      <ButtonLink to="/teachers" variant="ghost">
        Open teacher notes
      </ButtonLink>
    </section>
  )
}

export function Dashboard() {
  useEffect(() => {
    document.title = `${SITE.name} · a teaching demo by ${SITE.author}`
  }, [])
  return (
    <>
      <Intro />
      <Lessons />
      <ForTeachers />
    </>
  )
}
