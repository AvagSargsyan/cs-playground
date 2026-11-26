import { useState } from 'react'
import { SORT_ALGORITHMS } from '../../../algorithms/sorting'
import type { ExerciseRenderProps } from '../../../components/exercises/ExerciseShell'
import { Button } from '../../../components/ui'
import { cx } from '../../../components/ui/cx'
import type { SortAlgorithmId } from '../../../engine/types'
import { REASONS, SCENARIOS } from './generators'
import s from '../sorting.module.css'

const ALGOS: SortAlgorithmId[] = ['bubble', 'selection', 'insertion', 'merge']

const WHY: Record<string, string> = {
  'nearly-sorted':
    'The list is almost sorted: each new result only moves a short distance, so Insertion Sort does close to n steps.',
  huge: 'Merge Sort is O(n log n) for every input, so it never becomes very slow, even for 10 million songs.',
  'few-writes':
    'Selection Sort makes at most n − 1 swaps (one per pass), far fewer writes than Bubble or Insertion Sort.',
}

export function Choose({ submit, locked, revealed, attempt }: ExerciseRenderProps) {
  const [start] = useState(() => Math.floor(Math.random() * SCENARIOS.length))
  const scenario = SCENARIOS[(start + attempt) % SCENARIOS.length]
  const [algo, setAlgo] = useState<SortAlgorithmId | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const show = locked || revealed

  const optionClass = (picked: boolean, right: boolean) =>
    cx(
      s.option,
      picked && s.optionPicked,
      show && right && s.optionRight,
      locked && picked && !right && s.optionWrong,
    )

  const check = () => {
    const a = algo === scenario.answer
    const r = reason === scenario.reasonId
    submit({
      correct: a && r,
      score: (Number(a) + Number(r)) / 2,
      explanation: (
        <p>
          {a
            ? 'Right algorithm. '
            : `The best choice is ${SORT_ALGORITHMS[scenario.answer].name}. `}
          {r ? 'Right reason. ' : 'Check the reason too. '}
          {WHY[scenario.id]}
        </p>
      ),
    })
  }

  return (
    <div>
      <div className={s.scenario}>
        <p>{scenario.text}</p>
      </div>
      <div className={s.twoPart}>
        <fieldset disabled={locked}>
          <legend>1. Which algorithm would you choose?</legend>
          {ALGOS.map((id) => (
            <label key={id} className={optionClass(algo === id, id === scenario.answer)}>
              <input type="radio" name="algo" checked={algo === id} onChange={() => setAlgo(id)} />
              {SORT_ALGORITHMS[id].name}
            </label>
          ))}
        </fieldset>
        <fieldset disabled={locked}>
          <legend>2. Why?</legend>
          {REASONS.map((r) => (
            <label key={r.id} className={optionClass(reason === r.id, r.id === scenario.reasonId)}>
              <input
                type="radio"
                name="reason"
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
              />
              {r.text}
            </label>
          ))}
        </fieldset>
      </div>
      {!locked && (
        <Button onClick={check} disabled={!algo || !reason}>
          Check answer
        </Button>
      )}
    </div>
  )
}
