import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { useParams } from 'react-router'
import { ButtonLink, PageLoader } from '../components/ui'
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
type Loader = () => Promise<{ default: StageComponent }>

/** Each stage is its own chunk, so a student only downloads the lesson they open. */
const LOADERS: Record<ModuleId, Record<StageId, Loader>> = {
  sorting: {
    learn: () => import('./sorting/Learn'),
    explore: () => import('./sorting/Explore'),
    practice: () => import('./sorting/Practice'),
  },
  'binary-search': {
    learn: () => import('./binary-search/Learn'),
    explore: () => import('./binary-search/Explore'),
    practice: () => import('./binary-search/Practice'),
  },
  recursion: {
    learn: () => import('./recursion/Learn'),
    explore: () => import('./recursion/Explore'),
    practice: () => import('./recursion/Practice'),
  },
}

const lazyStages = (l: Record<StageId, Loader>): Record<StageId, StageComponent> => ({
  learn: lazy(l.learn),
  explore: lazy(l.explore),
  practice: lazy(l.practice),
})

const STAGES: Record<ModuleId, Record<StageId, StageComponent>> = {
  sorting: lazyStages(LOADERS.sorting),
  'binary-search': lazyStages(LOADERS['binary-search']),
  recursion: lazyStages(LOADERS.recursion),
}

/** Download the other stages of a lesson in the background, so switching stages is instant. */
function preloadStages(moduleId: ModuleId) {
  for (const load of Object.values(LOADERS[moduleId])) void load().catch(() => {})
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
      preloadStages(moduleId)
      document.title = `${STAGE_LABELS[stage]} · ${MODULES[moduleId].title} · CS Playground (Demo)`
    }
  }, [dispatch, moduleId, stage, valid])

  if (!valid) return <NotFound />
  const Stage = STAGES[moduleId][stage]
  return (
    <div className={s.stage}>
      <Suspense fallback={<PageLoader />}>
        <Stage moduleId={moduleId} />
        <StageFooter moduleId={moduleId} stage={stage} />
      </Suspense>
    </div>
  )
}
