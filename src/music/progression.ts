import { TRIADS, triadKind } from './harmony'
import { pitchClass, SCALES, scaleNotes, type Spelling } from './theory'

const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

export function chordsInMajorKey(root: number, spelling: Spelling = 'common') {
  const scale = scaleNotes(root, 'major', spelling)
  return scale.map((note, index) => {
    const third = scale[(index + 2) % 7]
    const fifth = scale[(index + 4) % 7]
    const thirdOffset = pitchClass(third.pitch - note.pitch)
    const fifthOffset = pitchClass(fifth.pitch - note.pitch)
    const kind = triadKind(thirdOffset, fifthOffset)!
    const bass = root + SCALES.major.semitones[index]
    return {
      numeral: numerals[index], kind, rootName: note.name, label: `${note.name} ${TRIADS[kind].label}`,
      notes: [note, third, fifth], pitches: [bass, bass + thirdOffset, bass + fifthOffset],
    }
  })
}
