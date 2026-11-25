import type { PositionExercise, Topic } from './content'

export const LISTENING_TOPIC: Topic = {
  id: 'listening', group: 'Listening and timing', title: 'Hear the next note before you play it',
  description: 'Listen, hum the target and find it on the fretboard.',
  intro: 'Listen to A and C, then hum the second pitch before you reach for it. In the exercises the second note is hidden. Match its pitch, including its octave. If your first guess differs, compare it with the target and try again.',
  detail: 'A up to C spans three semitones, a minor third. If an E sounds recognisable but much too high or low, you may have the right note name in another octave. Two strings can give you the same pitch with a different tone quality.',
  demo: [{ string: 4, fret: 0 }, { string: 4, fret: 3 }], demoLabels: ['Open A', 'C at fret 3'],
  task: 'Listen to A–C–E without looking down at the neck. Hum it back, then find it on the guitar or in the explorer. Try it on the A string first, then see if you can move the last note onto the D string.',
  taskPositions: [{ string: 4, fret: 0 }, { string: 4, fret: 3 }, { string: 3, fret: 2 }],
}

export const LISTENING_EXERCISES: readonly PositionExercise[] = [
  { id: 'ear-a-minor-third', topic: 'listening', prompt: 'Listen from open A and find the second note.',
    range: [0, 5], anchor: { string: 4, fret: 0 }, listen: [{ string: 4, fret: 0 }, { string: 4, fret: 3 }], answer: { kind: 'pitch', midi: 48 },
    hint: 'The second note is three frets higher on the A string. Hear that distance again before you try it.',
    why: 'The second pitch is C, three semitones above A. You’ve heard and found a minor third.' },
  { id: 'ear-d-major-third', topic: 'listening', prompt: 'Listen from open D and match the higher pitch.',
    range: [0, 5], anchor: { string: 3, fret: 0 }, listen: [{ string: 3, fret: 0 }, { string: 3, fret: 4 }], answer: { kind: 'pitch', midi: 54 },
    hint: 'The second note is four frets above open D. Compare that sound with a jump of three frets.',
    why: 'That’s F♯ over D, a major third. The jump is one semitone wider than the A–C example.' },
  { id: 'ear-low-e-fifth', topic: 'listening', prompt: 'Listen from low E and find the pitch that answers it.',
    range: [0, 7], anchor: { string: 5, fret: 0 }, listen: [{ string: 5, fret: 0 }, { string: 4, fret: 2 }], answer: { kind: 'pitch', midi: 47 },
    hint: 'The target is seven semitones above low E. Try fret 7 on the low E string or fret 2 on the A string.',
    why: 'E up to B is a perfect fifth. Low E fret 7 and A string fret 2 both give you B in the same octave, even though the strings sound a little different.' },
  { id: 'ear-g-fifth', topic: 'listening', prompt: 'Listen from the marked G and find the second pitch.',
    range: [0, 5], anchor: { string: 5, fret: 3 }, listen: [{ string: 5, fret: 3 }, { string: 3, fret: 0 }], answer: { kind: 'pitch', midi: 50 },
    hint: 'This jump is seven semitones. In this range, look at the D string or near the fifth fret of the A string.',
    why: 'G up to D is a perfect fifth, just like E up to B. The starting notes are different and the distance is the same.' },
]
