import { describe, expect, it } from 'vitest'
import { tonicTriadKind, TRIADS, triadKind, triadNotes, triadVoicing } from './harmony'
import { chordsInMajorKey } from './progression'
import { SCALES } from './theory'

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
})
