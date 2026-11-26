import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from './cx'
import s from './ui.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark'
type ButtonStyle = { variant?: Variant; size?: 'small'; iconOnly?: boolean }

const buttonClass = ({ variant = 'primary', size, iconOnly }: ButtonStyle, extra?: string) =>
  cx(s.button, s[variant], size === 'small' && s.small, iconOnly && s.iconOnly, extra)

export function Button({
  variant,
  size,
  iconOnly,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle) {
  return (
    <button type={type} className={buttonClass({ variant, size, iconOnly }, className)} {...rest} />
  )
}

export function ButtonLink({ variant, size, className, ...rest }: LinkProps & ButtonStyle) {
  return <Link className={buttonClass({ variant, size }, className)} {...rest} />
}

/**
 * Estimated time. Shows a short visual label ("20 min") but gives screen readers the full words
 * ("about 20 minutes"), because "min" is often read out as "minimum".
 */
export function Duration({
  minutes,
  prefix = '',
  className,
}: {
  minutes: number
  /** Visible text before the number, e.g. "About ". */
  prefix?: string
  className?: string
}) {
  return (
    <span className={className}>
      <span aria-hidden="true">
        {prefix}
        {minutes} min
      </span>
      <span className="visually-hidden">about {minutes} minutes</span>
    </span>
  )
}

type ChipTone = 'default' | 'demo' | 'ib' | 'success' | 'outline'
const chipTone: Record<ChipTone, string | undefined> = {
  default: undefined,
  demo: s.chipDemo,
  ib: s.chipIb,
  success: s.chipSuccess,
  outline: s.chipOutline,
}

export function Chip({
  tone = 'default',
  children,
  className,
}: {
  tone?: ChipTone
  children: ReactNode
  className?: string
}) {
  return <span className={cx(s.chip, chipTone[tone], className)}>{children}</span>
}

type CalloutKind = 'info' | 'didyouknow' | 'warning' | 'tip' | 'predict'
const calloutDefaultTitle: Record<CalloutKind, string> = {
  info: 'Note',
  didyouknow: 'Did you know?',
  warning: 'Watch out',
  tip: 'Tip',
  predict: 'Predict first',
}

export function Callout({
  kind = 'info',
  title,
  children,
}: {
  kind?: CalloutKind
  title?: ReactNode
  children: ReactNode
}) {
  return (
    <aside className={cx(s.callout, s[`callout-${kind}`])}>
      <div className={s.calloutTitle}>{title ?? calloutDefaultTitle[kind]}</div>
      {children}
    </aside>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(s.card, className)}>{children}</div>
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: ReactNode }[]
  value: T
  onChange: (id: T) => void
  label: string
}) {
  const base = useId()
  return (
    <div role="tablist" aria-label={label} className={s.tabList}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          id={`${base}-${t.id}`}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          className={s.tab}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
            e.preventDefault()
            e.stopPropagation()
            const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
            onChange(next.id)
            document.getElementById(`${base}-${next.id}`)?.focus()
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    // Toggle buttons (not radios): radios would need arrow-key navigation, which the
    // Explore pages already use for stepping through the algorithm.
    <div role="group" aria-label={label} className={s.segmented}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          className={s.segment}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className={s.progress}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className={s.progressFill} style={{ width: `${pct}%` }} />
    </div>
  )
}

/**
 * Placeholder while a page downloads. It keeps the page tall (so the footer does not jump up) and
 * only shows the spinner after a short delay, so fast loads do not flash.
 */
export function PageLoader() {
  return (
    <div className={s.pageLoader} role="status" aria-live="polite">
      <span className={s.spinner} aria-hidden="true" />
      <span className={s.loaderText}>Loading…</span>
    </div>
  )
}
