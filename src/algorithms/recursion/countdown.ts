import type { RecursionTrace } from '../../engine/types'
import { defineListing } from '../shared'
import { checkRecursionInput, RecursionRecorder } from './recorder'

const KEYS = ['call', 'base', 'done', 'print', 'recurse', 'end'] as const
type Key = (typeof KEYS)[number]

export const countdownPseudocode = defineListing<Key>(KEYS, [
  ['call', 'procedure COUNTDOWN(N)'],
  ['base', '  if N == 0 then          // base case'],
  ['done', '    output "Done"'],
  '  else                    // recursive case',
  ['print', '    output N'],
  ['recurse', '    COUNTDOWN(N - 1)'],
  '  end if',
  ['end', 'end procedure'],
])

export const countdownPython = defineListing<Key>(KEYS, [
  ['call', 'def countdown(n):'],
  ['base', '    if n == 0:  # base case'],
  ['done', '        print("Done")'],
  '    else:  # recursive case',
  ['print', '        print(n)'],
  ['recurse', '        countdown(n - 1)'],
  ['end', '    # nothing left to do: return'],
])

export function countdown(n: number): RecursionTrace {
  checkRecursionInput(n)
  const rec = new RecursionRecorder<Key>(countdownPseudocode, countdownPython)

  const visit = (k: number) => {
    const frame = rec.newFrame('countdown', k)
    const caller = rec.stack[rec.stack.length - 2]
    rec.push(
      'call',
      'call',
      caller
        ? `countdown(${caller.arg}) calls countdown(${k}). A new frame goes on top of the stack.`
        : `Call countdown(${k}). Its frame is the first one on the call stack.`,
      frame.id,
    )

    if (k === 0) {
      frame.status = 'base-case'
      rec.push(
        'base-case',
        'base',
        'N is 0: this is the base case, so there is no new call.',
        frame.id,
      )
      rec.output.push('Done')
      rec.push('print', 'done', 'Output "Done". The recursion stops here.', frame.id)
    } else {
      rec.push('base-case', 'base', `N is ${k}, not 0, so this is the recursive case.`, frame.id)
      rec.output.push(String(k))
      rec.push('print', 'print', `Output ${k}.`, frame.id)
      frame.status = 'waiting'
      rec.push(
        'wait',
        'recurse',
        `countdown(${k}) now calls countdown(${k - 1}) and waits for it to finish.`,
        frame.id,
      )
      visit(k - 1)
      // The child has finished: remove it and resume this frame.
      rec.stack.pop()
    }

    frame.status = 'returning'
    rec.push(
      'return',
      'end',
      k === 0
        ? 'countdown(0) is finished and returns to its caller.'
        : `Back in countdown(${k}). It has nothing left to do, so it returns too.`,
      frame.id,
    )
  }

  visit(n)
  rec.stack.pop()
  rec.push(
    'done',
    null,
    `All ${rec.calls} calls have returned and the stack is empty. Output: ${rec.output.join(', ')}.`,
  )
  return rec.steps
}
