import { useEffect } from 'react'
import type { ModuleId, StageId } from '../../content/modules'
import { stageCompleted } from '../../store/progressSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

/** Marks a stage as done (once) when `when` becomes true. */
export function useMarkStageDone(moduleId: ModuleId, stage: StageId, when: boolean) {
  const dispatch = useAppDispatch()
  const done = useAppSelector((st) => st.progress.modules[moduleId].stages[stage] === 'done')
  useEffect(() => {
    if (when && !done) dispatch(stageCompleted({ module: moduleId, stage }))
  }, [when, done, dispatch, moduleId, stage])
}
