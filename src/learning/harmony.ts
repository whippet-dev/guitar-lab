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
]
