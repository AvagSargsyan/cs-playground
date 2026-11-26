import { Highlight, themes } from 'prism-react-renderer'
import type { ReactNode } from 'react'
import type { CodeListing } from '../../engine/types'
import { codeTabChanged, type CodeTab } from '../../store/preferencesSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { Tabs } from '../ui'
import { cx } from '../ui/cx'
import s from './visualizers.module.css'

/* ---------------------------------- Step message ---------------------------------- */

/** One-sentence explanation of the current step. Read out by screen readers. */
export function StepMessage({
  children,
  tone,
}: {
  children: ReactNode
  tone?: 'success' | 'error'
}) {
  return (
    <div
      className={cx(s.message, tone && s[`message-${tone}`])}
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

/* ---------------------------------- Stats panel ---------------------------------- */

export type StatItem = { label: string; value: ReactNode; hint?: string; emphasis?: boolean }

export function StatsPanel({ items, title = 'Statistics' }: { items: StatItem[]; title?: string }) {
  return (
    <section className={s.panel} aria-label={title}>
      <h3 className={s.panelTitle}>{title}</h3>
      <dl className={s.stats}>
        {items.map((it) => (
          <div
            key={it.label}
            // Long text values (e.g. "countdown(5)") get a full row instead of overflowing.
            className={cx(
              s.stat,
              it.emphasis && s.statEmphasis,
              typeof it.value === 'string' && it.value.length > 8 && s.statWide,
            )}
            title={it.hint}
          >
            <dt>
              {it.label}
              {it.hint && (
                <span className={s.hint} aria-label={it.hint}>
                  {' '}
                  ⓘ
                </span>
              )}
            </dt>
            <dd>{it.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ---------------------------------- Legend ---------------------------------- */

export type LegendItem = { label: string; swatch: ReactNode }

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className={s.legend} aria-label="Legend">
      {items.map((it) => (
        <li key={it.label}>
          <span className={s.legendSwatch} aria-hidden="true">
            {it.swatch}
          </span>
          {it.label}
        </li>
      ))}
    </ul>
  )
}

/** Small square swatch with an optional symbol, so states never rely on color alone. */
export function Swatch({
  color,
  symbol,
  hatch,
}: {
  color: string
  symbol?: string
  hatch?: boolean
}) {
  return (
    <span
      className={cx(s.swatch, hatch && s.hatch)}
      style={{ background: hatch ? undefined : color, color: '#fff' }}
    >
      {symbol}
    </span>
  )
}

/* ---------------------------------- Code panel ---------------------------------- */

const theme = {
  ...themes.github,
  plain: { ...themes.github.plain, backgroundColor: 'transparent', color: '#252b33' },
}

export function CodeBlock({
  code,
  language,
  activeLine = 0,
  label,
}: {
  code: string
  language: 'python' | 'pseudocode'
  activeLine?: number
  label?: string
}) {
  return (
    <Highlight
      theme={theme}
      code={code.trimEnd()}
      language={language === 'python' ? 'python' : 'clike'}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={s.code} aria-label={label}>
          {tokens.map((line, i) => {
            const n = i + 1
            const active = n === activeLine
            const { className, ...lineProps } = getLineProps({ line })
            return (
              <div
                key={i}
                {...lineProps}
                className={cx(className, s.codeLine, active && s.codeLineActive)}
                aria-current={active ? 'step' : undefined}
              >
                <span className={s.lineNo} aria-hidden="true">
                  {n}
                </span>
                <span>
                  {line.map((token, k) => (
                    <span key={k} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}

/** Pseudocode / Python tabs with the current line highlighted. The tab choice is remembered. */
export function CodePanel({
  listing,
  line = 0,
  pyLine = 0,
  title = 'Code',
}: {
  listing: CodeListing
  line?: number
  pyLine?: number
  title?: string
}) {
  const tab = useAppSelector((st) => st.preferences.codeTab)
  const dispatch = useAppDispatch()
  return (
    <section className={s.panel} aria-label={title}>
      <div className={s.codeHeader}>
        <h3 className={s.panelTitle}>{title}</h3>
        <Tabs<CodeTab>
          label="Code language"
          value={tab}
          onChange={(t) => dispatch(codeTabChanged(t))}
          tabs={[
            { id: 'pseudocode', label: 'Pseudocode' },
            { id: 'python', label: 'Python' },
          ]}
        />
      </div>
      <CodeBlock
        code={tab === 'python' ? listing.python : listing.pseudocode}
        language={tab}
        activeLine={tab === 'python' ? pyLine : line}
        label={`${tab === 'python' ? 'Python' : 'Pseudocode'} listing`}
      />
    </section>
  )
}
