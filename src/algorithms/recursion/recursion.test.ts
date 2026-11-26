import { describe, expect, it } from 'vitest'
import {
  countdown,
  factorial,
  factorialValue,
  MAX_RECURSION_INPUT,
  RECURSION_EXAMPLES,
  RECURSION_LISTINGS,
} from './index'

const last = <T>(a: T[]) => a[a.length - 1]

describe('countdown', () => {
  it('outputs 5, 4, 3, 2, 1, Done for n = 5', () => {
    expect(last(countdown(5)).state.output).toEqual(['5', '4', '3', '2', '1', 'Done'])
  })

  it('outputs only Done for n = 0', () => {
    expect(last(countdown(0)).state.output).toEqual(['Done'])
  })

  it('makes n + 1 calls, reaches depth n + 1 and ends with an empty stack', () => {
    for (let n = 0; n <= MAX_RECURSION_INPUT; n++) {
      const end = last(countdown(n))
      expect(end.kind).toBe('done')
      expect(end.stats).toEqual({ calls: n + 1, depth: 0, maxDepth: n + 1 })
      expect(end.state.stack).toEqual([])
    }
  })

  it('hits the base case exactly once, at N = 0, on top of the stack', () => {
    const trace = countdown(3)
    const base = trace.filter((s) => s.state.stack.some((f) => f.status === 'base-case'))
    expect(base.length).toBeGreaterThan(0)
    for (const s of base) {
      const top = last(s.state.stack)
      expect(top.arg).toBe(0)
      expect(top.status).toBe('base-case')
    }
  })

  it('returns in reverse call order', () => {
    const trace = countdown(3)
    const callOrder = trace.filter((s) => s.kind === 'call').map((s) => last(s.state.stack).arg)
    const returnOrder = trace
      .filter((s) => s.kind === 'return')
      .map((s) => s.state.stack.find((f) => f.id === s.state.activeId)!.arg)
    expect(callOrder).toEqual([3, 2, 1, 0])
    expect(returnOrder).toEqual([0, 1, 2, 3])
  })
})

describe('factorial', () => {
  it('computes 0! to 6! correctly', () => {
    for (let n = 0; n <= 6; n++) {
      const end = last(factorial(n))
      expect(end.state.lastReturn).toBe(factorialValue(n))
      expect(end.kind).toBe('done')
    }
    expect([0, 1, 2, 3, 4, 5, 6].map(factorialValue)).toEqual([1, 1, 2, 6, 24, 120, 720])
  })

  it('shows pending work like "4 × ?" and then "4 × 6"', () => {
    const trace = factorial(4)
    const frames = trace.flatMap((s) => s.state.stack.filter((f) => f.arg === 4))
    expect(frames.some((f) => f.pending === '4 × ?')).toBe(true)
    expect(frames.some((f) => f.pending === '4 × 6' && f.returnValue === 24)).toBe(true)
  })

  it('tracks calls and depth', () => {
    const trace = factorial(4)
    expect(last(trace).stats).toEqual({ calls: 5, depth: 0, maxDepth: 5 })
    const deepest = Math.max(...trace.map((s) => s.stats.depth))
    expect(deepest).toBe(5)
  })

  it('rejects inputs outside 0–6', () => {
    expect(() => factorial(-1)).toThrow(RangeError)
    expect(() => factorial(7)).toThrow(RangeError)
    expect(() => countdown(2.5)).toThrow(RangeError)
  })
})

describe('snapshots and listings', () => {
  it.each(['countdown', 'factorial'] as const)('%s: steps do not share references', (id) => {
    const trace = RECURSION_EXAMPLES[id].trace(4)
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i].state.stack).not.toBe(trace[i - 1].state.stack)
      expect(trace[i].state.output).not.toBe(trace[i - 1].state.output)
      trace[i].state.stack.forEach((f) => {
        const prev = trace[i - 1].state.stack.find((p) => p.id === f.id)
        if (prev) expect(f).not.toBe(prev)
      })
    }
  })

  it.each(['countdown', 'factorial'] as const)('%s: lines are inside the listings', (id) => {
    const { pseudocode, python } = RECURSION_LISTINGS[id]
    for (const s of RECURSION_EXAMPLES[id].trace(4)) {
      expect(s.line).toBeGreaterThanOrEqual(0)
      expect(s.line).toBeLessThanOrEqual(pseudocode.lines)
      expect(s.pyLine).toBeGreaterThanOrEqual(0)
      expect(s.pyLine).toBeLessThanOrEqual(python.lines)
      expect(s.message.length).toBeGreaterThan(5)
    }
  })
})
