import { describe, expect, it } from 'vitest'
import { maxBinaryComparisons } from '../../algorithms/search'
import {
  COMPLEXITY_PAIRS,
  comparisonsFor,
  makeDirectionTask,
  makeMidpointTask,
  makeMistakeTask,
  midOf,
  sortedValues,
  type MistakeKind,
} from './generators'

/** Small deterministic PRNG (mulberry32) so failures are reproducible. */
function seeded(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const isStrictlyIncreasing = (v: number[]) => v.every((x, i) => i === 0 || v[i - 1] < x)

describe('sortedValues', () => {
  it('is strictly increasing with no repeats', () => {
    for (let s = 0; s < 100; s++)
      expect(isStrictlyIncreasing(sortedValues(15, seeded(s)))).toBe(true)
  })
})

describe('makeMidpointTask', () => {
  it('uses floor((left + right) / 2) and honours the even/odd request', () => {
    for (let s = 0; s < 200; s++) {
      const even = s % 2 === 0
      const t = makeMidpointTask(seeded(s), even)
      expect(t.mid).toBe(Math.floor((t.left + t.right) / 2))
      expect((t.right - t.left + 1) % 2 === 0).toBe(even)
      expect(t.left).toBeGreaterThanOrEqual(0)
      expect(t.right).toBeLessThan(t.values.length)
      expect(t.right - t.left).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('makeDirectionTask', () => {
  it('describes a real moment of a binary search', () => {
    for (let s = 0; s < 200; s++) {
      const t = makeDirectionTask(seeded(s))
      expect(t.mid).toBe(midOf(t.left, t.right))
      const v = t.values[t.mid]
      expect(t.answer).toBe(v === t.target ? 'found' : v < t.target ? 'right' : 'left')
      // The target can only be inside [left, right] if it is in the array at all.
      const idx = t.values.indexOf(t.target)
      if (idx >= 0) expect(idx >= t.left && idx <= t.right).toBe(true)
    }
  })
})

describe('makeMistakeTask', () => {
  const kinds: MistakeKind[] = ['wrong-mid', 'wrong-direction', 'off-by-one', 'unsorted']

  for (const kind of kinds) {
    it(`builds a trace with exactly one ${kind} mistake`, () => {
      for (let s = 0; s < 150; s++) {
        const t = makeMistakeTask(seeded(s * 7 + kinds.indexOf(kind)), kind)
        expect(t.kind).toBe(kind)
        expect(t.rows.length).toBeGreaterThanOrEqual(2)
        expect(t.wrongRow).toBeGreaterThanOrEqual(0)
        expect(t.wrongRow).toBeLessThan(t.rows.length)
        expect(t.why.length).toBeGreaterThan(10)

        if (kind === 'unsorted') {
          expect(t.wrongRow).toBe(0)
          expect(isStrictlyIncreasing(t.values)).toBe(false)
          continue
        }
        expect(isStrictlyIncreasing(t.values)).toBe(true)
        expect(t.wrongRow).toBeGreaterThanOrEqual(1)

        // Every row before the mistake follows the rules; the mistake row breaks one.
        for (let i = 1; i < t.rows.length; i++) {
          const r = t.rows[i].round!
          const correctMid = r.mid === midOf(r.left, r.right)
          const v = r.value
          const correctUpdate =
            v === t.target ||
            (v < t.target
              ? r.nextLeft === r.mid + 1 && r.nextRight === r.right
              : r.nextRight === r.mid - 1 && r.nextLeft === r.left)
          const ok = correctMid && correctUpdate
          if (i < t.wrongRow) expect(ok).toBe(true)
          if (i === t.wrongRow) expect(ok).toBe(false)
        }
      }
    })
  }
})

describe('comparisonsFor', () => {
  it('matches the worst-case bound and the linear position', () => {
    for (const { size, max } of COMPLEXITY_PAIRS) {
      expect(maxBinaryComparisons(size)).toBe(max)
      for (const idx of [0, Math.floor(size / 3), size - 1]) {
        const c = comparisonsFor(size, idx)
        expect(c.linear).toBe(idx + 1)
        expect(c.binary).toBeGreaterThanOrEqual(1)
        expect(c.binary).toBeLessThanOrEqual(max)
      }
    }
  })

  it('finds the middle in one comparison', () => {
    expect(comparisonsFor(1_000_000, midOf(0, 999_999)).binary).toBe(1)
  })
})
