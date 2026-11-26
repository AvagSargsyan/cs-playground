import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../components/ui'
import { IB_ALIGNMENT } from '../content/ib-alignment'
import { isModuleId, MODULES, STAGE_IDS, STAGE_LABELS, type ModuleId } from '../content/modules'
import { REFERENCES, TEACHING_REFERENCES } from '../content/references'
import { LESSON_MINUTES, TEACHER_NOTES } from '../content/teachers'
import { ReferenceList } from '../modules/shared/lesson'
import { NotFound } from './NotFound'
import s from './teachers.module.css'

function Notes({ moduleId }: { moduleId: ModuleId }) {
  const meta = MODULES[moduleId]
  const notes = TEACHER_NOTES[moduleId]
  const ib = IB_ALIGNMENT.find((r) => r.module === moduleId)

  useEffect(() => {
    document.title = `Teacher notes: ${meta.title} · CS Playground`
  }, [meta.title])

  // Start minute of each plan step: 0, 5, 15, …
  const starts = notes.plan.map((_, i) =>
    notes.plan.slice(0, i).reduce((sum, p) => sum + p.minutes, 0),
  )

  return (
    <article
      className={`container ${s.page}`}
      style={{ '--module-color': meta.colorVar } as React.CSSProperties}
    >
      <p className={`${s.crumbs} no-print`}>
        <Link to="/teachers">For teachers</Link> <span aria-hidden="true">/</span> {meta.title}
      </p>
      <p className={s.kicker}>Teacher notes · {LESSON_MINUTES}-minute lesson</p>
      <h1 className={s.title}>{meta.title}</h1>
      <p className={s.lead}>{notes.summary}</p>
      {ib && (
        <p className={s.text}>
          <strong>IB DP Computer Science:</strong> {ib.topic} ({ib.level}).
        </p>
      )}

      <div className={`${s.actions} no-print`}>
        <span className={s.actionsLabel}>Open the lesson:</span>
        {STAGE_IDS.map((stage) => (
          <Link key={stage} to={`/${moduleId}/${stage}`} className={s.stageLink}>
            {STAGE_LABELS[stage]}
          </Link>
        ))}
        <Button size="small" variant="ghost" onClick={() => window.print()}>
          Print notes
        </Button>
      </div>

      <section className={s.block} aria-labelledby="objectives">
        <h2 id="objectives" className={s.h2}>
          Students will be able to
        </h2>
        <ul className={s.list}>
          {notes.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className={s.block} aria-labelledby="plan">
        <h2 id="plan" className={s.h2}>
          Lesson plan
        </h2>
        <ol className={s.plan}>
          {notes.plan.map((step, i) => {
            const from = starts[i]
            return (
              <li key={step.title}>
                <span className={s.planTime}>
                  {from}–{from + step.minutes} min
                </span>
                <div>
                  <p className={s.planTitle}>
                    {step.title}
                    {step.stage && (
                      <Link to={`/${moduleId}/${step.stage}`} className={`${s.planLink} no-print`}>
                        Open {STAGE_LABELS[step.stage]} →
                      </Link>
                    )}
                  </p>
                  <p className={s.planText}>{step.activity}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <p className={s.exitTicket}>
          <strong>Exit ticket:</strong> {notes.exitTicket}
        </p>
      </section>

      <section className={s.block} aria-labelledby="misconceptions">
        <h2 id="misconceptions" className={s.h2}>
          Watch out for
        </h2>
        <dl className={s.misconceptions}>
          {notes.misconceptions.map((m) => (
            <div key={m.belief}>
              <dt>&ldquo;{m.belief}&rdquo;</dt>
              <dd>{m.fix}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.block} aria-labelledby="questions">
        <h2 id="questions" className={s.h2}>
          Questions to ask
        </h2>
        <ol className={s.list}>
          {notes.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <section className={s.block} aria-labelledby="differentiation">
        <h2 id="differentiation" className={s.h2}>
          Support and stretch
        </h2>
        <div className={s.twoCol}>
          <div>
            <h3 className={s.h3}>Support</h3>
            <ul className={s.list}>
              {notes.support.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={s.h3}>Stretch</h3>
            <ul className={s.list}>
              {notes.stretch.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ReferenceList
        id="teacher-references"
        groups={[
          { heading: 'Teaching approach', items: TEACHING_REFERENCES },
          ...REFERENCES[moduleId],
        ]}
      />
    </article>
  )
}

export function TeacherModule() {
  const { module } = useParams()
  if (!isModuleId(module)) return <NotFound />
  return <Notes moduleId={module} />
}
