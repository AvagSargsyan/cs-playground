import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { loadState, persistenceListener, saveState } from './persistence'
import preferences from './preferencesSlice'
import progress from './progressSlice'

const rootReducer = combineReducers({ progress, preferences })

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().prepend(persistenceListener.middleware),
  })
}

export const store = makeStore(loadState())

// Saves are debounced; write immediately when the tab is closed or hidden so nothing is lost.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => saveState(store.getState()))
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
