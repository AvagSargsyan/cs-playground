import { useCallback, useEffect, useReducer } from 'react'
import { useAppSelector } from '../store/hooks'
import type { Step } from './types'

type PlayerState = { index: number; playing: boolean; traceId: unknown }

type PlayerAction =
  | { type: 'play'; last: number }
  | { type: 'pause' }
  | { type: 'next'; last: number }
  | { type: 'prev' }
  | { type: 'seek'; index: number; last: number }
  | { type: 'reset' }
  | { type: 'tick'; last: number }
  | { type: 'retrace'; traceId: unknown }

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'play':
      // Pressing play at the end starts over, which is what students expect.
      return { ...state, playing: true, index: state.index >= action.last ? 0 : state.index }
    case 'pause':
      return { ...state, playing: false }
    case 'next':
      return { ...state, playing: false, index: Math.min(action.last, state.index + 1) }
    case 'prev':
      return { ...state, playing: false, index: Math.max(0, state.index - 1) }
    case 'seek':
      return {
        ...state,
        playing: false,
        index: Math.max(0, Math.min(action.last, Math.round(action.index))),
      }
    case 'reset':
      return { ...state, playing: false, index: 0 }
    case 'tick': {
      const index = Math.min(action.last, state.index + 1)
      return { ...state, index, playing: index < action.last }
    }
    case 'retrace':
      return { index: 0, playing: false, traceId: action.traceId }
  }
}

/** Base delay between steps at 1× speed. */
export const BASE_STEP_MS = 900

export type Player<S, K extends string> = {
  step: Step<S, K>
  index: number
  total: number
  isFirst: boolean
  isLast: boolean
  playing: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (index: number) => void
  reset: () => void
}

/**
 * Drives any visualizer: moves an index through a precomputed trace. The trace must be
 * memoized by the caller; a new trace object resets the player to step 0.
 * Player state is local on purpose: it changes on every animation tick and belongs to one
 * visualizer, so it stays out of the Redux store.
 */
export function usePlayer<S, K extends string>(trace: Step<S, K>[]): Player<S, K> {
  const speed = useAppSelector((s) => s.preferences.speed)
  const [state, dispatch] = useReducer(reducer, { index: 0, playing: false, traceId: trace })
  const last = Math.max(0, trace.length - 1)

  // A new trace (new input or algorithm) starts again from the first step.
  if (state.traceId !== trace) dispatch({ type: 'retrace', traceId: trace })
  const index = state.traceId === trace ? Math.min(state.index, last) : 0
  const playing = state.traceId === trace && state.playing

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => dispatch({ type: 'tick', last }), BASE_STEP_MS / speed)
    return () => window.clearTimeout(id)
  }, [playing, index, last, speed])

  const play = useCallback(() => dispatch({ type: 'play', last }), [last])
  const pause = useCallback(() => dispatch({ type: 'pause' }), [])
  const next = useCallback(() => dispatch({ type: 'next', last }), [last])
  const prev = useCallback(() => dispatch({ type: 'prev' }), [])
  const seek = useCallback((i: number) => dispatch({ type: 'seek', index: i, last }), [last])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const toggle = useCallback(
    () => dispatch(playing ? { type: 'pause' } : { type: 'play', last }),
    [playing, last],
  )

  return {
    step: trace[index],
    index,
    total: trace.length,
    isFirst: index === 0,
    isLast: index === last,
    playing,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    reset,
  }
}
