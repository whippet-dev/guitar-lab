import type { Exercise, Topic } from './content'

export const RELATIONSHIP_TOPICS: readonly Topic[] = [
  {
    id: 'intervals', group: 'Scales and intervals', activity: 'intervals', title: 'Hear the distance between notes',
    description: 'Compare thirds and fifths and find the same distance across strings.',
    intro: 'An interval is the distance between two pitches. Start from the marked note and choose an interval. A minor third spans three semitones, a major third four and a perfect fifth seven. Change the starting note and listen for the same distance.',
    detail: 'Count note letters to get the interval number, including both ends. C–D–E makes C to E a third. Count semitones to find its quality. C to E is major and C to E♭ is minor. A unison is the same pitch, even when you find it on a different string. An octave spans 12 semitones.',
    task: 'Listen to C–E–G. Try singing it back, then find the notes on the A string at frets 3, 7 and 10. If you have a guitar, try the same line using two strings. Listen for the same tune.',
    taskPositions: [{ string: 4, fret: 3 }, { string: 3, fret: 2 }, { string: 3, fret: 5 }],
  },
  {
    id: 'scales', group: 'Scales and intervals', activity: 'scales', title: 'Build a scale one step at a time',
    description: 'Build major and natural minor from the same note and hear where they differ.',
    intro: 'A scale is an ordered pattern of pitches. Start on open D, the tonic or home note, and follow the step pattern up one string. Build both scales and listen for the change in the third degree.',
    detail: 'The step pattern describes each move. The degree formula measures from the tonic. Compared with D major (1–2–3–4–5–6–7), D natural minor (1–2–♭3–4–5–♭6–♭7) lowers degrees 3, 6 and 7 by a semitone. The two scales are parallel because they share D as tonic. Relative major and minor share a collection of notes with different tonics, like C major and A natural minor.',
    task: 'Listen to two short phrases starting on D. The first uses F♯ and the second uses F. Play or hum each phrase back. Notice how moving just the middle note changes the sound.',
    taskPositions: [0, 4, 7, 0, 3, 7].map((fret) => ({ string: 3, fret })),
  },
]

export const RELATIONSHIP_EXERCISES: readonly Exercise[] = [
  {
    id: 'interval-c-major-third', topic: 'intervals', prompt: 'Find a major third above the marked C.',
    anchor: { string: 4, fret: 3 }, range: [0, 7], answer: { kind: 'pitch', midi: 52 },
    hint: 'A major third is four semitones. From fret 3 on the A string, count four frets higher.',
    why: 'C to E is four semitones. You can find that same E at fret 7 on the A string or fret 2 on the D string.',
  },
  {
    id: 'interval-a-fifth', topic: 'intervals', prompt: 'Find a perfect fifth above the marked A.',
    anchor: { string: 5, fret: 5 }, range: [5, 12], answer: { kind: 'pitch', midi: 52 },
    hint: 'A perfect fifth is seven semitones. Start at fret 5 and add seven on the same string.',
    why: 'A to E is seven semitones. Low E fret 12 and A string fret 7 both give you the right E.',
  },
  {
    id: 'interval-e-minor-third', topic: 'intervals', prompt: 'Find a minor third above the open low E.',
    anchor: { string: 5, fret: 0 }, range: [0, 5], answer: { kind: 'pitch', midi: 43 },
    hint: 'A minor third is three semitones. Stay on the low E string and go up three frets.',
    why: 'Three semitones above low E is G. Add one more fret to reach G♯, a major third above E.',
  },
  {
    id: 'scale-d-third', topic: 'scales', prompt: 'Find the third note of D major on the D string.',
    anchor: { string: 3, fret: 0 }, range: [0, 5], string: 3, scale: { tonic: 2, kind: 'major' }, answer: { kind: 'pitch', midi: 54 },
    hint: 'D major starts W–W. Move two frets to E, then two more to degree 3.',
    why: 'D to E and E to F♯ are both whole steps. F♯ is degree 3, a major third above the tonic D.',
  },
  {
    id: 'scale-d-minor-third', topic: 'scales', prompt: 'Find the third note of D natural minor on the D string.',
    anchor: { string: 3, fret: 0 }, range: [0, 5], string: 3, scale: { tonic: 2, kind: 'minor' }, answer: { kind: 'pitch', midi: 53 },
    hint: 'Natural minor starts W–H. Move two frets to E, then one more to ♭3.',
    why: 'D to E is a whole step, then E to F is a half step. F is ♭3, a minor third above D and one semitone below the F♯ in D major.',
  },
  {
    id: 'scale-g-seventh', topic: 'scales', prompt: 'Find the seventh note of G major, just below the upper G.',
    anchor: { string: 4, fret: 10 }, range: [7, 12], scale: { tonic: 7, kind: 'major' }, answer: { kind: 'pitch', midi: 54 },
    hint: 'The last step in a major scale is H. Find the pitch one fret below the marked G.',
    why: 'F♯ is degree 7 in G major. It’s called the leading note because it often leads up a semitone to the tonic, G.',
  },
]
