import type { RecursionTrace } from '../../engine/types'
import { defineListing } from '../shared'
import { checkRecursionInput, RecursionRecorder } from './recorder'

const KEYS = ['call', 'base', 'returnOne', 'recurse'] as const
type Key = (typeof KEYS)[number]

export const factorialPseudocode = defineListing<Key>(KEYS, [
  ['call', 'procedure FACTORIAL(N)'],
  ['base', '  if N == 0 then              // base case'],
  ['returnOne', '    return 1'],
  '  else                        // recursive case',
  ['recurse', '    return N * FACTORIAL(N - 1)'],
  '  end if',
  'end procedure',
])

export const factorialPython = defineListing<Key>(KEYS, [
  ['call', 'def factorial(n):'],
  ['base', '    if n == 0:  # base case'],
  ['returnOne', '        return 1'],
  '    else:  # recursive case',
  ['recurse', '        return n * factorial(n - 1)'],
])

export function factorialValue(n: number): number {
  return n === 0 ? 1 : n * factorialValue(n - 1)
}

export function factorial(n: number): RecursionTrace {
  checkRecursionInput(n)
  const rec = new RecursionRecorder<Key>(factorialPseudocode, factorialPython)

  const visit = (k: number): number => {
    const frame = rec.newFrame('factorial', k)
    const caller = rec.stack[rec.stack.length - 2]
    rec.push(
      'call',
      'call',
      caller
        ? `factorial(${caller.arg}) calls factorial(${k}). A new frame goes on top of the stack.`
        : `Call factorial(${k}). Its frame is the first one on the call stack.`,
      frame.id,
    )

    if (k === 0) {
      frame.status = 'base-case'
      frame.returnValue = 1
      rec.push(
        'base-case',
        'base',
        'N is 0: this is the base case. The answer is simply 1.',
        frame.id,
      )
      frame.status = 'returning'
      rec.lastReturn = 1
      rec.push('return', 'returnOne', 'factorial(0) returns 1 to its caller.', frame.id)
      return 1
    }

    frame.status = 'waiting'
    frame.pending = `${k} × ?`
    rec.push(
      'wait',
      'recurse',
      `N is ${k}, not 0. To finish, factorial(${k}) needs factorial(${k - 1}) first, so it waits with ${k} × ?.`,
      frame.id,
    )
    const sub = visit(k - 1)
    rec.stack.pop()
    const result = k * sub
    frame.pending = `${k} × ${sub}`
    frame.returnValue = result
    frame.status = 'returning'
    rec.lastReturn = result
    rec.push(
      'return',
      'recurse',
      `factorial(${k - 1}) gave back ${sub}, so factorial(${k}) works out ${k} × ${sub} = ${result} and returns it.`,
      frame.id,
    )
    return result
  }

  const result = visit(n)
  rec.stack.pop()
  rec.push('done', null, `All calls have returned. factorial(${n}) = ${result}.`)
  return rec.steps
}
