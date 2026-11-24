import { describe, expect, it } from 'vitest'
import { TRIADS, triadKind, triadNotes } from './harmony'
import { chordsInMajorKey } from './progression'

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
})
