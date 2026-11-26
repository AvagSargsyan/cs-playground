import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { loadState, persistenceListener } from './persistence'
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

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
