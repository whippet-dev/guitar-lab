import { expect, it } from 'vitest'
import { sampleFor, SAMPLE_BANKS, type Guitar } from './samples'
import { frequencyOf } from './theory'

it('maps the whole 24-fret guitar range to nearby, tuning-corrected recordings', () => {
  for (const guitar of Object.keys(SAMPLE_BANKS) as Guitar[]) {
    for (let pitch = 40; pitch <= 88; pitch++) {
      const sample = sampleFor(guitar, pitch)
      expect(Math.abs(sample.midi - pitch)).toBeLessThanOrEqual(guitar === 'electric' ? 3 : 4)
      expect(frequencyOf(sample.midi + sample.cents / 100) * sample.rate).toBeCloseTo(frequencyOf(pitch), 6)
    }
  }
  expect(sampleFor('electric', 43).midi).toBe(41)
  expect(sampleFor('acoustic', 64).midi).toBe(64)
})

it('keeps complete notes in separate slices of each cached MP3', () => {
  for (const { notes } of Object.values(SAMPLE_BANKS)) {
    expect(notes).toHaveLength(18)
    for (const [index, note] of notes.entries()) {
      expect(note.duration).toBeGreaterThan(2)
      if (index > 0) {
        expect(note.midi).toBeGreaterThan(notes[index - 1].midi)
        expect(note.start - (notes[index - 1].start + notes[index - 1].duration)).toBeGreaterThan(0.035)
      }
    }
  }
})
