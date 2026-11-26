import { useState } from 'react'
import { SORT_ALGORITHMS } from '../../../algorithms/sorting'
import type { ExerciseRenderProps } from '../../../components/exercises/ExerciseShell'
import { NumericAnswer } from '../../../components/exercises/formats'
import { makeCountTask } from './generators'
import s from '../sorting.module.css'

export function Count({ submit, locked, revealed }: ExerciseRenderProps) {
  const [task] = useState(() => makeCountTask())
  const name = SORT_ALGORITHMS[task.algorithm].name

  return (
    <div>
      <p className={s.question}>
        {name} sorts <strong>[{task.values.join(', ')}]</strong> into ascending order. How many
        comparisons does it make in total?
        {task.algorithm === 'bubble' && ' Remember: it stops early after a pass with no swaps.'}
      </p>
      <NumericAnswer
        answer={task.comparisons}
        label="Number of comparisons"
        submit={submit}
        locked={locked}
        revealed={revealed}
        explain={(value, correct) => (
          <>
            <p>
              {correct
                ? `Yes, ${task.comparisons} comparisons.`
                : `You answered ${value}; ${name} makes ${task.comparisons} comparisons here.`}{' '}
              Here is every comparison, in order:
            </p>
            <ol className={s.traceList}>
              {task.log.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ol>
          </>
        )}
      />
    </div>
  )
}
