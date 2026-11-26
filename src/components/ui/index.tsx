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

type CalloutKind = 'info' | 'didyouknow' | 'warning' | 'tip' | 'world' | 'predict'
const calloutIcon: Record<CalloutKind, string> = {
  info: 'ℹ️',
  didyouknow: '💡',
  warning: '⚠️',
  tip: '✅',
  world: '🌍',
  predict: '🤔',
}
const calloutDefaultTitle: Record<CalloutKind, string> = {
  info: 'Note',
  didyouknow: 'Did you know?',
  warning: 'Watch out',
  tip: 'Tip',
  world: 'Around the world',
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
      <div className={s.calloutTitle}>
        <span aria-hidden="true">{calloutIcon[kind]}</span>
        {title ?? calloutDefaultTitle[kind]}
      </div>
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
    <div role="radiogroup" aria-label={label} className={s.segmented}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
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
