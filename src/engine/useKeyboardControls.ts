import { useEffect, useRef } from 'react'
import { speedChanged, SPEEDS } from '../store/preferencesSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

type Handlers = {
  toggle: () => void
  next: () => void
  prev: () => void
  reset: () => void
}

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/**
 * Space = play/pause, → = next step, ← = previous step, R = reset, + / − = speed.
 * Only one visualizer per page should enable this.
 */
export function useKeyboardControls(handlers: Handlers, enabled = true) {
  const dispatch = useAppDispatch()
  const speed = useAppSelector((s) => s.preferences.speed)
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      // Buttons and links already react to Space/Enter themselves.
      const onButton =
        e.target instanceof HTMLElement && e.target.closest('button, a, [role="slider"]')
      const i = SPEEDS.indexOf(speed)
      switch (e.key) {
        case ' ':
          if (onButton) return
          e.preventDefault()
          ref.current.toggle()
          break
        case 'ArrowRight':
          if (e.target instanceof HTMLElement && e.target.closest('[role="slider"]')) return
          e.preventDefault()
          ref.current.next()
          break
        case 'ArrowLeft':
          if (e.target instanceof HTMLElement && e.target.closest('[role="slider"]')) return
          e.preventDefault()
          ref.current.prev()
          break
        case 'r':
        case 'R':
          ref.current.reset()
          break
        case '+':
        case '=':
          if (i < SPEEDS.length - 1) dispatch(speedChanged(SPEEDS[i + 1]))
          break
        case '-':
        case '_':
          if (i > 0) dispatch(speedChanged(SPEEDS[i - 1]))
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, speed, dispatch])
}
