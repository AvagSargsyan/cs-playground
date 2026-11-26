import { useState } from 'react'
import { SORT_ALGORITHMS } from '../../../algorithms/sorting'
import type { ExerciseRenderProps } from '../../../components/exercises/ExerciseShell'
import { MultipleChoice } from '../../../components/exercises/formats'
import type { SortAlgorithmId } from '../../../engine/types'
import { StepFrames } from '../../shared/lesson'
import { MiniBars } from '../MiniBars'
import { actionLabel, makeIdentifyTask } from './generators'
import s from '../sorting.module.css'

/** What gives each algorithm away in a replay. */
const CLUES: Record<SortAlgorithmId, string> = {
  bubble: 'Bubble Sort only ever compares and swaps neighbours, starting from the left.',
  selection:
    'Selection Sort compares many values with one remembered value (◆), and swaps only once per pass.',
  insertion:
    'Insertion Sort takes one value out as a key and moves bigger values one place right to make room.',
  merge: 'Merge Sort starts by splitting the list into halves before it compares anything.',
}

export function Identify({ submit, locked, revealed }: ExerciseRenderProps) {
  const [task] = useState(() => makeIdentifyTask())
  const max = Math.max(...task.values)
  const ids: SortAlgorithmId[] = ['bubble', 'selection', 'insertion', 'merge']

  return (
    <div>
      <p className={s.question}>
        Here are the first steps an algorithm took on [{task.values.join(', ')}]. Which algorithm is
        it?
      </p>
      <div className={s.replay}>
        <StepFrames
          frames={task.frames.map((f, i) => ({
            label: `${i + 1}. ${actionLabel(f.kind)}`,
            body: <MiniBars state={f.state} max={max} />,
          }))}
        />
      </div>
      <MultipleChoice
        choices={ids.map((id) => ({
          id,
          label: SORT_ALGORITHMS[id].name,
          why:
            id === task.algorithm
              ? CLUES[id]
              : `It is ${SORT_ALGORITHMS[task.algorithm].name}. ${CLUES[task.algorithm]}`,
        }))}
        correctId={task.algorithm}
        submit={submit}
        locked={locked}
        revealed={revealed}
      />
    </div>
  )
}
