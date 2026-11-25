import type { Exercise, Topic } from './content'

export const HARMONY_TOPICS: readonly Topic[] = [
  {
    id: 'triads', group: 'Harmony in action', activity: 'triads', title: 'Build a chord from three notes',
    description: 'Move the third and fifth and hear the effect on the chord.',
    intro: 'A triad’s three chord tones are its root, third and fifth. Start with C major. Lower E by one semitone to E♭ and listen. You’ve changed the chord quality from major to minor.',
    detail: 'Measure from the root. A major triad uses a major third and perfect fifth. Minor uses a minor third and perfect fifth. Diminished pairs a minor third with a diminished fifth, and augmented pairs a major third with an augmented fifth. Guitar voicings can repeat the same chord tones in other octaves.',
    task: 'Play or hum C–E–G, then C–E♭–G. Playing chord tones one at a time makes an arpeggio. In a lead line, an arpeggio can outline the chord underneath.',
    taskPositions: [{ string: 4, fret: 3 }, { string: 3, fret: 2 }, { string: 3, fret: 5 }, { string: 4, fret: 3 }, { string: 3, fret: 1 }, { string: 3, fret: 5 }],
  },
  {
    id: 'changes', group: 'Harmony in action', activity: 'changes', title: 'Follow the chord changes',
    description: 'Hear how the same lead note changes its role as the chords move.',
    intro: 'A key is organised around a tonic, its home note. Chord tones give you handy places to land in a lead line. Find E over C major, then switch to F major without moving your finger. Hear E with each chord, then try A over F.',
    detail: 'A progression is a sequence of chords. Each Roman numeral gives the scale degree of a chord’s root. In C major, I is the tonic chord C, IV is F and V is the dominant chord G. Try V–I and listen for B, the leading note, moving towards C. Notes outside the current chord can add colour or lead to a chord tone.',
    task: 'Play or sing E–A–B–C over C–F–G–C, one note per chord. Each lead note is the third of the chord underneath it, until you finish on C. For a different ending, hold B for a moment before moving up to C.',
    taskPositions: [{ string: 3, fret: 2 }, { string: 2, fret: 2 }, { string: 2, fret: 4 }, { string: 2, fret: 5 }],
  },
]

export const HARMONY_EXERCISES: readonly Exercise[] = [
  { id: 'triad-c-major', topic: 'triads', kind: 'chord', quality: 'major', root: { string: 4, fret: 3 }, range: [0, 5],
    prompt: 'Build a C major triad.', hint: 'Find a major third (four semitones) and a perfect fifth (seven semitones) above C. Either note can be in any octave.',
    why: 'C, E and G make C major. E is the major third and G is the perfect fifth.' },
  { id: 'triad-a-minor', topic: 'triads', kind: 'chord', quality: 'minor', root: { string: 4, fret: 0 }, range: [0, 5],
    prompt: 'Build an A minor triad.', hint: 'Use a minor third (three semitones) and a perfect fifth (seven semitones) above A.',
    why: 'A, C and E make A minor. C is a semitone lower than the C♯ in A major.' },
  { id: 'triad-b-diminished', topic: 'triads', kind: 'chord', quality: 'diminished', root: { string: 4, fret: 2 }, range: [0, 5],
    prompt: 'Build a B diminished triad.', hint: 'Use a minor third and lower the perfect fifth by a semitone. Look for notes three and six semitones from B.',
    why: 'B, D and F make B diminished. Its diminished fifth is F, one semitone below the F♯ in B minor.' },
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
