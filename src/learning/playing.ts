import type { PositionExercise, Topic } from './content'

export const SHAPE_TOPICS: readonly Topic[] = [
  {
    id: 'caged', group: 'Play it on guitar', activity: 'caged', title: 'Find the same chord up the neck',
    description: 'Link five familiar open forms and follow their shared roots.',
    intro: 'Choose C major and move through the C, A, G, E and D forms. Each one plays C major in a different place. Show the open form to see where the shape came from, or show the overlap before you move to the next one.',
    detail: 'When you move an open form up the neck, the nut has to move with it. A barre or a capo can take the nut’s place. The G and C forms can be a stretch when moved, so try playing just the notes on three neighbouring strings first. The violet markers are roots, teal marks the third and amber the perfect fifth.',
    task: 'Hear a C root in the C and A forms on the A string at fret 3. Then find C again at fret 8 on low E. On guitar, play these roots before trying a piece of each form.',
    taskPositions: [{ string: 4, fret: 3 }, { string: 5, fret: 8 }],
  },
  {
    id: 'voicings', group: 'Play it on guitar', activity: 'voicings', title: 'Play one triad three ways',
    description: 'Find playable inversions on neighbouring strings and hear the bass change.',
    intro: 'Pick a chord and a group of three strings. A voicing is how the notes are arranged. In root position the root is lowest. In first inversion the third is lowest, and in second inversion the fifth is lowest. Try all three with the same chord.',
    detail: 'These shapes use one note per string. Moving every note by the same number of frets keeps the voicing and changes the chord’s root. Keeping the chord and changing its inversion can move the bass or the top note by a smaller distance between chords.',
    task: 'On the top three strings, play C major in first inversion at frets 9–8–8, starting on G. Then play it in second inversion at frets 12–13–12. Play or hum just the bass notes, E then G.',
    taskPositions: [{ string: 2, fret: 9 }, { string: 2, fret: 12 }],
  },
]

export const SHAPE_EXERCISES: readonly PositionExercise[] = [
  { id: 'caged-c-overlap', topic: 'caged', range: [0, 6], string: 4,
    prompt: 'Find the C root shared by the C and A forms of C major.',
    hint: 'The open A form starts on the A string. Move three frets up that string to get C.',
    why: 'A-string fret 3 is C. It is also the bass note of the open C form, so you can keep your place when you change forms.',
    answer: { kind: 'position', position: { string: 4, fret: 3 } } },
  { id: 'caged-c-e-form', topic: 'caged', range: [5, 12], string: 5,
    prompt: 'Find the low E-string root of the movable E form of C major.',
    hint: 'Move the open low E up eight frets to reach C. The rest of the form moves the same distance.',
    why: 'Low E fret 8 is C. Put the E form there and it sounds as C major.',
    answer: { kind: 'position', position: { string: 5, fret: 8 } } },
  { id: 'voicing-c-first', topic: 'voicings', range: [7, 12], string: 2,
    prompt: 'Find the bass note for C major in first inversion on the G string.',
    hint: 'First inversion puts the third in the bass. In C major that note is E.',
    why: 'G-string fret 9 is E. Add G and C above it to play the first inversion.',
    answer: { kind: 'position', position: { string: 2, fret: 9 } } },
  { id: 'voicing-c-second', topic: 'voicings', range: [9, 14], string: 2,
    prompt: 'Find the new bass note for C major in second inversion.',
    hint: 'The perfect fifth, G, is now the lowest note. Find G on the G string one octave above the open string.',
    why: 'G-string fret 12 is G. In this voicing the higher strings complete the chord with C and E.',
    answer: { kind: 'position', position: { string: 2, fret: 12 } } },
]

export const PENTATONIC_TOPIC: Topic = {
  id: 'pentatonic', group: 'Play it on guitar', activity: 'pentatonic', title: 'Connect pentatonic positions',
  description: 'Cross between shapes through shared notes, then find the chord inside the scale.',
  intro: 'Start with position 1 of A minor pentatonic. Each string has two notes. The higher of those two also belongs to position 2. Try the crossing on one string, then see where it takes you in the next position.',
  detail: 'The numbering here starts where the minor tonic is the lower note on the low E string. After position 5, the shapes repeat an octave higher. A minor and C major pentatonic share their pitches, but their tonic and chord tones change. Switch between them without moving your hand and listen to each triad.',
  task: 'On the high E string, play frets 5, 8 and 10. Pause on 8, the link between positions 1 and 2. Then work back through 8 to 5 and let the final A ring. Try it on guitar or hum the phrase with the example.',
  taskPositions: [5, 8, 10, 8, 5].map((fret) => ({ string: 0, fret })),
}

export const PENTATONIC_EXERCISES: readonly PositionExercise[] = [
  { id: 'pentatonic-crossing', topic: 'pentatonic', range: [5, 11], string: 0, scale: { tonic: 9, kind: 'minorPentatonic' },
    anchor: { string: 0, fret: 5 }, prompt: 'Find C, the note shared by positions 1 and 2 on high E in A minor pentatonic.',
    hint: 'C is a minor third above the marked A. Move up three frets on the high E string.',
    why: 'High E fret 8 is C. It finishes the pair of notes in position 1 and starts the pair in position 2.', answer: { kind: 'pitch', midi: 72 } },
  { id: 'pentatonic-same-a', topic: 'pentatonic', range: [1, 8], string: 2, scale: { tonic: 9, kind: 'minorPentatonic' },
    anchor: { string: 3, fret: 7 }, prompt: 'Find the same A on the G string.',
    hint: 'The marked A is on D-string fret 7. Open G is five semitones above open D, so move five frets back on the G string.',
    why: 'G-string fret 2 and D-string fret 7 both sound A3. Use the alternative position when it puts the next note of your phrase within reach.', answer: { kind: 'pitch', midi: 57 } },
  { id: 'pentatonic-next-note', topic: 'pentatonic', range: [5, 11], string: 0, scale: { tonic: 9, kind: 'minorPentatonic' },
    anchor: { string: 0, fret: 8 }, prompt: 'Move from the shared C into position 2 and find the next scale note.',
    hint: 'The next note after C is D. Move up a whole step on the high E string.',
    why: 'D is at fret 10. C and D are the two high E notes in this position.', answer: { kind: 'pitch', midi: 74 } },
]
