import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { useParams } from 'react-router'
import { ButtonLink } from '../components/ui'
import {
  isStageId,
  STAGE_IDS,
  STAGE_LABELS,
  MODULES,
  type ModuleId,
  type StageId,
} from '../content/modules'
import { NotFound } from '../pages/NotFound'
import { stageVisited } from '../store/progressSlice'
import { useAppDispatch } from '../store/hooks'
import s from './module.module.css'

type StageComponent = ComponentType<{ moduleId: ModuleId }>

/** Each stage is its own chunk, so a student only downloads the lesson they open. */
const STAGES: Record<ModuleId, Record<StageId, StageComponent>> = {
  sorting: {
    learn: lazy(() => import('./sorting/Learn')),
    explore: lazy(() => import('./sorting/Explore')),
    practice: lazy(() => import('./sorting/Practice')),
  },
  'binary-search': {
    learn: lazy(() => import('./binary-search/Learn')),
    explore: lazy(() => import('./binary-search/Explore')),
    practice: lazy(() => import('./binary-search/Practice')),
  },
  recursion: {
    learn: lazy(() => import('./recursion/Learn')),
    explore: lazy(() => import('./recursion/Explore')),
    practice: lazy(() => import('./recursion/Practice')),
  },
}

function StageFooter({ moduleId, stage }: { moduleId: ModuleId; stage: StageId }) {
  const i = STAGE_IDS.indexOf(stage)
  const prev = STAGE_IDS[i - 1]
  const next = STAGE_IDS[i + 1]
  return (
    <div className={`container ${s.stageFooter}`}>
      {prev ? (
        <ButtonLink to={`/${moduleId}/${prev}`} variant="ghost">
          ← {STAGE_LABELS[prev]}
        </ButtonLink>
      ) : (
        <span />
      )}
      {next ? (
        <ButtonLink to={`/${moduleId}/${next}`}>Next: {STAGE_LABELS[next]} →</ButtonLink>
      ) : (
        <ButtonLink to="/">Back to all lessons</ButtonLink>
      )}
    </div>
  )
}

export function StagePage({ moduleId }: { moduleId: ModuleId }) {
  const { stage } = useParams()
  const dispatch = useAppDispatch()
  const valid = isStageId(stage)

  useEffect(() => {
    if (valid) {
      dispatch(stageVisited({ module: moduleId, stage }))
      document.title = `${STAGE_LABELS[stage]} · ${MODULES[moduleId].title} · CS Playground (Demo)`
    }
  }, [dispatch, moduleId, stage, valid])

  if (!valid) return <NotFound />
  const Stage = STAGES[moduleId][stage]
  return (
    <div className={s.stage}>
      <Suspense
        fallback={<div className="container" aria-busy="true" style={{ minHeight: '50vh' }} />}
      >
        <Stage moduleId={moduleId} />
      </Suspense>
      <StageFooter moduleId={moduleId} stage={stage} />
    </div>
  )
}
