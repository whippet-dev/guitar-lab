import { describe, expect, it } from 'vitest'
import { frequencyOf, intervalFrom, MAX_FRET, noteName, octaveOf, pitchAt, pitchClass, SCALES, scaleNotes, STRINGS, type ScaleKind, type StringIndex } from './theory'

describe('standard guitar tuning and the fretboard', () => {
  it('maps string numbers to the correct sounding notes and octaves', () => {
    expect(STRINGS.map((_, string) => pitchAt({ string: string as StringIndex, fret: 0 }))).toEqual([64, 59, 55, 50, 45, 40])
    expect(STRINGS.map(({ midi }) => `${noteName(midi)}${octaveOf(midi)}`).reverse()).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  })

  it('raises the pitch by one semitone per fret and repeats the open pitch class at frets 12 and 24', () => {
    for (const [index, { midi }] of STRINGS.entries()) {
      const string = index as StringIndex
      for (let fret = 0; fret <= MAX_FRET; fret++) {
        expect(pitchAt({ string, fret })).toBe(midi + fret)
      }
      expect(noteName(pitchAt({ string, fret: 12 }))).toBe(noteName(midi))
      expect(frequencyOf(pitchAt({ string, fret: 24 }))).toBeCloseTo(4 * frequencyOf(midi))
    }
    expect(pitchAt({ string: 5, fret: 5 })).toBe(pitchAt({ string: 4, fret: 0 }))
    expect(pitchAt({ string: 2, fret: 4 })).toBe(pitchAt({ string: 1, fret: 0 }))
  })

  it('rejects fractions, out-of-range frets and invalid strings', () => {
    for (const fret of [-1, 25, 0.5, NaN]) expect(() => pitchAt({ string: 0, fret })).toThrow(RangeError)
    expect(() => pitchAt({ string: 6 as StringIndex, fret: 0 })).toThrow(RangeError)
  })
})

describe('note spelling, intervals and scales', () => {
  it('wraps pitch classes and spells enharmonic notes at the right octave boundary', () => {
    expect(pitchClass(-1)).toBe(11)
    expect(noteName(61)).toBe('C♯')
    expect(noteName(61, 'flats')).toBe('D♭')
    expect(octaveOf(60, 'B♯')).toBe(3)
    expect(octaveOf(59, 'C♭')).toBe(4)
    expect(frequencyOf(69)).toBe(440)
    expect(frequencyOf(57)).toBe(220)
  })

  it('identifies intervals relative to a root across a pitch-class boundary', () => {
    expect(intervalFrom(11, 6)).toEqual({ semitones: 7, symbol: '5', name: 'Perfect fifth' })
    expect(intervalFrom(9, 0).name).toBe('Minor third')
    expect(intervalFrom(40, 52).name).toBe('Root')
  })

  it('uses diatonic spelling for major and minor scales', () => {
    expect(scaleNotes(6, 'major').map(({ name }) => name)).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'])
    expect(scaleNotes(6, 'major', 'flats').map(({ name }) => name)).toEqual(['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'])
    expect(scaleNotes(9, 'minor').map(({ name }) => name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('places each pentatonic note at its correct degree and transposes every scale', () => {
    expect(scaleNotes(9, 'minorPentatonic').map(({ name }) => name)).toEqual(['A', 'C', 'D', 'E', 'G'])
    expect(scaleNotes(0, 'majorPentatonic').map(({ degree }) => degree)).toEqual([1, 2, 3, 5, 6])
    for (const kind of Object.keys(SCALES) as ScaleKind[]) {
      for (let root = 0; root < 12; root++) {
        expect(scaleNotes(root, kind).map(({ pitch }) => pitchClass(pitch - root))).toEqual(SCALES[kind].semitones)
      }
    }
  })
})
