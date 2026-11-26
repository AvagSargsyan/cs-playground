import type { Player } from '../../engine/usePlayer'
import { useKeyboardControls } from '../../engine/useKeyboardControls'
import { SPEEDS, speedChanged, type Speed } from '../../store/preferencesSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { Button } from '../ui'
import s from './visualizers.module.css'

const Icon = {
  play: <path d="M7 4.5v15l13-7.5z" fill="currentColor" />,
  pause: <path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor" />,
  prev: <path d="M6 5h2.5v14H6zM20 5v14L9.5 12z" fill="currentColor" />,
  next: <path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z" fill="currentColor" />,
  reset: (
    <path
      d="M12 5a7 7 0 1 1-6.6 4.7M5 4v5h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
)

type Props = {
  player: Pick<
    Player<unknown, string>,
    | 'index'
    | 'total'
    | 'playing'
    | 'isFirst'
    | 'isLast'
    | 'toggle'
    | 'next'
    | 'prev'
    | 'reset'
    | 'seek'
  >
  /** Enables Space/arrow/R shortcuts. Only one visualizer per page should set this. */
  keyboard?: boolean
  label?: string
}

export function Controls({ player, keyboard = true, label = 'Playback controls' }: Props) {
  const speed = useAppSelector((st) => st.preferences.speed)
  const dispatch = useAppDispatch()
  useKeyboardControls(player, keyboard)
  const { index, total, playing, isFirst, isLast } = player

  return (
    <div className={s.controls} role="group" aria-label={label}>
      <div className={s.controlButtons}>
        <Button
          variant="ghost"
          iconOnly
          onClick={player.reset}
          disabled={isFirst}
          aria-label="Reset (R)"
          title="Reset (R)"
        >
          <Svg>{Icon.reset}</Svg>
        </Button>
        <Button
          variant="ghost"
          iconOnly
          onClick={player.prev}
          disabled={isFirst}
          aria-label="Previous step (←)"
          title="Previous step (←)"
        >
          <Svg>{Icon.prev}</Svg>
        </Button>
        <Button
          variant="primary"
          className={s.playButton}
          onClick={player.toggle}
          aria-label={playing ? 'Pause (Space)' : isLast ? 'Replay (Space)' : 'Play (Space)'}
          title={playing ? 'Pause (Space)' : 'Play (Space)'}
        >
          <Svg>{playing ? Icon.pause : Icon.play}</Svg>
          <span className={s.playLabel}>{playing ? 'Pause' : isLast ? 'Replay' : 'Play'}</span>
        </Button>
        <Button
          variant="ghost"
          iconOnly
          onClick={player.next}
          disabled={isLast}
          aria-label="Next step (→)"
          title="Next step (→)"
        >
          <Svg>{Icon.next}</Svg>
        </Button>
      </div>

      <label className={s.speed}>
        <span>Speed</span>
        <select
          value={speed}
          onChange={(e) => dispatch(speedChanged(Number(e.target.value) as Speed))}
          aria-label="Animation speed"
        >
          {SPEEDS.map((sp) => (
            <option key={sp} value={sp}>
              {sp}×
            </option>
          ))}
        </select>
      </label>

      <div className={s.scrubber}>
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label="Jump to step"
          aria-valuetext={`Step ${index + 1} of ${total}`}
        />
        <span className={s.stepCount} aria-hidden="true">
          Step {index + 1} / {total}
        </span>
      </div>
    </div>
  )
}

export function KeyboardHint() {
  return (
    <p className={s.keyboardHint}>
      Keyboard: <kbd>Space</kbd> play/pause · <kbd>←</kbd> <kbd>→</kbd> step · <kbd>R</kbd> reset ·{' '}
      <kbd>+</kbd> <kbd>−</kbd> speed
    </p>
  )
}
