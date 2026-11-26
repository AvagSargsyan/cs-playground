import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { MODULE_IDS, STAGE_IDS } from '../content/modules'
import {
  initialPreferences,
  SPEEDS,
  type PreferencesState,
  codeTabChanged,
  sortOrderChanged,
  speedChanged,
} from './preferencesSlice'
import {
  exerciseAttempted,
  initialProgress,
  progressReset,
  stageCompleted,
  stageVisited,
  type ProgressState,
  type StageStatus,
} from './progressSlice'

export const STORAGE_KEY = 'cs-playground:v1'
export const SCHEMA_VERSION = 1

type Saved = {
  version: number
  progress: ProgressState
  preferences: PreferencesState
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const STATUSES: StageStatus[] = ['not-started', 'in-progress', 'done']

/** Rebuilds a clean progress object from anything found in storage, dropping invalid parts. */
function sanitizeProgress(raw: unknown): ProgressState {
  const clean = initialProgress()
  if (!isObject(raw) || !isObject(raw.modules)) return clean
  for (const id of MODULE_IDS) {
    const m = raw.modules[id]
    if (!isObject(m)) continue
    clean.modules[id].started = m.started === true
    if (isObject(m.stages)) {
      for (const s of STAGE_IDS) {
        const v = m.stages[s]
        if (typeof v === 'string' && (STATUSES as string[]).includes(v))
          clean.modules[id].stages[s] = v as StageStatus
      }
    }
    if (isObject(m.exercises)) {
      for (const [exId, rec] of Object.entries(m.exercises)) {
        if (!isObject(rec)) continue
        const attempts = Number(rec.attempts)
        const bestScore = Number(rec.bestScore)
        if (!Number.isFinite(attempts) || !Number.isFinite(bestScore)) continue
        clean.modules[id].exercises[exId] = {
          attempts: Math.max(0, Math.floor(attempts)),
          bestScore: Math.min(1, Math.max(0, bestScore)),
          completed: rec.completed === true,
        }
      }
    }
  }
  const last = raw.last
  if (
    isObject(last) &&
    (MODULE_IDS as readonly unknown[]).includes(last.module) &&
    (STAGE_IDS as readonly unknown[]).includes(last.stage)
  ) {
    clean.last = last as ProgressState['last']
  }
  return clean
}

function sanitizePreferences(raw: unknown): PreferencesState {
  const clean = initialPreferences()
  if (!isObject(raw)) return clean
  if ((SPEEDS as readonly unknown[]).includes(raw.speed))
    clean.speed = raw.speed as typeof clean.speed
  if (raw.codeTab === 'pseudocode' || raw.codeTab === 'python') clean.codeTab = raw.codeTab
  if (raw.sortOrder === 'asc' || raw.sortOrder === 'desc') clean.sortOrder = raw.sortOrder
  return clean
}

/** Upgrades older saved shapes. Only v1 exists so far; unknown versions start fresh. */
export function migrate(saved: unknown): {
  progress: ProgressState
  preferences: PreferencesState
} {
  if (!isObject(saved) || saved.version !== SCHEMA_VERSION) {
    return { progress: initialProgress(), preferences: initialPreferences() }
  }
  return {
    progress: sanitizeProgress(saved.progress),
    preferences: sanitizePreferences(saved.preferences),
  }
}

export function loadState(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()) {
  try {
    const text = storage?.getItem(STORAGE_KEY)
    if (!text) return undefined
    return migrate(JSON.parse(text))
  } catch {
    return undefined
  }
}

export function saveState(
  state: { progress: ProgressState; preferences: PreferencesState },
  storage: Pick<Storage, 'setItem'> | undefined = safeStorage(),
) {
  try {
    const { speed, codeTab, sortOrder } = state.preferences
    const saved: Saved = {
      version: SCHEMA_VERSION,
      progress: state.progress,
      preferences: { speed, codeTab, sortOrder },
    }
    storage?.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    // Storage full, blocked or unavailable (private mode): progress just isn't kept.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

/** Writes progress and preferences to localStorage shortly after any change to them. */
export const persistenceListener = createListenerMiddleware()

persistenceListener.startListening({
  matcher: isAnyOf(
    stageVisited,
    stageCompleted,
    exerciseAttempted,
    progressReset,
    speedChanged,
    codeTabChanged,
    sortOrderChanged,
  ),
  effect: async (_action, api) => {
    // Debounce: a newer matching action cancels this one before it writes.
    api.cancelActiveListeners()
    await api.delay(300)
    const state = api.getState() as { progress: ProgressState; preferences: PreferencesState }
    saveState(state)
  },
})
