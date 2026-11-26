/**
 * Pure generators for the Recursion practice exercises. Each takes a random source so tests can
 * make them deterministic; the components call them once per attempt.
 */
import { factorialValue } from '../../algorithms/recursion'

export type Rng = () => number

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]
const intBetween = (min: number, max: number, rng: Rng) => min + Math.floor(rng() * (max - min + 1))

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/* ------------------------------ 1. Next call ------------------------------ */

export type NextCallVariant = {
  start: number
  /** Calls already shown, e.g. [5, 4, 3] for countdown(5), countdown(4), countdown(3). */
  shown: number[]
  /** Correct next argument. */
  next: number
  /** Answer options (arguments), shuffled; -1 never appears. */
  options: number[]
}

export function nextCallVariant(rng: Rng = Math.random): NextCallVariant {
  const start = intBetween(4, 9, rng)
  // Show between 2 and start-1 calls so the next call is always 1 or more.
  const count = intBetween(2, start - 1, rng)
  const shown = Array.from({ length: count }, (_, i) => start - i)
  const last = shown[shown.length - 1]
  const next = last - 1
  const distractors = [last, last + 1, next - 1].filter((v) => v >= 0)
  return { start, shown, next, options: shuffled([next, ...new Set(distractors)], rng) }
}

/* ------------------------------ 2. Base case ------------------------------ */

export type BaseCaseVariant = {
  name: string
  code: string
  /** 1-based line of the base-case condition. */
  baseLine: number
  /** What the base case does, for the explanation. */
  stops: string
}

const BASE_CASE_VARIANTS: BaseCaseVariant[] = [
  {
    name: 'countdown',
    code: `def countdown(n):
    if n == 0:
        print("Done")
    else:
        print(n)
        countdown(n - 1)`,
    baseLine: 2,
    stops: 'When n reaches 0 it prints "Done" and makes no new call.',
  },
  {
    name: 'factorial',
    code: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)`,
    baseLine: 2,
    stops: 'When n is 0 it returns 1 straight away, without calling factorial again.',
  },
  {
    name: 'stairs',
    code: `def walk_down(step):
    print("On step", step)
    if step == 0:
        print("Ground floor!")
        return
    walk_down(step - 1)`,
    baseLine: 3,
    stops: 'When step is 0 it prints "Ground floor!" and returns before the next call.',
  },
  {
    name: 'sum',
    code: `def sum_to(n):
    # adds 1 + 2 + ... + n
    if n == 1:
        return 1
    return n + sum_to(n - 1)`,
    baseLine: 3,
    stops: 'When n is 1 the answer is simply 1, so it returns without calling sum_to again.',
  },
]

export function baseCaseVariant(rng: Rng = Math.random): BaseCaseVariant {
  return pick(BASE_CASE_VARIANTS, rng)
}

/* ------------------------------ 3. Arrange ------------------------------ */

export type ArrangeEvent = { id: string; label: string }

/** Calls going down, then returns coming back up, in true execution order. */
export function factorialEvents(n: number): ArrangeEvent[] {
  const calls = Array.from({ length: n + 1 }, (_, i) => n - i).map((k) => ({
    id: `call-${k}`,
    label: `call factorial(${k})`,
  }))
  const returns = Array.from({ length: n + 1 }, (_, k) => ({
    id: `return-${k}`,
    label: `factorial(${k}) returns ${factorialValue(k)}`,
  }))
  return [...calls, ...returns]
}

export type ArrangeVariant = { n: number; correct: ArrangeEvent[]; initial: ArrangeEvent[] }

export function arrangeVariant(rng: Rng = Math.random): ArrangeVariant {
  const n = intBetween(2, 3, rng)
  const correct = factorialEvents(n)
  let initial = shuffled(correct, rng)
  // Never start in the solved order.
  while (initial.every((e, i) => e.id === correct[i].id)) initial = shuffled(correct, rng)
  return { n, correct, initial }
}

/** Fraction of positions that hold the right event. */
export function arrangeScore(order: string[], correct: ArrangeEvent[]): number {
  const right = order.filter((id, i) => id === correct[i].id).length
  return right / correct.length
}

/* ------------------------------ 4. Predict the result ------------------------------ */

/** The unwinding of n! as lines, e.g. for 3: ["3! = 3 × 2!", "2! = 2 × 1!", …, "3! = 3 × 2 = 6"]. */
export function factorialUnwind(n: number): { down: string[]; up: string[] } {
  const down: string[] = []
  for (let k = n; k > 0; k--) down.push(`${k}! = ${k} × ${k - 1}!`)
  down.push('0! = 1 (base case)')
  const up: string[] = []
  for (let k = 1; k <= n; k++)
    up.push(`${k}! = ${k} × ${factorialValue(k - 1)} = ${factorialValue(k)}`)
  return { down, up }
}

export function resultVariant(rng: Rng = Math.random): { n: number; answer: number } {
  const n = intBetween(3, 6, rng)
  return { n, answer: factorialValue(n) }
}

/* ------------------------------ 5. Fix the recursion ------------------------------ */

export type FixOption = { id: string; label: string; why: string }

export type FixVariant = {
  id: string
  intro: string
  code: string
  bugLine: number
  /** What goes wrong when the code runs. */
  symptom: string
  fixes: FixOption[]
  correctFix: string
}

const FIX_VARIANTS: FixVariant[] = [
  {
    id: 'same-n',
    intro:
      'This countdown never stops by itself. Calling countdown(3) prints 3, 3, 3, 3… until Python crashes with RecursionError.',
    code: `def countdown(n):
    if n == 0:
        print("Done")
    else:
        print(n)
        countdown(n)`,
    bugLine: 6,
    symptom:
      'It calls itself with the same n, so n never gets closer to 0 and the base case is never reached.',
    fixes: [
      {
        id: 'minus',
        label: 'Change it to countdown(n - 1)',
        why: 'Each call now has a smaller n, so it reaches 0 and stops.',
      },
      {
        id: 'plus',
        label: 'Change it to countdown(n + 1)',
        why: 'n would grow and move away from 0, so it would still never stop.',
      },
      {
        id: 'remove-base',
        label: 'Delete the if n == 0 check',
        why: 'Without a base case nothing can ever stop the calls.',
      },
    ],
    correctFix: 'minus',
  },
  {
    id: 'grows',
    intro: 'This countdown prints 3, 4, 5, 6… and crashes with a "maximum recursion depth" error.',
    code: `def countdown(n):
    if n == 0:
        print("Done")
    else:
        print(n)
        countdown(n + 1)`,
    bugLine: 6,
    symptom:
      'n goes up by 1 each call, moving away from the base case n == 0 instead of towards it.',
    fixes: [
      {
        id: 'minus',
        label: 'Change it to countdown(n - 1)',
        why: 'Now n shrinks by 1 each call until it hits 0.',
      },
      {
        id: 'base-big',
        label: 'Change the base case to if n == 100',
        why: 'It would stop for small inputs but count the wrong way and break for n > 100.',
      },
      {
        id: 'print',
        label: 'Move print(n) after the call',
        why: 'That changes the order of output, but n still keeps growing until Python crashes.',
      },
    ],
    correctFix: 'minus',
  },
  {
    id: 'skips-base',
    intro:
      'factorial(3) works, but factorial(0) never stops by itself: 0, -1, -2, -3… until Python crashes with RecursionError.',
    code: `def factorial(n):
    if n == 1:
        return 1
    return n * factorial(n - 1)`,
    bugLine: 2,
    symptom:
      'Starting from 0, n goes to -1, -2, … and never equals 1, so the base case is skipped.',
    fixes: [
      {
        id: 'zero',
        label: 'Use if n == 0: return 1',
        why: '0 is the smallest input, so every call chain reaches it. 0! = 1 by definition.',
      },
      {
        id: 'two',
        label: 'Use if n == 2: return 2',
        why: 'factorial(1) and factorial(0) would still skip past it.',
      },
      {
        id: 'minus-two',
        label: 'Call factorial(n - 2) instead',
        why: 'Odd and even inputs would still miss the base case.',
      },
    ],
    correctFix: 'zero',
  },
  {
    id: 'returns-zero',
    intro: 'This factorial always answers 0, for every input.',
    code: `def factorial(n):
    if n == 0:
        return 0
    return n * factorial(n - 1)`,
    bugLine: 3,
    symptom:
      'The base case returns 0, and anything multiplied by 0 is 0, so every answer becomes 0.',
    fixes: [
      {
        id: 'one',
        label: 'Return 1 in the base case',
        why: '0! = 1, and multiplying by 1 keeps the other factors.',
      },
      {
        id: 'plus',
        label: 'Use n + factorial(n - 1)',
        why: 'That adds instead of multiplying, so it is no longer a factorial.',
      },
      { id: 'n', label: 'Return n in the base case', why: 'n is 0 there, so it still returns 0.' },
    ],
    correctFix: 'one',
  },
]

export function fixVariant(rng: Rng = Math.random): FixVariant {
  const v = pick(FIX_VARIANTS, rng)
  return { ...v, fixes: shuffled(v.fixes, rng) }
}

export const ALL_FIX_VARIANTS = FIX_VARIANTS
export const ALL_BASE_CASE_VARIANTS = BASE_CASE_VARIANTS
