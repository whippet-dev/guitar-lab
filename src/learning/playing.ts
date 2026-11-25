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
