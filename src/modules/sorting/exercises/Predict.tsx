import { useState } from 'react'
import type { ExerciseRenderProps } from '../../../components/exercises/ExerciseShell'
import { SelectItems } from '../../../components/exercises/formats'
import { Button } from '../../../components/ui'
import { makePredictTask } from './generators'
import { PickBar } from './PickBars'
import s from '../sorting.module.css'

export function Predict({ submit, locked, revealed }: ExerciseRenderProps) {
  const [task] = useState(() => makePredictTask())
  const max = Math.max(...task.state.values)
  const correct = task.answer ?? []
  const noSwapRight = task.answer === null

  return (
    <div>
      <p className={s.question}>
        {task.algorithm === 'bubble' ? (
          <>
            Bubble Sort is in the middle of a pass and is comparing the two <strong>orange</strong>{' '}
            values (▲). Which two values will it swap next? If it will not swap them, choose
            &ldquo;No swap&rdquo;.
          </>
        ) : (
          <>
            Selection Sort is starting a new pass. The green values (✓) are already sorted. Which
            two values will this pass swap? If no swap is needed, choose &ldquo;No swap&rdquo;.
          </>
        )}
      </p>
      <SelectItems
        items={task.state.values}
        count={2}
        label="Values"
        correctIndices={correct}
        renderItem={(_, i) => <PickBar state={task.state} index={i} max={max} />}
        evaluate={(sel) => {
          const right = !noSwapRight && sel[0] === correct[0] && sel[1] === correct[1]
          return { correct: right, explanation: task.explanation }
        }}
        submit={submit}
        locked={locked}
        revealed={revealed}
        extra={
          <Button
            variant="ghost"
            onClick={() => submit({ correct: noSwapRight, explanation: task.explanation })}
          >
            No swap
          </Button>
        }
      />
      {(locked || revealed) && noSwapRight && (
        <p className={s.progressLine}>The correct answer was &ldquo;No swap&rdquo;.</p>
      )}
    </div>
  )
}
