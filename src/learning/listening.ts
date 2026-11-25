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

export const PHRASE_EAR_TOPIC: Topic = {
  id: 'phrase-ear', group: 'Listening and timing', activity: 'phrase-ear', title: 'Hear a phrase find its home',
  description: 'Compare major and minor sounds, follow a falling phrase and hear a note resolve over a chord.',
  intro: 'Listen before opening the fretboard. Compare the two rising sounds and hum the middle note of each. Then try the falling phrase and the example with a chord underneath.',
  detail: 'Rising and falling describe pitch direction. Both rising examples start on A and end on E, a perfect fifth above it. One passes through C, the minor third, and the other through C♯, the major third. In the chord example B steps down to A. The tension is part of the phrase, and the bass gives the ear a place to settle.',
  task: 'Hum E–C–A so the line settles on A. Try it on the D and A strings, then play the same shape two frets higher. The pitches change, but the direction and gaps stay the same.',
  taskPositions: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 4, fret: 0 }],
}

export const PHRASE_EAR_EXERCISES: readonly PositionExercise[] = [
  { id: 'phrase-ear-minor-ending', topic: 'phrase-ear', range: [0, 5], anchor: { string: 4, fret: 0 },
    prompt: 'Hear A jump up to E, then move down. Find the final note on the fretboard.',
    listen: [{ string: 4, fret: 0 }, { string: 3, fret: 2 }, { string: 4, fret: 3 }],
    hint: 'The phrase ends on the minor third of A, three frets up the A string.',
    why: 'The last note is C. A and E frame the phrase, while C gives it the minor sound.', answer: { kind: 'pitch', midi: 48 } },
  { id: 'phrase-ear-major-ending', topic: 'phrase-ear', range: [0, 5], anchor: { string: 4, fret: 0 },
    prompt: 'This phrase shares the same A and E. Match the higher third at the end.',
    listen: [{ string: 4, fret: 0 }, { string: 3, fret: 2 }, { string: 4, fret: 4 }],
    hint: 'The major third of A lies four frets above open A. Compare it with the fret just below.',
    why: 'C♯ is one semitone above C. That change gives the same frame of A and E a major sound.', answer: { kind: 'pitch', midi: 49 } },
  { id: 'phrase-ear-fall-home', topic: 'phrase-ear', range: [0, 5], anchor: { string: 3, fret: 2 },
    prompt: 'Follow this falling phrase and find the note it settles on.',
    listen: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 4, fret: 0 }],
    hint: 'The notes descend through the minor third of A. The final pitch is the open A string.',
    why: 'The line goes E, C, A. It ends on the root of the A minor triad, giving the phrase a sense of arrival.', answer: { kind: 'pitch', midi: 45 } },
]
