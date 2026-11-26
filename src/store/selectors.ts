import { createSelector } from '@reduxjs/toolkit'
import { MODULE_IDS, MODULES, STAGE_IDS, type ModuleId } from '../content/modules'
import type { RootState } from './index'

const selectModules = (s: RootState) => s.progress.modules

export type ModuleStatus = {
  id: ModuleId
  started: boolean
  stagesDone: number
  completed: boolean
  exercisesCompleted: number
  exercisesTotal: number
  /** Average best score over attempted exercises, 0–1, or null when none attempted. */
  averageScore: number | null
}

export const selectModuleStatuses = createSelector(
  [selectModules],
  (modules) =>
    Object.fromEntries(
      MODULE_IDS.map((id): [ModuleId, ModuleStatus] => {
        const m = modules[id]
        const stagesDone = STAGE_IDS.filter((s) => m.stages[s] === 'done').length
        const ids = MODULES[id].exerciseIds
        const records = ids.map((e) => m.exercises[e]).filter(Boolean)
        return [
          id,
          {
            id,
            started: m.started,
            stagesDone,
            completed: stagesDone === STAGE_IDS.length,
            exercisesCompleted: records.filter((r) => r.completed).length,
            exercisesTotal: ids.length,
            averageScore: records.length
              ? records.reduce((sum, r) => sum + r.bestScore, 0) / records.length
              : null,
          },
        ]
      }),
    ) as Record<ModuleId, ModuleStatus>,
)

export const selectOverallProgress = createSelector([selectModuleStatuses], (statuses) => {
  const list = Object.values(statuses)
  const stagesTotal = MODULE_IDS.length * STAGE_IDS.length
  const stagesDone = list.reduce((n, m) => n + m.stagesDone, 0)
  return {
    modulesCompleted: list.filter((m) => m.completed).length,
    modulesTotal: MODULE_IDS.length,
    stagesDone,
    stagesTotal,
    exercisesCompleted: list.reduce((n, m) => n + m.exercisesCompleted, 0),
    exercisesTotal: list.reduce((n, m) => n + m.exercisesTotal, 0),
    percent: Math.round((stagesDone / stagesTotal) * 100),
  }
})

/** Where "Continue" should send the student: last visited, else first unfinished stage. */
export const selectContinueTarget = createSelector(
  [selectModules, (s: RootState) => s.progress.last],
  (modules, last) => {
    if (last) return last
    for (const id of MODULE_IDS) {
      const stage = STAGE_IDS.find((s) => modules[id].stages[s] !== 'done')
      if (stage) return { module: id, stage }
    }
    return { module: MODULE_IDS[0], stage: STAGE_IDS[0] }
  },
)
