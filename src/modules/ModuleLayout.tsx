import { Link, Navigate, NavLink, Outlet, useParams } from 'react-router'
import { Chip, Duration } from '../components/ui'
import { isStageId, MODULES, STAGE_IDS, STAGE_LABELS, type ModuleId } from '../content/modules'
import { useAppSelector } from '../store/hooks'
import s from './module.module.css'

/** /sorting → the stage the student last used in this module, else Learn. */
export function ModuleIndex({ moduleId }: { moduleId: ModuleId }) {
  const last = useAppSelector((st) => st.progress.last)
  const stage = last?.module === moduleId ? last.stage : 'learn'
  return <Navigate to={stage} replace />
}

export function StageStepper({ moduleId }: { moduleId: ModuleId }) {
  const stages = useAppSelector((st) => st.progress.modules[moduleId].stages)
  const minutes = MODULES[moduleId].stageMinutes
  return (
    <nav aria-label="Lesson stages" className={s.stepperWrap}>
      <ol className={s.stepper}>
        {STAGE_IDS.map((stage, i) => {
          const status = stages[stage]
          return (
            <li key={stage}>
              <NavLink
                to={`/${moduleId}/${stage}`}
                className={({ isActive }) =>
                  `${s.step} ${isActive ? s.stepActive : ''} ${status === 'done' ? s.stepDone : ''}`
                }
              >
                <span className={s.stepNumber} aria-hidden="true">
                  {status === 'done' ? '✓' : i + 1}
                </span>
                <span className={s.stepLabel}>{STAGE_LABELS[stage]}</span>
                <Duration minutes={minutes[stage]} className={s.stepTime} />
                <span className="visually-hidden">
                  {status === 'done' ? '(completed)' : status === 'in-progress' ? '(started)' : ''}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ModuleLayout({ moduleId }: { moduleId: ModuleId }) {
  const meta = MODULES[moduleId]
  const { stage } = useParams()
  return (
    <div style={{ '--module-color': meta.colorVar } as React.CSSProperties}>
      <section className={s.header}>
        <div className="container">
          <p className={s.crumbs}>
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> {meta.title}
          </p>
          <div className={s.titleRow}>
            <h1 className={s.title}>{meta.title}</h1>
            <Chip tone="ib">{meta.ibTag}</Chip>
          </div>
          <p className={s.time}>
            <Duration minutes={meta.minutes} prefix="About " /> in total. Your progress is saved, so
            you can stop and come back later.
          </p>
          {isStageId(stage) && <StageStepper moduleId={moduleId} />}
        </div>
      </section>
      <Outlet />
    </div>
  )
}
