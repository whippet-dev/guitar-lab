import { pitchClass, spellDegree, type Spelling } from './theory'

export const TRIADS = {
  major: { label: 'major', third: 4, fifth: 7 },
  minor: { label: 'minor', third: 3, fifth: 7 },
  diminished: { label: 'diminished', third: 3, fifth: 6 },
  augmented: { label: 'augmented', third: 4, fifth: 8 },
} as const

export type TriadKind = keyof typeof TRIADS
export type TriadInversion = 0 | 1 | 2

export function triadKind(third: number, fifth: number) {
  return (Object.keys(TRIADS) as TriadKind[]).find((kind) => TRIADS[kind].third === third && TRIADS[kind].fifth === fifth)
}

export function tonicTriadKind(scale: { degrees: readonly number[]; semitones: readonly number[] }) {
  if (scale.semitones[scale.degrees.indexOf(1)] !== 0) return undefined
  const third = scale.semitones[scale.degrees.indexOf(3)]
  const fifth = scale.semitones[scale.degrees.indexOf(5)]
  return third === undefined || fifth === undefined ? undefined : triadKind(third, fifth)
}

export function triadNotes(root: number, third: number, fifth: number, spelling: Spelling = 'common') {
  return [spellDegree(root, 1, 0, spelling), spellDegree(root, 3, third, spelling), spellDegree(root, 5, fifth, spelling)]
}

export function chordPitches(root: number, extras: readonly number[]) {
  return [root, ...extras.map((pitch) => root + pitchClass(pitch - root)).sort((a, b) => a - b)]
}

export function triadVoicing(root: number, third: number, fifth: number, inversion: TriadInversion) {
  const pitches = [root, root + third, root + fifth]
  return [...pitches.slice(inversion), ...pitches.slice(0, inversion).map((pitch) => pitch + 12)]
}
