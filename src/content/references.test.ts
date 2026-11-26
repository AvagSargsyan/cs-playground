import { describe, expect, it } from 'vitest'
import { MODULE_IDS } from './modules'
import { REFERENCES, TEACHING_REFERENCES } from './references'

describe('references', () => {
  it('lists the IB course and CS50 for every lesson', () => {
    for (const id of MODULE_IDS) {
      const titles = REFERENCES[id].flatMap((g) => g.items.map((r) => r.title))
      expect(titles.some((t) => t.includes('Diploma Programme Computer Science'))).toBe(true)
      expect(titles.some((t) => t.startsWith('CS50'))).toBe(true)
    }
  })

  it('uses https links and unique titles within a lesson', () => {
    for (const id of MODULE_IDS) {
      const items = REFERENCES[id].flatMap((g) => g.items)
      expect(new Set(items.map((r) => r.title)).size).toBe(items.length)
      for (const r of [...items, ...TEACHING_REFERENCES]) {
        if (r.url) expect(r.url).toMatch(/^https:\/\//)
        expect(r.note.length).toBeGreaterThan(0)
      }
    }
  })
})
