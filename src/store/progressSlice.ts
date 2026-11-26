import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { MODULE_IDS, type ModuleId, type StageId } from '../content/modules'

export type StageStatus = 'not-started' | 'in-progress' | 'done'

export type ExerciseRecord = {
  attempts: number
  /** Best score, 0–1. */
  bestScore: number
  completed: boolean
}

export type ModuleProgress = {
  started: boolean
  stages: Record<StageId, StageStatus>
  exercises: Record<string, ExerciseRecord>
}

export type ProgressState = {
  modules: Record<ModuleId, ModuleProgress>
  last: { module: ModuleId; stage: StageId } | null
}

const emptyModule = (): ModuleProgress => ({
  started: false,
  stages: { learn: 'not-started', explore: 'not-started', practice: 'not-started' },
  exercises: {},
})

export const initialProgress = (): ProgressState => ({
  modules: Object.fromEntries(MODULE_IDS.map((id) => [id, emptyModule()])) as Record<
    ModuleId,
    ModuleProgress
  >,
  last: null,
})

type StageRef = { module: ModuleId; stage: StageId }

const progressSlice = createSlice({
  name: 'progress',
  initialState: initialProgress,
  reducers: {
    stageVisited(state, { payload }: PayloadAction<StageRef>) {
      const m = state.modules[payload.module]
      m.started = true
      if (m.stages[payload.stage] === 'not-started') m.stages[payload.stage] = 'in-progress'
      state.last = { module: payload.module, stage: payload.stage }
    },
    stageCompleted(state, { payload }: PayloadAction<StageRef>) {
      const m = state.modules[payload.module]
      m.started = true
      m.stages[payload.stage] = 'done'
    },
    exerciseAttempted(
      state,
      {
        payload,
      }: PayloadAction<{ module: ModuleId; exerciseId: string; score: number; completed: boolean }>,
    ) {
      const m = state.modules[payload.module]
      m.started = true
      const prev = m.exercises[payload.exerciseId] ?? {
        attempts: 0,
        bestScore: 0,
        completed: false,
      }
      m.exercises[payload.exerciseId] = {
        attempts: prev.attempts + 1,
        bestScore: Math.max(prev.bestScore, Math.min(1, Math.max(0, payload.score))),
        completed: prev.completed || payload.completed,
      }
    },
    progressReset() {
      return initialProgress()
    },
  },
})

export const { stageVisited, stageCompleted, exerciseAttempted, progressReset } =
  progressSlice.actions
export default progressSlice.reducer
