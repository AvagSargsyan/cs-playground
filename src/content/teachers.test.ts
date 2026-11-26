import { describe, expect, it } from 'vitest'
import { IB_ALIGNMENT } from './ib-alignment'
import { MODULE_IDS } from './modules'
import { LESSON_MINUTES, TEACHER_NOTES } from './teachers'

describe('teacher notes', () => {
  for (const id of MODULE_IDS) {
    describe(id, () => {
      const notes = TEACHER_NOTES[id]

      it('has objectives, prior knowledge and at least 3 misconceptions', () => {
        expect(notes.objectives.length).toBeGreaterThanOrEqual(3)
        expect(notes.priorKnowledge.length).toBeGreaterThan(0)
        expect(notes.misconceptions.length).toBeGreaterThanOrEqual(3)
        for (const m of notes.misconceptions) {
          expect(m.belief).not.toBe('')
          expect(m.howAddressed).not.toBe('')
        }
      })

      it('has a lesson plan that adds up to 60 minutes', () => {
        const total = notes.plan.reduce((sum, step) => sum + step.minutes, 0)
        expect(total).toBe(LESSON_MINUTES)
      })

      it('uses every stage of the lesson in the plan', () => {
        const stages = notes.plan.map((p) => p.stage).filter(Boolean)
        expect(new Set(stages)).toEqual(new Set(['learn', 'explore', 'practice']))
      })

      it('has 3 discussion questions including an intercultural or ethical one', () => {
        expect(notes.discussion).toHaveLength(3)
        expect(notes.discussion.some((d) => d.kind !== 'concept')).toBe(true)
      })

      it('has support and stretch ideas, assessment ideas and a TOK link', () => {
        expect(notes.differentiation.support.length).toBeGreaterThan(0)
        expect(notes.differentiation.stretch.length).toBeGreaterThan(0)
        expect(notes.assessment.length).toBeGreaterThan(0)
        expect(notes.ibLinks.tok).toBeTruthy()
      })

      it('appears in the IB alignment table', () => {
        expect(IB_ALIGNMENT.some((row) => row.module === id)).toBe(true)
      })
    })
  }

  it('never shows unconfirmed IB section codes', () => {
    const text = JSON.stringify(IB_ALIGNMENT)
    expect(text).not.toMatch(/\b[AB]\d\.\d/)
  })
})
