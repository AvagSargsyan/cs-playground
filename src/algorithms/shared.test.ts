import { describe, expect, it } from 'vitest'
import { defineListing, parseNumberList, presetArray, randomArray, rel } from './shared'

describe('randomArray / presetArray', () => {
  it('respects size and range', () => {
    const a = randomArray(20, 5, 9)
    expect(a).toHaveLength(20)
    expect(a.every((v) => v >= 5 && v <= 9)).toBe(true)
  })

  it('builds each preset', () => {
    const reversed = presetArray('reversed', 10)
    expect(reversed.every((v, i) => i === 0 || reversed[i - 1] >= v)).toBe(true)
    const few = presetArray('few-unique', 16)
    expect(new Set(few).size).toBeLessThanOrEqual(3)
    const nearly = presetArray('nearly-sorted', 12)
    const outOfPlace = nearly.filter((v, i) => i > 0 && nearly[i - 1] > v).length
    expect(outOfPlace).toBeLessThanOrEqual(2)
    expect(presetArray('random', 8)).toHaveLength(8)
  })
})

describe('parseNumberList', () => {
  it('accepts commas, spaces and semicolons', () => {
    expect(parseNumberList('5, 3 8;1')).toEqual({ values: [5, 3, 8, 1] })
  })

  it('explains bad input', () => {
    expect(parseNumberList('')).toHaveProperty('error')
    expect(parseNumberList('5, x')).toEqual({ error: '"x" is not a whole number.' })
    expect(parseNumberList('5, 3.5')).toHaveProperty('error')
    expect(parseNumberList('5, 300')).toEqual({ error: 'Use numbers from 1 to 99 (found 300).' })
    expect(parseNumberList('5')).toEqual({ error: 'Enter at least 2 numbers.' })
    expect(parseNumberList('1 2 3', { maxLength: 2 })).toEqual({
      error: 'Enter at most 2 numbers.',
    })
  })
})

describe('defineListing', () => {
  it('maps keys to 1-based line numbers', () => {
    const l = defineListing(['a', 'b'] as const, ['x', ['a', 'y'], 'z', ['b', 'w']])
    expect(l.at).toEqual({ a: 2, b: 4 })
    expect(l.text).toBe('x\ny\nz\nw')
    expect(l.lines).toBe(4)
  })

  it('throws on a missing key', () => {
    expect(() => defineListing(['a', 'b'] as const, [['a', 'y']])).toThrow(/missing/)
  })
})

it('rel gives the relation symbol', () => {
  expect([rel(1, 2), rel(2, 1), rel(2, 2)]).toEqual(['<', '>', '='])
})
