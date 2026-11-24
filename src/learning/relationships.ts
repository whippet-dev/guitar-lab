import type { Exercise, Topic } from './content'

export const RELATIONSHIP_TOPICS: readonly Topic[] = [
  {
    id: 'intervals', group: 'Scales and intervals', activity: 'intervals', title: 'Hear the distance between notes',
    description: 'Compare thirds and fifths and find the same distance across strings.',
    intro: 'An interval is the distance between two notes. Start from the marked note, choose a distance and listen. Then change the starting note. The pitches move, but the relationship between them stays the same.',
    detail: 'One fret is one semitone. A minor third spans three semitones, a major third spans four and a perfect fifth spans seven. You can count along one string or find the same sounding pitch on another string.',
    task: 'Listen to C–E–G. Try singing it back, then find the notes on the A string at frets 3, 7 and 10. If you have a guitar, try the same line using two strings. Listen for the same tune.',
    taskPositions: [{ string: 4, fret: 3 }, { string: 3, fret: 2 }, { string: 3, fret: 5 }],
  },
  {
    id: 'scales', group: 'Scales and intervals', activity: 'scales', title: 'Build a scale one step at a time',
    description: 'Build major and natural minor from the same note and hear where they differ.',
    intro: 'A scale is a pattern of gaps. On one string those gaps are easy to see. Start on open D, then add one fret for a semitone or two for a tone. Try both scales and listen for what happens to the third note.',
    detail: 'Major goes tone, tone, semitone, tone, tone, tone, semitone. Natural minor goes tone, semitone, tone, tone, semitone, tone, tone. Both arrive an octave above the start. The gaps on the way give each scale its character.',
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
    anchor: { string: 3, fret: 0 }, range: [0, 5], string: 3, answer: { kind: 'pitch', midi: 54 },
    hint: 'Start with two tones. Each tone is two frets, so the third note is four frets above D.',
    why: 'D to E is a tone, and E to F♯ is another tone. That makes F♯ the third note of D major.',
  },
  {
    id: 'scale-d-minor-third', topic: 'scales', prompt: 'Find the third note of D natural minor on the D string.',
    anchor: { string: 3, fret: 0 }, range: [0, 5], string: 3, answer: { kind: 'pitch', midi: 53 },
    hint: 'Natural minor starts with a tone and a semitone. That’s two frets and then one.',
    why: 'D to E is a tone, then E to F is a semitone. F is one fret lower than the third of D major.',
  },
  {
    id: 'scale-g-seventh', topic: 'scales', prompt: 'Find the seventh note of G major, just below the upper G.',
    anchor: { string: 4, fret: 10 }, range: [7, 12], answer: { kind: 'pitch', midi: 54 },
    hint: 'A major scale finishes with a semitone. The seventh note is one fret below the marked G.',
    why: 'F♯ is the seventh note of G major. Hear how that final semitone leads into G.',
  },
]
