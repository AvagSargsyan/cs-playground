import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SortOrder } from '../engine/types'

export type CodeTab = 'pseudocode' | 'python'

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

export type PreferencesState = {
  speed: Speed
  codeTab: CodeTab
  sortOrder: SortOrder
  /** Session-only: never written to localStorage, so the demo notice returns on reload. */
  bannerDismissed: boolean
}

export const initialPreferences = (): PreferencesState => ({
  speed: 1,
  codeTab: 'pseudocode',
  sortOrder: 'asc',
  bannerDismissed: false,
})

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences,
  reducers: {
    speedChanged(state, { payload }: PayloadAction<Speed>) {
      state.speed = payload
    },
    codeTabChanged(state, { payload }: PayloadAction<CodeTab>) {
      state.codeTab = payload
    },
    sortOrderChanged(state, { payload }: PayloadAction<SortOrder>) {
      state.sortOrder = payload
    },
    bannerDismissed(state) {
      state.bannerDismissed = true
    },
  },
})

export const { speedChanged, codeTabChanged, sortOrderChanged, bannerDismissed } =
  preferencesSlice.actions
export default preferencesSlice.reducer
