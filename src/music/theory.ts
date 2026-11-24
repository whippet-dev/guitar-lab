export const MAX_FRET = 24

export const STRINGS = [
  { name: 'high E', midi: 64 },
  { name: 'B', midi: 59 },
  { name: 'G', midi: 55 },
  { name: 'D', midi: 50 },
  { name: 'A', midi: 45 },
  { name: 'low E', midi: 40 },
] as const

export type StringIndex = 0 | 1 | 2 | 3 | 4 | 5
export type Position = { string: StringIndex; fret: number }
export type Spelling = 'sharps' | 'flats'

const sharpNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const flatNames = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const naturalPitches = [0, 2, 4, 5, 7, 9, 11]

export function pitchClass(semitones: number) {
  return ((semitones % 12) + 12) % 12
}

export function noteName(semitones: number, spelling: Spelling = 'sharps') {
  return (spelling === 'flats' ? flatNames : sharpNames)[pitchClass(semitones)]
}

export function samePosition(a: Position | null | undefined, b: Position) {
  return a?.string === b.string && a.fret === b.fret
}

export function pitchAt({ string, fret }: Position) {
  if (!STRINGS[string] || !Number.isInteger(fret) || fret < 0 || fret > MAX_FRET) {
    throw new RangeError('Choose a string and a fret between 0 and 24.')
  }
  return STRINGS[string].midi + fret
}

export function octaveOf(midi: number, name = noteName(midi)) {
  const accidental = [...name.slice(1)].reduce((offset, sign) => offset + (sign === '♭' ? -1 : 1), 0)
  return Math.floor((midi - accidental) / 12) - 1
}

export function frequencyOf(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function positionName({ string, fret }: Position) {
  return fret === 0 ? `Open ${STRINGS[string].name} string` : `${STRINGS[string].name} string, fret ${fret}`
}

export const SCALES = {
  major: { label: 'Major', semitones: [0, 2, 4, 5, 7, 9, 11], degrees: [1, 2, 3, 4, 5, 6, 7] },
  minor: { label: 'Natural minor', semitones: [0, 2, 3, 5, 7, 8, 10], degrees: [1, 2, 3, 4, 5, 6, 7] },
  majorPentatonic: { label: 'Major pentatonic', semitones: [0, 2, 4, 7, 9], degrees: [1, 2, 3, 5, 6] },
  minorPentatonic: { label: 'Minor pentatonic', semitones: [0, 3, 5, 7, 10], degrees: [1, 3, 4, 5, 7] },
} as const

export type ScaleKind = keyof typeof SCALES

export function scaleNotes(root: number, kind: ScaleKind, spelling: Spelling = 'sharps') {
  const scale = SCALES[kind]
  const rootLetter = letters.indexOf(noteName(root, spelling)[0])
  return scale.semitones.map((offset, index) => {
    const degree = scale.degrees[index]
    const letter = (rootLetter + degree - 1) % letters.length
    const pitch = pitchClass(root + offset)
    const accidental = pitchClass(pitch - naturalPitches[letter] + 6) - 6
    const name = letters[letter] + (accidental < 0 ? '♭'.repeat(-accidental) : '♯'.repeat(accidental))
    return { pitch, name, degree }
  })
}

export const INTERVALS = [
  ['1', 'Root'], ['♭2', 'Minor second'], ['2', 'Major second'], ['♭3', 'Minor third'],
  ['3', 'Major third'], ['4', 'Perfect fourth'], ['♯4', 'Tritone'], ['5', 'Perfect fifth'],
  ['♭6', 'Minor sixth'], ['6', 'Major sixth'], ['♭7', 'Minor seventh'], ['7', 'Major seventh'],
] as const

export function intervalFrom(root: number, note: number) {
  const semitones = pitchClass(note - root)
  const [symbol, name] = INTERVALS[semitones]
  return { semitones, symbol, name }
}
