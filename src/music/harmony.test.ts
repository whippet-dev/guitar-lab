import { describe, expect, it } from 'vitest'
import { tonicTriadKind, TRIADS, triadKind, triadNotes, triadVoicing } from './harmony'
import { chordsInMajorKey } from './progression'
import { cagedRoute, formPositions, guitarTriads } from './guitarShapes'
import { MAX_FRET, pitchAt, pitchClass, samePosition, SCALES } from './theory'

describe('triads and keys', () => {
  it('uses the third and fifth to distinguish the four qualities and spell the chord', () => {
    const { third, fifth } = TRIADS.augmented
    expect(triadKind(third, fifth)).toBe('augmented')
    expect(triadNotes(48, third, fifth).map(({ name }) => name)).toEqual(['C', 'E', 'G♯'])
    expect(triadKind(3, 6)).toBe('diminished')
  })

  it('builds chords from the key’s scale and keeps its spelling', () => {
    expect(chordsInMajorKey(48).map(({ label }) => label)).toEqual(['C major', 'D minor', 'E minor', 'F major', 'G major', 'A minor', 'B diminished'])
    expect(chordsInMajorKey(53)[3].notes.map(({ name }) => name)).toEqual(['B♭', 'D', 'F'])
    expect(chordsInMajorKey(50)[6].notes.map(({ name }) => name)).toEqual(['C♯', 'E', 'G'])
  })

  it('changes the bass in each inversion while keeping the three chord tones', () => {
    expect(triadVoicing(48, 4, 7, 0)).toEqual([48, 52, 55])
    expect(triadVoicing(48, 4, 7, 1)).toEqual([52, 55, 60])
    expect(triadVoicing(48, 4, 7, 2)).toEqual([55, 60, 64])
  })

  it('finds a triad by degree and quality when a scale contains all three tones', () => {
    expect(Object.values(SCALES).map(tonicTriadKind)).toEqual(['major', 'minor', 'major', 'minor'])
    expect(tonicTriadKind({ degrees: [1, 2, 3, 4, 5], semitones: [0, 2, 3, 5, 6] })).toBe('diminished')
    expect(tonicTriadKind({ degrees: [1, 2, 4, 5], semitones: [0, 2, 5, 7] })).toBeUndefined()
    expect(tonicTriadKind({ degrees: [1, 3, 4, 6], semitones: [0, 4, 5, 9] })).toBeUndefined()
  })

  it('connects adjacent CAGED forms with shared positions and the same chord in every key', () => {
    for (let root = 0; root < 12; root++) {
      const route = cagedRoute(root).map(({ form, shift }) => formPositions(form, shift))
      expect(route).toHaveLength(6)
      route.forEach((shape, index) => {
        expect(new Set(shape.map((note) => pitchClass(pitchAt(note) - root)))).toEqual(new Set([0, 4, 7]))
        const next = route[index + 1]
        if (next) expect(shape.some((note) => next.some((other) => samePosition(note, other)))).toBe(true)
      })
    }
  })

  it('finds playable inversions on every adjacent string group', () => {
    for (const bass of [2, 3, 4, 5] as const) {
      for (const inversion of [0, 1, 2] as const) {
        for (const quality of Object.keys(TRIADS) as (keyof typeof TRIADS)[]) {
          for (let root = 0; root < 12; root++) {
            const shapes = guitarTriads(root, quality, bass, inversion)
            expect(shapes.length).toBeGreaterThan(0)
            for (const shape of shapes) {
              const pitches = shape.map(pitchAt)
              expect(shape.map(({ string }) => string)).toEqual([bass, bass - 1, bass - 2])
              expect(shape.every(({ fret }) => fret >= 0 && fret <= MAX_FRET)).toBe(true)
              expect(pitches.map((pitch) => pitch - pitches[0])).toEqual(triadVoicing(root, TRIADS[quality].third, TRIADS[quality].fifth, inversion).map((pitch, index, notes) => index ? pitch - notes[0] : 0))
              expect(pitchClass(pitches[0] - root)).toBe([0, TRIADS[quality].third, TRIADS[quality].fifth][inversion])
            }
          }
        }
      }
    }
  })
})
