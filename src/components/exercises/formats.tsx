import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '../ui'
import { cx } from '../ui/cx'
import type { ExerciseRenderProps, Verdict } from './ExerciseShell'
import s from './exercises.module.css'

type Base = Pick<ExerciseRenderProps, 'submit' | 'locked' | 'revealed'>

/* ------------------------------- Multiple choice ------------------------------- */

export type Choice = { id: string; label: ReactNode; why: ReactNode }

export function MultipleChoice({
  choices,
  correctId,
  submit,
  locked,
  revealed,
  label = 'Choose one answer',
}: Base & { choices: Choice[]; correctId: string; label?: string }) {
  const [picked, setPicked] = useState<string | null>(null)
  const check = () => {
    const c = choices.find((x) => x.id === picked)!
    submit({ correct: picked === correctId, explanation: c.why })
  }
  return (
    <fieldset className={s.choices} disabled={locked}>
      <legend className="visually-hidden">{label}</legend>
      {choices.map((c) => {
        const isPicked = picked === c.id
        const mark =
          (locked || revealed) && c.id === correctId ? 'right' : locked && isPicked ? 'wrong' : null
        return (
          <label
            key={c.id}
            className={cx(s.choice, isPicked && s.choicePicked, mark && s[`mark-${mark}`])}
          >
            <input
              type="radio"
              name="choice"
              value={c.id}
              checked={isPicked}
              onChange={() => setPicked(c.id)}
            />
            <span className={s.choiceLabel}>{c.label}</span>
            {mark && (
              <span
                className={s.markIcon}
                aria-label={mark === 'right' ? 'correct answer' : 'your answer, incorrect'}
              >
                {mark === 'right' ? '✓' : '✗'}
              </span>
            )}
          </label>
        )
      })}
      {!locked && (
        <div className={s.submitRow}>
          <Button onClick={check} disabled={!picked}>
            Check answer
          </Button>
        </div>
      )}
    </fieldset>
  )
}

/* ------------------------------- Numeric input ------------------------------- */

export function NumericAnswer({
  answer,
  submit,
  locked,
  revealed,
  label,
  explain,
  suffix,
}: Base & {
  answer: number
  label: string
  /** Builds the explanation from the student's value. */
  explain: (value: number, correct: boolean) => ReactNode
  suffix?: string
}) {
  const [text, setText] = useState('')
  const value = Number(text)
  const valid = text.trim() !== '' && Number.isFinite(value)
  return (
    <form
      className={s.numeric}
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid || locked) return
        submit({ correct: value === answer, explanation: explain(value, value === answer) })
      }}
    >
      <label className={s.numericLabel}>
        <span>{label}</span>
        <span className={s.numericField}>
          <input
            inputMode="numeric"
            value={revealed ? String(answer) : text}
            onChange={(e) => setText(e.target.value.replace(/[^\d-]/g, ''))}
            readOnly={locked}
            aria-invalid={locked && value !== answer}
          />
          {suffix && <span>{suffix}</span>}
        </span>
      </label>
      {!locked && (
        <Button type="submit" disabled={!valid}>
          Check answer
        </Button>
      )}
    </form>
  )
}

/* ------------------------------- Select items ------------------------------- */

/**
 * Pick exactly `count` items from a row (array cells, bars, steps…). The caller renders each
 * item and decides what is correct.
 */
export function SelectItems<T>({
  items,
  count,
  renderItem,
  evaluate,
  submit,
  locked,
  revealed,
  correctIndices,
  label,
  layout = 'row',
  extra,
}: Base & {
  items: T[]
  count: number
  renderItem: (
    item: T,
    index: number,
    state: { selected: boolean; mark: 'right' | 'wrong' | null },
  ) => ReactNode
  evaluate: (selected: number[]) => Verdict
  correctIndices: number[]
  label: string
  layout?: 'row' | 'column'
  /** Extra answer button(s) next to Check, e.g. "No swap needed". */
  extra?: ReactNode
}) {
  const [selected, setSelected] = useState<number[]>([])
  const toggle = (i: number) => {
    if (locked) return
    setSelected((sel) =>
      sel.includes(i)
        ? sel.filter((x) => x !== i)
        : count === 1
          ? [i]
          : sel.length < count
            ? [...sel, i]
            : sel,
    )
  }
  return (
    <div>
      <div
        role="group"
        aria-label={label}
        className={cx(s.selectItems, layout === 'column' && s.selectColumn)}
      >
        {items.map((it, i) => {
          const isSel = selected.includes(i)
          const isRight = correctIndices.includes(i)
          const mark: 'right' | 'wrong' | null =
            (locked || revealed) && isRight && (isSel || revealed)
              ? 'right'
              : locked && isSel && !isRight
                ? 'wrong'
                : null
          return (
            <button
              key={i}
              type="button"
              className={cx(s.selectItem, isSel && s.selectItemOn, mark && s[`mark-${mark}`])}
              aria-pressed={isSel}
              disabled={locked}
              onClick={() => toggle(i)}
            >
              {renderItem(it, i, { selected: isSel, mark })}
            </button>
          )
        })}
      </div>
      {!locked && (
        <div className={s.submitRow}>
          <Button
            onClick={() => submit(evaluate([...selected].sort((a, b) => a - b)))}
            disabled={selected.length !== count}
          >
            Check answer
          </Button>
          {extra}
          <span className={s.hintText}>
            {count === 1 ? 'Select one.' : `Selected ${selected.length} of ${count}.`}
          </span>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- Select a code line ------------------------------- */

export function SelectLine({
  code,
  correctLine,
  evaluate,
  submit,
  locked,
  revealed,
  label = 'Click a line of code',
}: Base & {
  code: string
  correctLine: number
  evaluate: (line: number) => Verdict
  label?: string
}) {
  const lines = useMemo(() => code.trimEnd().split('\n'), [code])
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div>
      <div role="radiogroup" aria-label={label} className={s.codeSelect}>
        {lines.map((text, i) => {
          const n = i + 1
          const isPicked = picked === n
          const mark =
            (locked || revealed) && n === correctLine && (isPicked || revealed)
              ? 'right'
              : locked && isPicked
                ? 'wrong'
                : null
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={locked}
              className={cx(
                s.codeSelectLine,
                isPicked && s.codeSelectOn,
                mark && s[`mark-${mark}`],
              )}
              onClick={() => setPicked(n)}
            >
              <span className={s.codeSelectNo} aria-hidden="true">
                {n}
              </span>
              <code>{text || ' '}</code>
            </button>
          )
        })}
      </div>
      {!locked && (
        <div className={s.submitRow}>
          <Button onClick={() => picked && submit(evaluate(picked))} disabled={picked === null}>
            Check answer
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- Drag & arrange ------------------------------- */

export type ArrangeItem = { id: string; label: ReactNode }

function SortableRow({
  item,
  index,
  locked,
  mark,
}: {
  item: ArrangeItem
  index: number
  locked: boolean
  mark: 'right' | 'wrong' | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: locked,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(s.arrangeRow, isDragging && s.dragging, mark && s[`mark-${mark}`])}
      {...attributes}
      {...listeners}
    >
      <span className={s.arrangeIndex}>{index + 1}</span>
      <span className={s.arrangeLabel}>{item.label}</span>
      {!locked && (
        <span className={s.grip} aria-hidden="true">
          ⋮⋮
        </span>
      )}
      {mark && <span className={s.markIcon}>{mark === 'right' ? '✓' : '✗'}</span>}
    </li>
  )
}

/**
 * Drag items into order. Keyboard: focus an item, Space to pick up, arrows to move, Space to drop.
 * Buttons ▲▼ are offered too, for touch screens where dragging is fiddly.
 */
export function DragArrange({
  initial,
  correctOrder,
  evaluate,
  submit,
  locked,
  revealed,
  label,
}: Base & {
  initial: ArrangeItem[]
  correctOrder: string[]
  evaluate: (order: string[]) => Verdict
  label: string
}) {
  const [items, setItems] = useState(initial)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const shown = revealed ? correctOrder.map((id) => initial.find((i) => i.id === id)!) : items
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setItems((list) => {
      const from = list.findIndex((i) => i.id === active.id)
      const to = list.findIndex((i) => i.id === over.id)
      return arrayMove(list, from, to)
    })
  }
  const move = (i: number, d: -1 | 1) => setItems((l) => arrayMove(l, i, i + d))

  return (
    <div>
      <p className={s.hintText}>
        Drag the rows, or focus a row and press <kbd>Space</kbd>, then the arrow keys.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={shown.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ol className={s.arrange} aria-label={label}>
            {shown.map((it, i) => (
              <div key={it.id} className={s.arrangeWrap}>
                <SortableRow
                  item={it}
                  index={i}
                  locked={locked || revealed}
                  mark={locked || revealed ? (correctOrder[i] === it.id ? 'right' : 'wrong') : null}
                />
                {!locked && !revealed && (
                  <span className={s.moveButtons}>
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === shown.length - 1}
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </span>
                )}
              </div>
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {!locked && (
        <div className={s.submitRow}>
          <Button onClick={() => submit(evaluate(items.map((i) => i.id)))}>Check order</Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- Drag & match ------------------------------- */

export type MatchPair = { id: string; prompt: ReactNode; answer: ReactNode }

function DraggableAnswer({
  id,
  children,
  disabled,
  onPick,
  active,
}: {
  id: string
  children: ReactNode
  disabled: boolean
  onPick: () => void
  active: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  })
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cx(s.token, isDragging && s.dragging, active && s.tokenActive)}
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={onPick}
      disabled={disabled}
      {...listeners}
      {...attributes}
    >
      {children}
    </button>
  )
}

function DropSlot({
  id,
  children,
  onClick,
  mark,
  disabled,
}: {
  id: string
  children: ReactNode
  onClick: () => void
  mark: 'right' | 'wrong' | null
  disabled: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled })
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cx(s.slot, isOver && s.slotOver, mark && s[`mark-${mark}`])}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

/**
 * Match each prompt to an answer by dragging answer tokens onto slots.
 * Click alternative: tap a token, then tap a slot (works with keyboard and touch).
 */
export function DragMatch({
  pairs,
  answerOrder,
  evaluate,
  submit,
  locked,
  revealed,
  promptHeading,
  answerHeading,
}: Base & {
  pairs: MatchPair[]
  /** Order in which answer tokens are displayed (shuffled by caller). */
  answerOrder: string[]
  evaluate: (assignment: Record<string, string | undefined>) => Verdict
  promptHeading: string
  answerHeading: string
}) {
  const [assign, setAssign] = useState<Record<string, string | undefined>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const used = new Set(Object.values(assign).filter(Boolean))
  const answerOf = (id: string) => pairs.find((p) => p.id === id)!.answer

  const place = (slot: string, token: string) =>
    setAssign((a) => {
      const next = { ...a }
      for (const k of Object.keys(next)) if (next[k] === token) next[k] = undefined
      next[slot] = token
      return next
    })

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) place(String(over.id).replace('slot:', ''), String(active.id))
    setPicked(null)
  }

  const shown = revealed ? Object.fromEntries(pairs.map((p) => [p.id, p.id])) : assign
  const complete = pairs.every((p) => assign[p.id])

  return (
    <div>
      <p className={s.hintText}>
        Drag each answer onto a slot, or tap an answer and then tap a slot.
      </p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className={s.match}>
          <div>
            <p className={s.matchHeading}>{answerHeading}</p>
            <div className={s.tokens}>
              {answerOrder.map((id) =>
                used.has(id) && !locked ? null : (
                  <DraggableAnswer
                    key={id}
                    id={id}
                    disabled={locked || revealed || used.has(id)}
                    active={picked === id}
                    onPick={() => setPicked((p) => (p === id ? null : id))}
                  >
                    {answerOf(id)}
                  </DraggableAnswer>
                ),
              )}
              {!locked && used.size === pairs.length && (
                <span className={s.hintText}>All placed.</span>
              )}
            </div>
          </div>
          <div>
            <p className={s.matchHeading}>{promptHeading}</p>
            <ul className={s.slots}>
              {pairs.map((p) => {
                const token = shown[p.id]
                const mark = locked || revealed ? (token === p.id ? 'right' : 'wrong') : null
                return (
                  <li key={p.id} className={s.slotRow}>
                    <span className={s.slotPrompt}>{p.prompt}</span>
                    <DropSlot
                      id={`slot:${p.id}`}
                      mark={mark}
                      disabled={locked || revealed}
                      onClick={() => {
                        if (picked) {
                          place(p.id, picked)
                          setPicked(null)
                        } else if (token) {
                          setAssign((a) => ({ ...a, [p.id]: undefined }))
                        }
                      }}
                    >
                      {token ? answerOf(token) : <span className={s.slotEmpty}>Drop here</span>}
                    </DropSlot>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </DndContext>
      {!locked && (
        <div className={s.submitRow}>
          <Button onClick={() => submit(evaluate(assign))} disabled={!complete}>
            Check matches
          </Button>
        </div>
      )}
    </div>
  )
}
