import { describe, expect, it } from 'vitest'
import {
  distinctValues,
  makeCountTask,
  makeIdentifyTask,
  makeManualTask,
  makePredictTask,
  REASONS,
  SCENARIOS,
} from './exercises/generators'
import { walkthroughFrames } from './walkthrough'

const REPEAT = 100

describe('walkthrough frames', () => {
  it('start unsorted and end sorted for every algorithm', () => {
    for (const id of ['bubble', 'selection', 'insertion', 'merge'] as const) {
      const frames = walkthroughFrames(id)
      expect(frames.length).toBeGreaterThan(2)
      const last = frames[frames.length - 1].state.values
      expect(last).toEqual(last.slice().sort((a, b) => a - b))
    }
  })
})

describe('exercise generators', () => {
  it('distinctValues has no duplicates', () => {
    for (let k = 0; k < REPEAT; k++) {
      const v = distinctValues(6)
      expect(new Set(v).size).toBe(6)
    }
  })

  it('bubble predict: answer is the compared pair exactly when it is out of order', () => {
    for (let k = 0; k < REPEAT; k++) {
      const t = makePredictTask('bubble')
      const [i, j] = t.state.comparing!
      const outOfOrder = t.state.values[i] > t.state.values[j]
      expect(t.answer).toEqual(outOfOrder ? [Math.min(i, j), Math.max(i, j)] : null)
    }
  })

  it('selection predict: swaps the first unsorted value with the smallest unsorted value', () => {
    for (let k = 0; k < REPEAT; k++) {
      const t = makePredictTask('selection')
      const first = t.state.activeRange![0]
      const rest = t.state.values.slice(first)
      const minIndex = first + rest.indexOf(Math.min(...rest))
      expect(t.answer).toEqual(minIndex === first ? null : [first, minIndex])
    }
  })

  it('manual decisions match a correct execution', () => {
    for (let k = 0; k < REPEAT; k++) {
      const bubble = makeManualTask('bubble')
      for (const d of bubble.decisions) {
        if (d.kind !== 'swap-or-keep') throw new Error('wrong kind')
        const [i, j] = d.state.comparing!
        expect(d.swap).toBe(d.state.values[i] > d.state.values[j])
      }
      const selection = makeManualTask('selection')
      expect(selection.decisions).toHaveLength(4)
      for (const d of selection.decisions) {
        if (d.kind !== 'pick-min') throw new Error('wrong kind')
        const first = d.state.activeRange![0]
        expect(d.state.values[d.answer]).toBe(Math.min(...d.state.values.slice(first)))
      }
      const insertion = makeManualTask('insertion')
      expect(insertion.decisions).toHaveLength(4)
      for (const d of insertion.decisions) {
        if (d.kind !== 'pick-slot') throw new Error('wrong kind')
        const key = d.state.key!
        const smaller = d.state.values.slice(0, key.from).filter((v) => v < key.value).length
        expect(d.answer).toBe(smaller)
      }
      expect(insertion.final.values).toEqual(insertion.values.slice().sort((a, b) => a - b))
    }
  })

  it('identify replay shows a few real steps', () => {
    for (let k = 0; k < 20; k++) {
      const t = makeIdentifyTask()
      expect(t.frames.length).toBeGreaterThanOrEqual(4)
      expect(t.frames.length).toBeLessThanOrEqual(8)
    }
  })

  it('count task matches the bubble sort formula bounds', () => {
    for (let k = 0; k < REPEAT; k++) {
      const t = makeCountTask('bubble')
      expect(t.comparisons).toBeGreaterThanOrEqual(4)
      expect(t.comparisons).toBeLessThanOrEqual(10)
      expect(t.log).toHaveLength(t.comparisons)
    }
  })

  it('every scenario has a valid reason', () => {
    for (const sc of SCENARIOS) expect(REASONS.some((r) => r.id === sc.reasonId)).toBe(true)
  })
})
