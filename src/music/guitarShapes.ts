import { TRIADS, triadVoicing, type TriadInversion, type TriadKind } from './harmony'
import { MAX_FRET, pitchClass, STRINGS, type Position, type StringIndex } from './theory'

// Fret offsets in strumming order, from the thickest string to the thinnest.
export const CAGED = [
  { name: 'C', tonic: 0, frets: [null, 3, 2, 0, 1, 0] },
  { name: 'A', tonic: 9, frets: [null, 0, 2, 2, 2, 0] },
  { name: 'G', tonic: 7, frets: [3, 2, 0, 0, 0, 3] },
  { name: 'E', tonic: 4, frets: [0, 2, 2, 1, 0, 0] },
  { name: 'D', tonic: 2, frets: [null, null, 0, 2, 3, 2] },
] as const

export type ChordForm = (typeof CAGED)[number]

export function formPositions(form: ChordForm, shift: number): Position[] {
  return form.frets.flatMap((offset, index) => offset === null ? [] : [{ string: (5 - index) as StringIndex, fret: offset + shift }])
}

export function cagedRoute(tonic: number) {
  const shapes = CAGED.map((form) => ({ form, shift: pitchClass(tonic - form.tonic) })).sort((a, b) => a.shift - b.shift)
  return [...shapes, { form: shapes[0].form, shift: shapes[0].shift + 12 }]
}

export function guitarTriads(tonic: number, quality: TriadKind, bassString: StringIndex, inversion: TriadInversion) {
  const { third, fifth } = TRIADS[quality]
  const voicing = triadVoicing(tonic, third, fifth, inversion)
  // Align the bass with the lowest playable octave on the chosen string.
  const firstOctave = Math.ceil((STRINGS[bassString].midi - voicing[0]) / 12) * 12
  return [firstOctave, firstOctave + 12, firstOctave + 24].flatMap((octave) => {
    const shape = voicing.map((pitch, index) => {
      const string = (bassString - index) as StringIndex
      return { string, fret: pitch + octave - STRINGS[string].midi }
    })
    return shape.every(({ fret }) => fret >= 0 && fret <= MAX_FRET) ? [shape] : []
  })
}
