import type { PositionExercise, Topic } from './content'

export const LISTENING_TOPIC: Topic = {
  id: 'listening', group: 'Listening', title: 'Hear the next note before you play it',
  description: 'Listen, hum the target and find it on the fretboard.',
  intro: 'Listen to A and C a couple of times. Hum the second note back before you reach for it. Then try the exercises with the second note hidden. If your first guess sounds different, listen to the two pitches side by side and adjust.',
  detail: 'You can hear a jump as a distance from a starting note. The distance from A to C is three semitones, a minor third. Singing or humming the target gives you something to compare with the notes you find on the guitar.',
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
    why: 'E up to B is a perfect fifth. Either string gives you the same sound if the pitch is B in the same octave.' },
  { id: 'ear-g-fifth', topic: 'listening', prompt: 'Listen from the marked G and find the second pitch.',
    range: [0, 5], anchor: { string: 5, fret: 3 }, listen: [{ string: 5, fret: 3 }, { string: 3, fret: 0 }], answer: { kind: 'pitch', midi: 50 },
    hint: 'This jump is seven semitones. In this range, look at the D string or near the fifth fret of the A string.',
    why: 'G up to D is a perfect fifth, just like E up to B. The starting notes are different and the distance is the same.' },
]
