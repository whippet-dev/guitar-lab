import { describe, expect, it } from 'vitest'
import { degreeSymbol, frequencyOf, intervalFrom, intervalNote, MAX_FRET, noteName, octaveOf, pitchAt, pitchClass, SCALES, scaleNotes, scaleSteps, STRINGS, type ScaleKind, type StringIndex } from './theory'

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
    expect(intervalFrom(40, 52).name).toBe('Starting note')
  })

  it('spells intervals by letter as well as by pitch, including both tritone spellings', () => {
    expect(intervalNote(48, 1, 'sharps').name).toBe('D♭')
    expect(intervalNote(48, 6)).toEqual({ pitch: 6, name: 'F♯', degree: 4 })
    expect(intervalNote(48, 6, 'common', true)).toEqual({ pitch: 6, name: 'G♭', degree: 5 })
    expect(intervalNote(61, 4).name).toBe('E♯')
    expect(intervalNote(48, 12).degree).toBe(8)
  })

  it('builds the taught D scales from the correct step patterns and parallel-major degrees', () => {
    expect(scaleSteps('major')).toEqual([2, 2, 1, 2, 2, 2, 1])
    expect(scaleSteps('minor')).toEqual([2, 1, 2, 2, 1, 2, 2])
    expect(scaleNotes(2, 'major').map(({ name }) => name)).toEqual(['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'])
    expect(scaleNotes(2, 'minor').map(({ name }) => name)).toEqual(['D', 'E', 'F', 'G', 'A', 'B♭', 'C'])
    expect(SCALES.minor.semitones.map((offset, index) => degreeSymbol(index + 1, offset))).toEqual(['1', '2', '♭3', '4', '5', '♭6', '♭7'])
    expect(SCALES.minorPentatonic.semitones.map((offset, index) => degreeSymbol(SCALES.minorPentatonic.degrees[index], offset))).toEqual(['1', '♭3', '4', '5', '♭7'])
  })

  it('uses diatonic spelling for major and minor scales', () => {
    expect(scaleNotes(6, 'major').map(({ name }) => name)).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'])
    expect(scaleNotes(6, 'major', 'flats').map(({ name }) => name)).toEqual(['G♭', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'])
    expect(scaleNotes(9, 'minor').map(({ name }) => name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('mixes common sharps and flats while preserving the spelling of each scale', () => {
    expect(noteName(54, 'common')).toBe('F♯')
    expect(noteName(58, 'common')).toBe('B♭')
    expect(scaleNotes(6, 'major', 'common').map(({ name }) => name)).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'])
    expect(scaleNotes(10, 'major', 'common').map(({ name }) => name)).toEqual(['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'])
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
