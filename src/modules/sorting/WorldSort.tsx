import { useMemo, useState } from 'react'
import { movedWords, sortWords, WORLD_RULES, WORLD_WORDS } from './worldRules'
import s from './sorting.module.css'

export function WorldSort() {
  const [left, setLeft] = useState('en')
  const [right, setRight] = useState('sv')
  const lists = useMemo(
    () => [sortWords(WORLD_WORDS, left), sortWords(WORLD_WORDS, right)],
    [left, right],
  )
  const moved = useMemo(() => movedWords(lists[0], lists[1]), [lists])
  const cols: [string, (v: string) => void][] = [
    [left, setLeft],
    [right, setRight],
  ]

  return (
    <div className={s.world}>
      <p>
        The same {WORLD_WORDS.length} words, sorted &ldquo;alphabetically&rdquo; with two different
        sets of rules. Choose the rules for each column. Words in a different position are
        highlighted on the right.
      </p>
      <div className={s.worldCols}>
        {cols.map(([rule, setRule], k) => {
          const info = WORLD_RULES.find((r) => r.id === rule)!
          return (
            <div key={k} className={s.worldCol}>
              <select
                value={rule}
                aria-label={k === 0 ? 'Rules for the left column' : 'Rules for the right column'}
                onChange={(e) => setRule(e.target.value)}
              >
                {WORLD_RULES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ol className={s.worldList} lang={rule === 'codes' ? undefined : rule}>
                {lists[k].map((w) => (
                  <li key={w} className={k === 1 && moved.has(w) ? s.moved : undefined}>
                    {w}
                    {k === 1 && moved.has(w) && <span className="visually-hidden"> (moved)</span>}
                  </li>
                ))}
              </ol>
              <p className={s.worldNote}>{info.note}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
