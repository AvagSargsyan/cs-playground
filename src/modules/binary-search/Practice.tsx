import { useState } from 'react'
import { shuffle } from '../../algorithms/shared'
import { pickTarget } from '../../algorithms/search'
import {
  PracticeRunner,
  type ExerciseDef,
  type ExerciseRenderProps,
} from '../../components/exercises/ExerciseShell'
import { DragMatch, MultipleChoice, SelectItems } from '../../components/exercises/formats'
import { Button } from '../../components/ui'
import type { ModuleId } from '../../content/modules'
import { PracticeIntro } from '../shared/lesson'
import { CellArray } from './CellArray'
import {
  COMPLEXITY_PAIRS,
  makeDirectionTask,
  makeMidpointTask,
  makeMistakeTask,
  midOf,
  sortedValues,
} from './generators'
import s from './binarySearch.module.css'

/*
 * Each exercise is a component so its random task is created once per attempt (in useState),
 * not on every render. The shell remounts it on retry, which gives a fresh variant.
 */

/* ------------------------------ 1. Midpoint ------------------------------ */

function MidpointExercise(p: ExerciseRenderProps) {
  const [t] = useState(() => makeMidpointTask())
  const len = t.right - t.left + 1
  return (
    <>
      <ul className={s.facts}>
        <li>
          LEFT = <strong>{t.left}</strong>
        </li>
        <li>
          RIGHT = <strong>{t.right}</strong>
        </li>
        <li>
          Items in range: <strong>{len}</strong>
        </li>
      </ul>
      <SelectItems
        {...p}
        items={t.values}
        count={1}
        correctIndices={[t.mid]}
        label="Array cells: click the middle one"
        renderItem={(v, i) => (
          <span className={`${s.pickCell} ${i < t.left || i > t.right ? s.pickCellOut : ''}`}>
            <span>
              <small>{i}</small>
              {v}
            </span>
          </span>
        )}
        evaluate={([i]) => {
          const formula = `(${t.left} + ${t.right}) div 2 = ${t.left + t.right} div 2 = ${t.mid}`
          if (i === t.mid)
            return {
              correct: true,
              explanation: (
                <p>
                  MID = {formula}.{' '}
                  {len % 2 === 0 &&
                    'With an even number of items there are two middles; div rounds down, so it is the left one.'}
                </p>
              ),
            }
          const hint =
            i === t.mid + 1 && len % 2 === 0
              ? 'You picked the right-hand of the two middles. div rounds down, so binary search uses the left one.'
              : i < t.left || i > t.right
                ? 'That cell is outside the range from LEFT to RIGHT.'
                : 'Use the indices (the small numbers), not the values.'
          return {
            correct: false,
            explanation: (
              <p>
                {hint} MID = {formula}.
              </p>
            ),
          }
        }}
      />
    </>
  )
}

/* ------------------------------ 2. Direction ------------------------------ */

function DirectionExercise(p: ExerciseRenderProps) {
  const [t] = useState(() => makeDirectionTask())
  const v = t.values[t.mid]
  const why = {
    found: `${v} equals the target ${t.target}, so the search is over: return index ${t.mid}.`,
    right: `${v} < ${t.target}. Everything left of the middle is even smaller, so the target can only be to the right: LEFT = MID + 1 = ${t.mid + 1}.`,
    left: `${v} > ${t.target}. Everything right of the middle is even bigger, so the target can only be to the left: RIGHT = MID − 1 = ${t.mid - 1}.`,
  }
  return (
    <>
      <ul className={s.facts}>
        <li>
          Target: <strong>{t.target}</strong>
        </li>
        <li>
          MID = {t.mid}, A[MID] = <strong>{v}</strong>
        </li>
      </ul>
      <div className={`${s.exerciseCells} ${s.exerciseCellsSpaced}`}>
        <CellArray
          view={{
            values: t.values,
            left: t.left,
            right: t.right,
            mid: t.mid,
            dimOutside: [t.left, t.right],
          }}
          size="sm"
          label="Current search state"
        />
      </div>
      <MultipleChoice
        {...p}
        correctId={t.answer}
        choices={[
          {
            id: 'left',
            label: 'Search the left half (RIGHT = MID − 1)',
            why: t.answer === 'left' ? why.left : `Not left: ${why[t.answer]}`,
          },
          {
            id: 'right',
            label: 'Search the right half (LEFT = MID + 1)',
            why: t.answer === 'right' ? why.right : `Not right: ${why[t.answer]}`,
          },
          {
            id: 'found',
            label: 'Found it: stop here',
            why: t.answer === 'found' ? why.found : `Not yet: ${why[t.answer]}`,
          },
        ]}
      />
    </>
  )
}

/* ------------------------------ 3. Complete the search ------------------------------ */

type RunPhase = 'pick' | 'decide' | 'done'

/**
 * The student runs the whole search: click the middle cell, then decide what to do. Mistakes are
 * explained on the spot and cost a little score, but the run always continues to the end.
 */
function CompleteSearchExercise({ submit, locked }: ExerciseRenderProps) {
  const [{ values, target }] = useState(() => {
    const values = sortedValues(13)
    return { values, target: pickTarget(values, Math.random() < 0.75) }
  })
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(values.length - 1)
  const [mid, setMid] = useState<number | undefined>()
  const [eliminated, setEliminated] = useState<number[]>([])
  const [phase, setPhase] = useState<RunPhase>('pick')
  const [mistakes, setMistakes] = useState(0)
  const [comparisons, setComparisons] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const [foundIndex, setFoundIndex] = useState<number | undefined>()

  const finish = (found: boolean, errs: number, comps: number) => {
    setPhase('done')
    const score = Math.max(0, 1 - errs * 0.2)
    submit({
      correct: errs === 0,
      score,
      explanation: (
        <p>
          {found
            ? `${target} was found at index ${values.indexOf(target)} after ${comps} comparison${comps === 1 ? '' : 's'}.`
            : `${target} is not in the array: the range became empty after ${comps} comparison${comps === 1 ? '' : 's'}.`}{' '}
          {errs === 0
            ? 'You made every decision correctly.'
            : `You made ${errs} mistake${errs === 1 ? '' : 's'} on the way; each one costs 20% of the score.`}
        </p>
      ),
    })
  }

  const mistake = (msg: string) => {
    setMistakes((m) => m + 1)
    setHint(msg)
  }

  const pick = (i: number) => {
    if (phase !== 'pick' || locked) return
    const correctMid = midOf(left, right)
    if (i !== correctMid) {
      return mistake(
        i < left || i > right
          ? `Index ${i} is outside the range ${left}–${right}.`
          : `MID = (${left} + ${right}) div 2 = ${correctMid}, not ${i}. Try again.`,
      )
    }
    setHint(null)
    setMid(i)
    setComparisons((c) => c + 1)
    setPhase('decide')
  }

  const decide = (choice: 'left' | 'right' | 'found') => {
    if (phase !== 'decide' || mid === undefined) return
    const v = values[mid]
    const answer = v === target ? 'found' : v < target ? 'right' : 'left'
    if (choice !== answer) {
      return mistake(
        answer === 'found'
          ? `${v} is the target. Stop here.`
          : answer === 'right'
            ? `${v} < ${target}, so the target can only be to the right.`
            : `${v} > ${target}, so the target can only be to the left.`,
      )
    }
    setHint(null)
    if (answer === 'found') {
      setFoundIndex(mid)
      return finish(true, mistakes, comparisons)
    }
    const nextLeft = answer === 'right' ? mid + 1 : left
    const nextRight = answer === 'left' ? mid - 1 : right
    const ruledOut =
      answer === 'right'
        ? [...Array(mid - left + 1)].map((_, k) => left + k)
        : [...Array(right - mid + 1)].map((_, k) => mid + k)
    setEliminated((e) => [...e, ...ruledOut])
    setLeft(nextLeft)
    setRight(nextRight)
    setMid(undefined)
    setPhase('pick')
  }

  const declareEmpty = () => {
    if (phase !== 'pick') return
    if (left <= right)
      return mistake(
        `The range ${left}–${right} still has ${right - left + 1} item${right - left === 0 ? '' : 's'}. Pick the middle.`,
      )
    setHint(null)
    setFoundIndex(-1)
    finish(false, mistakes, comparisons)
  }

  const status =
    phase === 'pick'
      ? left <= right
        ? `LEFT = ${left}, RIGHT = ${right}. Click the middle cell.`
        : `LEFT = ${left} is now greater than RIGHT = ${right}. What does that mean?`
      : phase === 'decide' && mid !== undefined
        ? `A[${mid}] = ${values[mid]}. The target is ${target}. What next?`
        : 'Search finished.'

  return (
    <div className={s.runPanel}>
      <ul className={s.facts}>
        <li>
          Target: <strong>{target}</strong>
        </li>
        <li>
          Comparisons: <strong>{comparisons}</strong>
        </li>
        <li className={s.runScore}>Mistakes: {mistakes}</li>
      </ul>
      <div className={s.exerciseCells}>
        <CellArray
          view={{
            values,
            left: left <= right ? left : undefined,
            right: left <= right ? right : undefined,
            mid,
            eliminated,
            foundIndex,
          }}
          size="sm"
          label="Array: click a cell to choose MID"
          onCellClick={phase === 'pick' && !locked && left <= right ? pick : undefined}
        />
      </div>
      <p className={s.runStatus} role="status">
        {status}
      </p>
      {hint && (
        <p className={s.runHint} role="alert">
          ✗ {hint}
        </p>
      )}
      {phase === 'decide' && (
        <div className={s.runActions}>
          <Button variant="ghost" onClick={() => decide('left')}>
            ← Search left
          </Button>
          <Button variant="ghost" onClick={() => decide('right')}>
            Search right →
          </Button>
          <Button onClick={() => decide('found')}>Found it</Button>
        </div>
      )}
      {phase === 'pick' && (
        <div className={s.runActions}>
          <Button variant="ghost" onClick={declareEmpty}>
            The range is empty: not found
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ 4. Find the mistake ------------------------------ */

function MistakeExercise(p: ExerciseRenderProps) {
  const [t] = useState(() => makeMistakeTask())
  return (
    <SelectItems
      {...p}
      layout="column"
      items={t.rows}
      count={1}
      correctIndices={[t.wrongRow]}
      label="Steps of the search: click the wrong one"
      renderItem={(row, i) => (
        <span className={s.stepRow}>
          <span className={s.stepNo}>{i === 0 ? 'Start' : `Step ${i}`}</span>
          <span>{i === 0 ? row.text.replace(/^Start: /, '') : row.text}</span>
        </span>
      )}
      evaluate={([i]) => ({
        correct: i === t.wrongRow,
        explanation: (
          <p>
            {i === t.wrongRow
              ? t.why
              : `That ${i === 0 ? 'start' : 'step'} is fine. The mistake is in ${t.wrongRow === 0 ? 'the start' : `step ${t.wrongRow}`}: ${t.why}`}
          </p>
        ),
      })}
    />
  )
}

/* ------------------------------ 5. Complexity ------------------------------ */

function ComplexityExercise(p: ExerciseRenderProps) {
  const [order] = useState(() => shuffle(COMPLEXITY_PAIRS.map((c) => String(c.size))))
  return (
    <DragMatch
      {...p}
      promptHeading="Sorted array size"
      answerHeading="Most comparisons binary search needs"
      pairs={COMPLEXITY_PAIRS.map((c) => ({
        id: String(c.size),
        prompt: c.label,
        answer: String(c.max),
      }))}
      answerOrder={order}
      evaluate={(assign) => {
        const right = COMPLEXITY_PAIRS.filter(
          (c) => assign[String(c.size)] === String(c.size),
        ).length
        return {
          correct: right === COMPLEXITY_PAIRS.length,
          score: right / COMPLEXITY_PAIRS.length,
          explanation: (
            <p>
              {right} of {COMPLEXITY_PAIRS.length} correct. Each comparison halves the range, so the
              maximum is the number of halvings plus one: 10 → 4, 100 → 7, 1,000 → 10 and 1,000,000
              → 20. Making the array 1,000 times bigger only adds about 10 comparisons.
            </p>
          ),
        }
      }}
    />
  )
}

/* ------------------------------ Exercise list ------------------------------ */

const EXERCISES: ExerciseDef[] = [
  {
    id: 'search-midpoint',
    title: 'Find the midpoint',
    format: 'Select an element',
    instructions: (
      <p>
        Binary search is working on the range from LEFT to RIGHT (faded cells are outside it). Click
        the cell binary search checks next. Small numbers are the indices.
      </p>
    ),
    render: (p) => <MidpointExercise {...p} />,
    solution: (
      <p>
        MID = (LEFT + RIGHT) div 2, where div rounds down. With an even number of items in range,
        that is the left one of the two middle cells.
      </p>
    ),
  },
  {
    id: 'search-direction',
    title: 'Choose the next direction',
    format: 'Predict the next step',
    instructions: (
      <p>Binary search has just read the middle value (orange). What should it do next?</p>
    ),
    render: (p) => <DirectionExercise {...p} />,
    solution: (
      <p>
        Compare the middle value with the target. Equal: found. Middle smaller than the target: go
        right (LEFT = MID + 1). Middle bigger: go left (RIGHT = MID − 1).
      </p>
    ),
  },
  {
    id: 'search-complete',
    title: 'Complete the search',
    format: 'Interactive execution',
    instructions: (
      <p>
        You are the algorithm. Click the middle cell of the range, then decide where to search next.
        Keep going until you find the target or the range is empty.
      </p>
    ),
    render: (p) => <CompleteSearchExercise {...p} />,
    solution: (
      <ol>
        <li>Click MID = (LEFT + RIGHT) div 2.</li>
        <li>If A[MID] is the target, choose “Found it”.</li>
        <li>If A[MID] is smaller, search right; if bigger, search left.</li>
        <li>When LEFT is greater than RIGHT, the range is empty: not found.</li>
      </ol>
    ),
  },
  {
    id: 'search-mistake',
    title: 'Find the mistake',
    format: 'Select a step',
    instructions: (
      <p>
        Someone ran binary search by hand and made exactly one mistake. Click the first wrong line.
      </p>
    ),
    render: (p) => <MistakeExercise {...p} />,
    solution: (
      <p>
        Check each line: is the list sorted? Is MID = (LEFT + RIGHT) div 2? Does the search go the
        right way? Does the new LEFT or RIGHT skip past MID (MID + 1 or MID − 1)?
      </p>
    ),
  },
  {
    id: 'search-complexity',
    title: 'Complexity challenge',
    format: 'Drag and match',
    instructions: (
      <p>
        Match each sorted array size with the largest number of comparisons binary search could need
        to find an item in it.
      </p>
    ),
    render: (p) => <ComplexityExercise {...p} />,
    solution: (
      <p>10 items → 4, 100 → 7, 1,000 → 10, 1,000,000 → 20. The worst case is floor(log₂ n) + 1.</p>
    ),
  },
]

export default function Practice({ moduleId }: { moduleId: ModuleId }) {
  return (
    <>
      <PracticeIntro>
        Five exercises, one at a time. Each one gives instant feedback and explains the answer.
        Press “Try another one” for a new version of any exercise.
      </PracticeIntro>
      <div className="container">
        <PracticeRunner moduleId={moduleId} exercises={EXERCISES} />
      </div>
    </>
  )
}
