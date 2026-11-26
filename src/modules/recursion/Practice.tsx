import { useState } from 'react'
import { Button } from '../../components/ui'
import {
  PracticeRunner,
  type ExerciseDef,
  type ExerciseRenderProps,
  type Verdict,
} from '../../components/exercises/ExerciseShell'
import {
  DragArrange,
  MultipleChoice,
  NumericAnswer,
  SelectLine,
} from '../../components/exercises/formats'
import type { ModuleId } from '../../content/modules'
import { PracticeIntro } from '../shared/lesson'
import {
  arrangeScore,
  arrangeVariant,
  baseCaseVariant,
  factorialUnwind,
  fixVariant,
  nextCallVariant,
  resultVariant,
} from './exerciseData'
import s from './recursion.module.css'

/*
 * Each exercise is a component so its random variant is created once per attempt: the shell
 * remounts the body on every retry, which gives a fresh variant.
 */

/* ------------------------------ 1. Predict the next call ------------------------------ */

function NextCall(p: ExerciseRenderProps) {
  const [v] = useState(() => nextCallVariant())
  const last = v.shown[v.shown.length - 1]
  const choices = [
    ...v.options.map((arg) => ({
      id: `c-${arg}`,
      label: <code>countdown({arg})</code>,
      why:
        arg === v.next
          ? `countdown(${last}) prints ${last}, and since ${last} is not 0 it calls countdown(${last} - 1) = countdown(${v.next}).`
          : arg === last
            ? `countdown(${last}) is the call that is running now. It calls itself with ${last} - 1, not with the same number.`
            : arg > last
              ? 'Countdown always calls itself with a smaller number (n - 1), never a bigger one.'
              : `That skips a number. Each call subtracts exactly 1, so after ${last} comes ${v.next}.`,
    })),
    {
      id: 'stop',
      label: 'No more calls: it prints “Done”',
      why: `It only stops at the base case, when n is 0. Here n is ${last}, so it calls countdown(${v.next}).`,
    },
  ]
  return (
    <>
      <div className={s.trace} role="group" aria-label="Calls so far">
        {v.shown.map((k) => (
          <div key={k}>
            countdown({k}) → prints {k}
          </div>
        ))}
        <div className={s.traceNext}>next call → ?</div>
      </div>
      <MultipleChoice {...p} choices={choices} correctId={`c-${v.next}`} label="Next call" />
    </>
  )
}

/* ------------------------------ 2. Identify the base case ------------------------------ */

function BaseCase(p: ExerciseRenderProps) {
  const [v] = useState(() => baseCaseVariant())
  return (
    <>
      <p>
        Click the line in{' '}
        <code>{v.name === 'stairs' ? 'walk_down' : v.name === 'sum' ? 'sum_to' : v.name}</code> that
        checks whether to stop.
      </p>
      <SelectLine
        {...p}
        code={v.code}
        correctLine={v.baseLine}
        label="Code lines"
        evaluate={(line) => ({
          correct: line === v.baseLine,
          explanation:
            line === v.baseLine ? (
              <p>
                Yes, line {line} is the base case. {v.stops}
              </p>
            ) : (
              <p>
                Line {line} is not the stopping condition. Look for the <code>if</code> that decides
                when <em>not</em> to call the function again.
              </p>
            ),
        })}
      />
    </>
  )
}

/* ------------------------------ 3. Arrange the call stack ------------------------------ */

function Arrange(p: ExerciseRenderProps) {
  const [v] = useState(() => arrangeVariant())
  return (
    <>
      <p>
        Put these steps of <code>factorial({v.n})</code> in the order they happen. First item at the
        top.
      </p>
      <DragArrange
        {...p}
        label={`Steps of factorial(${v.n})`}
        initial={v.initial.map((e) => ({ id: e.id, label: e.label }))}
        correctOrder={v.correct.map((e) => e.id)}
        evaluate={(order) => {
          const score = arrangeScore(order, v.correct)
          return {
            correct: score === 1,
            score,
            explanation: (
              <>
                <p>
                  {score === 1
                    ? 'Exactly right.'
                    : `${Math.round(score * v.correct.length)} of ${v.correct.length} are in the right place.`}{' '}
                  All the calls happen first, going down to the base case. Then the returns come
                  back up in reverse order: the last call made is the first to return.
                </p>
                {score < 1 && (
                  <ol className={s.unwindList}>
                    {v.correct.map((e) => (
                      <li key={e.id}>{e.label}</li>
                    ))}
                  </ol>
                )}
              </>
            ),
          }
        }}
      />
    </>
  )
}

/* ------------------------------ 4. Predict the result ------------------------------ */

/** Shows the unwinding of n! one line at a time. */
function UnwindStepper({ n, answer }: { n: number; answer: number }) {
  const { down, up } = factorialUnwind(n)
  const lines = [...down, ...up]
  const [shown, setShown] = useState(1)
  return (
    <div className={s.reveal}>
      <p className={s.part}>Step through it</p>
      <ol className={s.unwindList} aria-live="polite">
        {lines.slice(0, shown).map((l, i) => (
          <li key={i}>
            {i === down.length && <strong>Now back up: </strong>}
            {l}
          </li>
        ))}
      </ol>
      {shown < lines.length ? (
        <Button size="small" variant="ghost" onClick={() => setShown((x) => x + 1)}>
          Next step
        </Button>
      ) : (
        <p>
          So factorial({n}) = <strong>{answer}</strong>.
        </p>
      )}
    </div>
  )
}

function Result(p: ExerciseRenderProps) {
  const [v] = useState(() => resultVariant())
  return (
    <>
      <p>
        Using <code>factorial(n) = n × factorial(n - 1)</code> and <code>factorial(0) = 1</code>,
        work out:
      </p>
      <NumericAnswer
        {...p}
        answer={v.answer}
        label={`factorial(${v.n}) =`}
        explain={(value, correct) =>
          correct ? (
            <p>
              Yes: {v.n}! = {Array.from({ length: v.n }, (_, i) => v.n - i).join(' × ')} ={' '}
              {v.answer}.
            </p>
          ) : value === v.n ? (
            <p>
              That is only the first factor. factorial({v.n}) also multiplies by factorial({v.n - 1}
              ).
            </p>
          ) : (
            <p>
              Multiply every whole number from {v.n} down to 1. Use the steps above to see each
              call.
            </p>
          )
        }
      />
      {(p.locked || p.revealed) && <UnwindStepper n={v.n} answer={v.answer} />}
    </>
  )
}

/* ------------------------------ 5. Fix the recursion ------------------------------ */

function Fix(p: ExerciseRenderProps) {
  const [v] = useState(() => fixVariant())
  const [line, setLine] = useState<number | null>(null)
  const lineRight = line === v.bugLine
  const partOneDone = line !== null

  const finish = (fix: Verdict) => {
    const score = (lineRight ? 0.5 : 0) + (fix.correct ? 0.5 : 0)
    p.submit({
      correct: score === 1,
      score,
      explanation: (
        <>
          <p>
            <strong>The bug:</strong> line {v.bugLine}. {v.symptom}
          </p>
          <p>
            <strong>Your fix:</strong> {fix.explanation}
          </p>
        </>
      ),
    })
  }

  return (
    <>
      <p>{v.intro}</p>
      <p className={s.part}>Part 1: click the line with the bug.</p>
      <SelectLine
        // Part 1 only records the line; the shell is told once part 2 is answered.
        submit={() => {}}
        locked={partOneDone || p.locked}
        revealed={p.revealed}
        code={v.code}
        correctLine={v.bugLine}
        label="Code lines"
        evaluate={(picked) => {
          setLine(picked)
          return { correct: picked === v.bugLine, explanation: null }
        }}
      />
      {partOneDone && (
        <p role="status" style={{ marginTop: 'var(--space-3)' }}>
          {lineRight ? '✓ Right line. ' : `✗ Not that one: the bug is on line ${v.bugLine}. `}
          {v.symptom}
        </p>
      )}
      {(partOneDone || p.revealed) && (
        <>
          <p className={s.part}>Part 2: how should it be fixed?</p>
          <MultipleChoice
            submit={finish}
            locked={p.locked}
            revealed={p.revealed}
            correctId={v.correctFix}
            label="Fix"
            choices={v.fixes.map((f) => ({ id: f.id, label: f.label, why: f.why }))}
          />
        </>
      )}
    </>
  )
}

/* ------------------------------ Exercise list ------------------------------ */

const EXERCISES: ExerciseDef[] = [
  {
    id: 'recursion-next-call',
    title: 'Predict the next call',
    format: 'Predict the next step',
    instructions: <p>Here is a countdown that has already started. What call happens next?</p>,
    render: (p) => <NextCall {...p} />,
    solution: (
      <p>
        <code>countdown(n)</code> prints n and then calls <code>countdown(n - 1)</code>, unless n is
        0. So the next call always has an argument exactly one smaller than the last one.
      </p>
    ),
  },
  {
    id: 'recursion-base-case',
    title: 'Identify the base case',
    format: 'Select a line',
    instructions: <p>Every recursive function needs a condition that stops it.</p>,
    render: (p) => <BaseCase {...p} />,
    solution: (
      <p>
        The base case is the <code>if</code> line whose branch does <em>not</em> call the function
        again. It is usually the smallest input, such as 0 or 1.
      </p>
    ),
  },
  {
    id: 'recursion-arrange',
    title: 'Arrange the call stack',
    format: 'Drag and arrange',
    instructions: <p>Calls go onto the stack and returns take them off. In what order?</p>,
    render: (p) => <Arrange {...p} />,
    solution: (
      <p>
        First every call, from the biggest n down to factorial(0). Then the returns, from
        factorial(0) back up to the first call, each one returning n × the value it got back.
      </p>
    ),
  },
  {
    id: 'recursion-result',
    title: 'Predict the result',
    format: 'Number input',
    instructions: <p>Work out what this call returns. Then step through how it gets there.</p>,
    render: (p) => <Result {...p} />,
    solution: (
      <p>
        Go down to the base case (0! = 1), then multiply on the way back up: 1! = 1, 2! = 2, 3! = 6,
        4! = 24, 5! = 120, 6! = 720.
      </p>
    ),
  },
  {
    id: 'recursion-fix',
    title: 'Fix the recursion',
    format: 'Find the bug, then fix it',
    instructions: <p>This recursive function has a bug. Find it, then choose the best fix.</p>,
    render: (p) => <Fix {...p} />,
    solution: (
      <p>
        Check two things: the base case must exist and must return the right value, and every
        recursive call must move the input <em>closer</em> to that base case.
      </p>
    ),
  },
]

export default function Practice({ moduleId }: { moduleId: ModuleId }) {
  return (
    <>
      <PracticeIntro>
        Five short exercises. Each one gives you instant feedback with an explanation. Try again as
        often as you like; most exercises give you a new example each time.
      </PracticeIntro>
      <div className="container">
        <PracticeRunner moduleId={moduleId} exercises={EXERCISES} />
      </div>
    </>
  )
}
