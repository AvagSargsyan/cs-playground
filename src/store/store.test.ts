import { describe, expect, it } from 'vitest'
import { loadState, migrate, saveState, SCHEMA_VERSION, STORAGE_KEY } from './persistence'
import { initialPreferences } from './preferencesSlice'
import reducer, {
  exerciseAttempted,
  initialProgress,
  progressReset,
  stageCompleted,
  stageVisited,
} from './progressSlice'
import { selectContinueTarget, selectOverallProgress } from './selectors'
import type { RootState } from './index'

const root = (progress = initialProgress()): RootState => ({
  progress,
  preferences: initialPreferences(),
})

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v
    },
  }
}

describe('progress slice', () => {
  it('marks a stage in progress on visit and remembers it as last', () => {
    const s = reducer(undefined, stageVisited({ module: 'sorting', stage: 'explore' }))
    expect(s.modules.sorting.started).toBe(true)
    expect(s.modules.sorting.stages.explore).toBe('in-progress')
    expect(s.last).toEqual({ module: 'sorting', stage: 'explore' })
  })

  it('does not downgrade a completed stage when it is visited again', () => {
    let s = reducer(undefined, stageCompleted({ module: 'recursion', stage: 'learn' }))
    s = reducer(s, stageVisited({ module: 'recursion', stage: 'learn' }))
    expect(s.modules.recursion.stages.learn).toBe('done')
  })

  it('keeps the best score and counts attempts', () => {
    let s = reducer(
      undefined,
      exerciseAttempted({ module: 'sorting', exerciseId: 'x', score: 0.4, completed: false }),
    )
    s = reducer(
      s,
      exerciseAttempted({ module: 'sorting', exerciseId: 'x', score: 1, completed: true }),
    )
    s = reducer(
      s,
      exerciseAttempted({ module: 'sorting', exerciseId: 'x', score: 0.2, completed: false }),
    )
    expect(s.modules.sorting.exercises.x).toEqual({ attempts: 3, bestScore: 1, completed: true })
  })

  it('resets everything', () => {
    const s = reducer(
      reducer(undefined, stageCompleted({ module: 'sorting', stage: 'learn' })),
      progressReset(),
    )
    expect(s).toEqual(initialProgress())
  })
})

describe('selectors', () => {
  it('computes overall progress', () => {
    let p = initialProgress()
    for (const stage of ['learn', 'explore', 'practice'] as const)
      p = reducer(p, stageCompleted({ module: 'sorting', stage }))
    p = reducer(p, stageCompleted({ module: 'recursion', stage: 'learn' }))
    const o = selectOverallProgress(root(p))
    expect(o.modulesCompleted).toBe(1)
    expect(o.stagesDone).toBe(4)
    expect(o.stagesTotal).toBe(9)
    expect(o.percent).toBe(44)
  })

  it('continues at the first unfinished stage when nothing was visited', () => {
    const p = reducer(undefined, stageCompleted({ module: 'sorting', stage: 'learn' }))
    expect(selectContinueTarget(root({ ...p, last: null }))).toEqual({
      module: 'sorting',
      stage: 'explore',
    })
  })
})

describe('persistence', () => {
  it('round-trips progress and preferences but not the session-only banner flag', () => {
    const storage = memoryStorage()
    const progress = reducer(undefined, stageCompleted({ module: 'binary-search', stage: 'learn' }))
    saveState(
      { progress, preferences: { ...initialPreferences(), speed: 2, bannerDismissed: true } },
      storage,
    )
    const loaded = loadState(storage)!
    expect(loaded.progress.modules['binary-search'].stages.learn).toBe('done')
    expect(loaded.preferences.speed).toBe(2)
    expect(loaded.preferences.bannerDismissed).toBe(false)
  })

  it('survives corrupted storage', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toBeUndefined()
  })

  it('starts fresh on an unknown schema version', () => {
    const m = migrate({ version: 99, progress: { modules: {} } })
    expect(m.progress).toEqual(initialProgress())
  })

  it('drops invalid fields instead of crashing', () => {
    const m = migrate({
      version: SCHEMA_VERSION,
      progress: {
        modules: {
          sorting: {
            started: true,
            stages: { learn: 'done', explore: 'banana' },
            exercises: { a: { attempts: 2, bestScore: 5, completed: true }, b: 'nope' },
          },
          hacked: {},
        },
        last: { module: 'nope', stage: 'learn' },
      },
      preferences: { speed: 999, codeTab: 'python' },
    })
    expect(m.progress.modules.sorting.stages).toEqual({
      learn: 'done',
      explore: 'not-started',
      practice: 'not-started',
    })
    expect(m.progress.modules.sorting.exercises).toEqual({
      a: { attempts: 2, bestScore: 1, completed: true },
    })
    expect(m.progress.last).toBeNull()
    expect(m.preferences.speed).toBe(1)
    expect(m.preferences.codeTab).toBe('python')
  })
})
