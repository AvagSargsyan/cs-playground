import { AnimatePresence, motion } from 'motion/react'
import type { Frame } from '../../engine/types'
import { useReducedMotion } from '../../engine/useReducedMotion'
import { cx } from '../../components/ui/cx'
import { STATUS_META } from './frameStatus'
import s from './recursion.module.css'

function FrameCard({ frame, active }: { frame: Frame; active: boolean }) {
  const meta = STATUS_META[frame.status]
  return (
    <div className={cx(s.frame, s[`frame-${frame.status}`], active && s.frameActive)}>
      <code className={s.frameCall}>
        {frame.fn}({frame.arg})
      </code>
      {frame.pending && (
        <span className={s.framePending} aria-label={`pending: ${frame.pending}`}>
          {frame.pending}
        </span>
      )}
      {frame.status === 'returning' && frame.returnValue !== undefined && (
        <span className={s.frameReturn}>returns {frame.returnValue}</span>
      )}
      <span className={s.frameStatus}>
        <span aria-hidden="true">{meta.icon}</span> {meta.label}
      </span>
    </div>
  )
}

/**
 * Vertical call stack: the newest call sits on top, like a stack of plates. Frames slide in when
 * a function is called and drop away when it returns.
 */
export function CallStack({ stack, activeId }: { stack: Frame[]; activeId?: number }) {
  const reduced = useReducedMotion()
  // Top of the stack first, so new calls appear at the top.
  const frames = [...stack].reverse()
  return (
    <div className={s.stackWrap}>
      <p className={s.stackLabel}>
        <span>Call stack</span>
        <span>
          {stack.length === 0 ? 'empty' : `${stack.length} frame${stack.length > 1 ? 's' : ''}`}
        </span>
      </p>
      <ol className={s.stack} aria-label="Call stack, top first" reversed>
        <AnimatePresence initial={false}>
          {frames.map((f, i) => (
            <motion.li
              key={f.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
              aria-current={f.id === activeId ? 'step' : undefined}
            >
              {i === 0 && <span className="visually-hidden">Top of the stack: </span>}
              <FrameCard frame={f} active={f.id === activeId} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {stack.length === 0 && <p className={s.stackEmpty}>No function is running.</p>}
      <div className={s.stackBase} aria-hidden="true" />
    </div>
  )
}
