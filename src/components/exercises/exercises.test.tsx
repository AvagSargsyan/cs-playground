import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { makeStore } from '../../store'
import { ExerciseShell, PracticeRunner, type ExerciseDef } from './ExerciseShell'
import { DragArrange, MultipleChoice, NumericAnswer } from './formats'

const mcq: ExerciseDef = {
  id: 'test-mcq',
  title: 'Pick B',
  format: 'Multiple choice',
  instructions: <p>Which letter?</p>,
  solution: <p>The answer is B.</p>,
  render: (p) => (
    <MultipleChoice
      {...p}
      correctId="b"
      choices={[
        { id: 'a', label: 'A', why: 'A is wrong.' },
        { id: 'b', label: 'B', why: 'B is right.' },
      ]}
    />
  ),
}

function setup(ui: React.ReactNode) {
  const store = makeStore()
  render(<Provider store={store}>{ui}</Provider>)
  return { store, user: userEvent.setup() }
}

describe('ExerciseShell', () => {
  it('gives feedback, records the attempt and allows retry', async () => {
    const { store, user } = setup(
      <ExerciseShell moduleId="sorting" def={mcq} number={1} total={1} />,
    )
    await user.click(screen.getByLabelText('B'))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText('B is right.')).toBeInTheDocument()
    expect(store.getState().progress.modules.sorting.exercises['test-mcq']).toEqual({
      attempts: 1,
      bestScore: 1,
      completed: true,
    })
    await user.click(screen.getByRole('button', { name: 'Try another one' }))
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
  })

  it('unlocks the solution only after two failed attempts', async () => {
    const { user } = setup(<ExerciseShell moduleId="sorting" def={mcq} number={1} total={1} />)
    const fail = async () => {
      await user.click(screen.getByLabelText('A'))
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
    }
    await fail()
    expect(screen.getByText('A is wrong.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show solution' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await fail()
    await user.click(screen.getByRole('button', { name: 'Show solution' }))
    expect(screen.getByText('The answer is B.')).toBeInTheDocument()
  })
})

describe('PracticeRunner', () => {
  it('marks Practice done once every exercise has been attempted', async () => {
    const second: ExerciseDef = { ...mcq, id: 'test-mcq-2', title: 'Pick B again' }
    const { store, user } = setup(<PracticeRunner moduleId="recursion" exercises={[mcq, second]} />)
    await user.click(screen.getByLabelText('A'))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(store.getState().progress.modules.recursion.stages.practice).not.toBe('done')
    await user.click(screen.getByRole('button', { name: 'Next exercise →' }))
    await user.click(screen.getByLabelText('B'))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(store.getState().progress.modules.recursion.stages.practice).toBe('done')
  })
})

describe('formats', () => {
  it('NumericAnswer checks the value', async () => {
    let result: boolean | undefined
    const { user } = setup(
      <NumericAnswer
        answer={24}
        label="4! ="
        explain={() => 'because'}
        locked={false}
        revealed={false}
        submit={(v) => (result = v.correct)}
      />,
    )
    await user.type(screen.getByLabelText('4! ='), '24')
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(result).toBe(true)
  })

  it('DragArrange can be reordered with the move buttons', async () => {
    let order: string[] = []
    const { user } = setup(
      <DragArrange
        label="Order"
        initial={[
          { id: 'b', label: 'second' },
          { id: 'a', label: 'first' },
        ]}
        correctOrder={['a', 'b']}
        evaluate={(o) => {
          order = o
          return { correct: o.join() === 'a,b', explanation: '' }
        }}
        locked={false}
        revealed={false}
        submit={() => {}}
      />,
    )
    await user.click(screen.getAllByRole('button', { name: 'Move down' })[0])
    await user.click(screen.getByRole('button', { name: 'Check order' }))
    expect(order).toEqual(['a', 'b'])
  })
})
