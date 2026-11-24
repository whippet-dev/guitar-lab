import type { Exercise, Topic } from './content'

export const HARMONY_TOPICS: readonly Topic[] = [
  {
    id: 'triads', group: 'Harmony in action', activity: 'triads', title: 'Build a chord from three notes',
    description: 'Move the third and fifth and hear the effect on the chord.',
    intro: 'A triad is a chord built from a root, a third and a fifth. Start with C major. Lower the third by one semitone and hear what happens. The root and fifth stay where they were.',
    detail: 'A major triad uses a major third and a perfect fifth. A minor triad lowers the third. Lower the fifth of a minor triad for diminished, or raise the fifth of a major triad for augmented. The names describe distances measured from the root.',
    task: 'Here is C major broken into separate notes, followed by C minor. Sing or play C–E–G, then C–E♭–G. When you’re playing lead, those notes can tell the listener what chord is underneath.',
    taskPositions: [{ string: 4, fret: 3 }, { string: 3, fret: 2 }, { string: 3, fret: 5 }, { string: 4, fret: 3 }, { string: 3, fret: 1 }, { string: 3, fret: 5 }],
  },
  {
    id: 'changes', group: 'Harmony in action', activity: 'changes', title: 'Follow the chord changes',
    description: 'Hear how the same lead note changes its role as the chords move.',
    intro: 'A key gives you a set of notes to draw from. The current chord gives some of those notes a stronger place to land. Find E over C major, then switch to F without moving your finger. Hear E with each chord, then try A over F.',
    detail: 'A progression is a sequence of chords. The Roman numerals show which note of the key each chord starts on. In C major, I starts on C, IV on F and V on G. A note can belong to the key and still sit outside the chord you’re hearing.',
    task: 'Play or sing E–A–B–C over C–F–G–C, one note per chord. Each lead note is the third of the chord underneath it, until you finish on C. For a different ending, hold B for a moment before moving up to C.',
    taskPositions: [{ string: 3, fret: 2 }, { string: 2, fret: 2 }, { string: 2, fret: 4 }, { string: 2, fret: 5 }],
  },
]

export const HARMONY_EXERCISES: readonly Exercise[] = [
  { id: 'triad-c-major', topic: 'triads', kind: 'chord', quality: 'major', root: { string: 4, fret: 3 }, range: [0, 5],
    prompt: 'Build a C major triad.', hint: 'Find a note four semitones above C and another seven semitones above C.',
    why: 'C, E and G make C major. E is the major third and G is the perfect fifth.' },
  { id: 'triad-a-minor', topic: 'triads', kind: 'chord', quality: 'minor', root: { string: 4, fret: 0 }, range: [0, 5],
    prompt: 'Build an A minor triad.', hint: 'Find a note three semitones above A and another seven semitones above A.',
    why: 'A, C and E make A minor. C is a semitone lower than the C♯ in A major.' },
  { id: 'triad-b-diminished', topic: 'triads', kind: 'chord', quality: 'diminished', root: { string: 4, fret: 2 }, range: [0, 5],
    prompt: 'Build a B diminished triad.', hint: 'Use a minor third and lower the perfect fifth by a semitone. Look for notes three and six semitones from B.',
    why: 'B, D and F make B diminished. The lowered fifth, F, gives it a different pull from B minor.' },
  { id: 'change-land-on-f', topic: 'changes', anchor: { string: 5, fret: 1 }, range: [0, 5],
    prompt: 'The chord changes to F major. Find its third or fifth.', hint: 'Start on F. Its third is four semitones up and its fifth is seven semitones up. Either note works.',
    why: 'F major contains F, A and C. A and C both give your melody somewhere to land over F.', answer: { kind: 'tones', pitchClasses: [9, 0] } },
  { id: 'change-land-on-g', topic: 'changes', anchor: { string: 5, fret: 3 }, range: [0, 5],
    prompt: 'The chord changes to G major. Find its third or fifth.', hint: 'Start on G and find either the note four semitones up or the note seven semitones up.',
    why: 'The third of G major is B and the fifth is D. Try following B with C when the progression returns home.', answer: { kind: 'tones', pitchClasses: [11, 2] } },
  { id: 'change-hold-a-note', topic: 'changes', range: [0, 5],
    prompt: 'Find a note you could hold over both C major and A minor.', hint: 'C major uses C, E and G. A minor uses A, C and E. Look for a note in both lists.',
    why: 'C and E are in both chords. Holding either one lets the harmony move around your melody.', answer: { kind: 'tones', pitchClasses: [0, 4] } },
]
