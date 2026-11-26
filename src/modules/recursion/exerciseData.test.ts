import { describe, expect, it } from 'vitest'
import {
  ALL_BASE_CASE_VARIANTS,
  ALL_FIX_VARIANTS,
  arrangeScore,
  arrangeVariant,
  factorialEvents,
  factorialUnwind,
  fixVariant,
  nextCallVariant,
  resultVariant,
} from './exerciseData'

/** Small deterministic generator so failures are reproducible. */
function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 2 ** 32
    return x / 2 ** 32
  }
}

describe('next call', () => {
  it('always asks for countdown(last - 1) with distinct, non-negative options', () => {
    for (let s = 1; s < 300; s++) {
      const v = nextCallVariant(seeded(s))
      const last = v.shown[v.shown.length - 1]
      expect(v.shown[0]).toBe(v.start)
      expect(v.next).toBe(last - 1)
      expect(v.next).toBeGreaterThanOrEqual(1)
      expect(v.options).toContain(v.next)
      expect(new Set(v.options).size).toBe(v.options.length)
      expect(v.options.every((o) => o >= 0)).toBe(true)
    }
  })
})

describe('base case', () => {
  it('points at an if line in every variant', () => {
    for (const v of ALL_BASE_CASE_VARIANTS) {
      expect(v.code.split('\n')[v.baseLine - 1].trim()).toMatch(/^if /)
    }
  })
})

describe('arrange', () => {
  it('lists calls going down, then returns coming back up', () => {
    expect(factorialEvents(2).map((e) => e.label)).toEqual([
      'call factorial(2)',
      'call factorial(1)',
      'call factorial(0)',
      'factorial(0) returns 1',
      'factorial(1) returns 1',
      'factorial(2) returns 2',
    ])
  })

  it('never starts solved and scores by position', () => {
    for (let s = 1; s < 100; s++) {
      const v = arrangeVariant(seeded(s))
      expect(v.initial.map((e) => e.id)).not.toEqual(v.correct.map((e) => e.id))
      expect(
        arrangeScore(
          v.correct.map((e) => e.id),
          v.correct,
        ),
      ).toBe(1)
    }
    const c = factorialEvents(2)
    const swapped = c.map((e) => e.id)
    ;[swapped[0], swapped[1]] = [swapped[1], swapped[0]]
    expect(arrangeScore(swapped, c)).toBeCloseTo(4 / 6)
  })
})

describe('predict the result', () => {
  it('unwinds n! down to the base case and back up', () => {
    expect(factorialUnwind(3)).toEqual({
      down: ['3! = 3 × 2!', '2! = 2 × 1!', '1! = 1 × 0!', '0! = 1 (base case)'],
      up: ['1! = 1 × 1 = 1', '2! = 2 × 1 = 2', '3! = 3 × 2 = 6'],
    })
  })

  it('asks for 3! to 6!', () => {
    for (let s = 1; s < 50; s++) {
      const { n, answer } = resultVariant(seeded(s))
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(6)
      expect(answer).toBe([1, 1, 2, 6, 24, 120, 720][n])
    }
  })
})

describe('fix the recursion', () => {
  it('has a valid bug line and exactly one correct fix in every variant', () => {
    for (const v of ALL_FIX_VARIANTS) {
      expect(v.bugLine).toBeGreaterThanOrEqual(1)
      expect(v.bugLine).toBeLessThanOrEqual(v.code.split('\n').length)
      expect(v.fixes.filter((f) => f.id === v.correctFix)).toHaveLength(1)
    }
  })

  it('shuffles fixes without losing any', () => {
    const v = fixVariant(seeded(7))
    const original = ALL_FIX_VARIANTS.find((x) => x.id === v.id)!
    expect(v.fixes.map((f) => f.id).sort()).toEqual(original.fixes.map((f) => f.id).sort())
  })
})
