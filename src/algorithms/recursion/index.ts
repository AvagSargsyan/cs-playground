import type { CodeListing, RecursionExampleId, RecursionTrace } from '../../engine/types'
import { countdown, countdownPseudocode, countdownPython } from './countdown'
import { factorial, factorialPseudocode, factorialPython, factorialValue } from './factorial'
import { MAX_RECURSION_INPUT, MIN_RECURSION_INPUT } from './recorder'

export { countdown, factorial, factorialValue, MAX_RECURSION_INPUT, MIN_RECURSION_INPUT }

export type RecursionExample = {
  id: RecursionExampleId
  name: string
  trace: (n: number) => RecursionTrace
  code: CodeListing
  idea: string
  defaultInput: number
}

export const RECURSION_EXAMPLES: Record<RecursionExampleId, RecursionExample> = {
  countdown: {
    id: 'countdown',
    name: 'Countdown',
    trace: countdown,
    code: { pseudocode: countdownPseudocode.text, python: countdownPython.text },
    idea: 'Print N, then count down from N - 1. At 0, print "Done" and stop.',
    defaultInput: 5,
  },
  factorial: {
    id: 'factorial',
    name: 'Factorial',
    trace: factorial,
    code: { pseudocode: factorialPseudocode.text, python: factorialPython.text },
    idea: 'N! = N × (N - 1)!, and 0! = 1.',
    defaultInput: 4,
  },
}

export const RECURSION_LISTINGS = {
  countdown: { pseudocode: countdownPseudocode, python: countdownPython },
  factorial: { pseudocode: factorialPseudocode, python: factorialPython },
} as const
