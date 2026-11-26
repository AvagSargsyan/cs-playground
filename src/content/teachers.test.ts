import { describe, expect, it } from 'vitest'
import { IB_ALIGNMENT } from './ib-alignment'
import { MODULE_IDS, MODULES, STAGE_IDS } from './modules'
import { LESSON_MINUTES, TEACHER_NOTES } from './teachers'

describe('teacher notes', () => {
  for (const id of MODULE_IDS) {
    describe(id, () => {
      const notes = TEACHER_NOTES[id]

      it('stays short: 3 objectives, 3 misconceptions, 3 questions', () => {
        expect(notes.objectives).toHaveLength(3)
        expect(notes.misconceptions).toHaveLength(3)
        expect(notes.questions).toHaveLength(3)
        expect(notes.support.length).toBeGreaterThan(0)
        expect(notes.stretch.length).toBeGreaterThan(0)
        expect(notes.exitTicket).not.toBe('')
      })

      it('has a lesson plan that adds up to 60 minutes and uses every stage', () => {
        expect(notes.plan.reduce((sum, step) => sum + step.minutes, 0)).toBe(LESSON_MINUTES)
        const stages = notes.plan.map((p) => p.stage).filter(Boolean)
        expect(new Set(stages)).toEqual(new Set(STAGE_IDS))
      })

      it('appears in the IB alignment table', () => {
        expect(IB_ALIGNMENT.some((row) => row.module === id)).toBe(true)
      })

      it('has stage time estimates that add up to the lesson total', () => {
        const meta = MODULES[id]
        expect(STAGE_IDS.reduce((sum, st) => sum + meta.stageMinutes[st], 0)).toBe(meta.minutes)
      })
    })
  }

  it('never shows unconfirmed IB section codes', () => {
    const text = JSON.stringify(IB_ALIGNMENT)
    expect(text).not.toMatch(/\b[AB]\d\.\d/)
  })
})
