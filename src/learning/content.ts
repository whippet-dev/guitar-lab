import type { Position, ScaleKind, StringIndex } from '../music/theory'
import type { TriadKind } from '../music/harmony'
import { RELATIONSHIP_EXERCISES, RELATIONSHIP_TOPICS } from './relationships'
import { HARMONY_EXERCISES, HARMONY_TOPICS } from './harmony'
import { LISTENING_EXERCISES, LISTENING_TOPIC } from './listening'
import { RHYTHM_EXERCISES, RHYTHM_TOPIC } from './rhythm'
import { PENTATONIC_EXERCISES, PENTATONIC_TOPIC, PHRASE_EXERCISES, PHRASE_TOPIC, SHAPE_EXERCISES, SHAPE_TOPICS } from './playing'

export type TopicId = 'landmarks' | 'semitones' | 'octaves' | 'intervals' | 'scales' | 'triads' | 'changes' | 'listening' | 'rhythm' | 'caged' | 'voicings' | 'pentatonic' | 'phrasing'

export type Topic = {
  id: TopicId
  group?: 'Scales and intervals' | 'Harmony in action' | 'Listening and timing' | 'Play it on guitar'
  title: string
  description: string
  intro: string
  detail: string
  task: string
  taskPositions: readonly Position[]
} & ({ activity?: undefined; demo: [Position, Position]; demoLabels: [string, string] } | { activity: 'intervals' | 'scales' | 'triads' | 'changes' | 'rhythm' | 'caged' | 'voicings' | 'pentatonic' | 'phrasing' })

export const TOPICS: readonly Topic[] = [
  {
    id: 'landmarks', title: 'Your first landmarks',
    description: 'Use open strings and the 12th fret to get your bearings.',
    intro: 'Start on the thickest string, low E. Play it open, without pressing a fret, then try fret 12. You’ll hear another E, an octave higher. Fret 0 means the open string on this board.',
    detail: 'This works on every string. At fret 12, about half the open string’s vibrating length remains. The pitch is an octave higher, with twice the frequency and the same note name.',
    demo: [{ string: 5, fret: 0 }, { string: 5, fret: 12 }], demoLabels: ['Open low E', 'Low E at fret 12'],
    task: 'Listen to open A and A at fret 12. Hum the two pitches back if you can. They share a note name, an octave apart. Find both positions in the explorer or on your guitar.',
    taskPositions: [{ string: 4, fret: 0 }, { string: 4, fret: 12 }],
  },
  {
    id: 'semitones', title: 'One fret at a time',
    description: 'Use semitone steps to find notes close to a landmark.',
    intro: 'Moving up one fret on a string raises its pitch by one semitone (a half step). Try open low E and fret 1, E to F. B to C is also a semitone. Two semitones make a tone (a whole step).',
    detail: 'All the other pairs of neighbouring natural notes are a tone apart. A sharp raises a note by a semitone and a flat lowers it by a semitone. The fret between F and G sounds the same whether you call it F♯ or G♭. These are enharmonic spellings, and the music tells you which one to use.',
    demo: [{ string: 5, fret: 0 }, { string: 5, fret: 1 }], demoLabels: ['Open low E', 'F at fret 1'],
    task: 'Listen to E, F and G on the thickest string at frets 0, 1 and 3. Hum the three notes back and listen for the smaller step from E to F. Then see if you can find and play the phrase in the explorer or on your guitar.',
    taskPositions: [{ string: 5, fret: 0 }, { string: 5, fret: 1 }, { string: 5, fret: 3 }],
  },
  {
    id: 'octaves', title: 'Move a phrase up an octave',
    description: 'Carry a fretted note or a short phrase into a higher register.',
    intro: 'The open strings gave you a starting point. The same rule works from any fret. Find G on the low E string at fret 3. Add 12 frets and you reach another G at fret 15, an octave higher.',
    detail: 'An octave spans 12 semitones. The frets get closer together up the neck, and each still represents one semitone. G2 and G3 are different pitches in the same pitch class, G. A pitch class groups pitches that are octaves apart.',
    demo: [{ string: 5, fret: 3 }, { string: 5, fret: 15 }], demoLabels: ['G at fret 3', 'G at fret 15'],
    task: 'Listen to a phrase on the low E string at frets 0, 1 and 3, then hear it again at 12, 13 and 15. Hum along and notice what stays the same. Try both versions in the explorer or on your guitar.',
    taskPositions: [0, 1, 3, 12, 13, 15].map((fret) => ({ string: 5, fret })),
  },
  ...RELATIONSHIP_TOPICS,
  ...HARMONY_TOPICS,
  LISTENING_TOPIC,
  RHYTHM_TOPIC,
  ...SHAPE_TOPICS,
  PENTATONIC_TOPIC,
  PHRASE_TOPIC,
]

type Answer =
  | { kind: 'position'; position: Position }
  | { kind: 'note'; pitchClass: number }
  | { kind: 'tones'; pitchClasses: readonly number[] }
  | { kind: 'pitch'; midi: number }

type ExercisePrompt = {
  id: string
  topic: TopicId
  prompt: string
  hint: string
  why: string
}

export type PositionExercise = ExercisePrompt & { kind?: undefined; range: [number, number]; string?: StringIndex; anchor?: Position; listen?: readonly [Position, Position]; scale?: { tonic: number; kind: ScaleKind }; answer: Answer }
export type ChordExercise = ExercisePrompt & { kind: 'chord'; range: [number, number]; root: Position; quality: TriadKind }
export type RhythmExercise = ExercisePrompt & { kind: 'rhythm'; slots: readonly number[] }
export type Exercise = PositionExercise | ChordExercise | RhythmExercise

export const EXERCISES: readonly Exercise[] = [
  {
    id: 'open-low-e', topic: 'landmarks', prompt: 'Find the open low E.',
    hint: 'Low E is the thickest string, shown at the bottom. The open position is fret 0.',
    why: 'The thickest string is tuned to E. At fret 0 the string rings open.',
    range: [0, 5], string: 5, answer: { kind: 'position', position: { string: 5, fret: 0 } },
  },
  {
    id: 'open-a', topic: 'landmarks', prompt: 'Find the open A string.',
    hint: 'The A string is just above the thickest string on this diagram. Look for fret 0.',
    why: 'The second-thickest string starts on A. That open note is a reference point for the whole string.',
    range: [0, 5], string: 4, answer: { kind: 'position', position: { string: 4, fret: 0 } },
  },
  {
    id: 'higher-e', topic: 'landmarks', prompt: 'Find E one octave above the open low E, on the same string.',
    hint: 'An octave is 12 semitones, or 12 frets on the same string.',
    why: 'Fret 12 on the low E string gives you E again, with twice the frequency of the open string.',
    range: [8, 13], string: 5, answer: { kind: 'pitch', midi: 52 },
  },
  {
    id: 'low-f', topic: 'semitones', prompt: 'Find F on the low E string.',
    hint: 'E and F are one semitone apart. Start from open E and move one fret.',
    why: 'F is one semitone above E, so fret 1 on the low E string gives you F.',
    range: [0, 5], string: 5, answer: { kind: 'note', pitchClass: 5 },
  },
  {
    id: 'low-g', topic: 'semitones', prompt: 'Find G on the low E string.',
    hint: 'F sits at fret 1. G is two semitones after F.',
    why: 'From E, move one fret to F, one to F sharp and one more to G. That puts G at fret 3.',
    range: [0, 5], string: 5, answer: { kind: 'note', pitchClass: 7 },
  },
  {
    id: 'b-to-c', topic: 'semitones', prompt: 'Start from the open B string. Find C on that string.',
    hint: 'B to C is a semitone, just like E to F. Move one fret up from open B.',
    why: 'B to C takes one semitone, so fret 1 on the B string gives you C.',
    range: [0, 5], string: 1, answer: { kind: 'note', pitchClass: 0 },
  },
  {
    id: 'octave-g', topic: 'octaves', prompt: 'Find the note an octave above low E string, fret 3.',
    hint: 'Stay on the low E string and add 12 to fret 3.',
    why: 'Fret 3 and fret 15 on the low E string both give you G. Fret 15 is 12 semitones higher.',
    range: [12, 17], string: 5, answer: { kind: 'pitch', midi: 55 },
  },
  {
    id: 'octave-c', topic: 'octaves', prompt: 'Find the note an octave above A string, fret 3.',
    hint: 'The 12-fret pattern works on every string. Stay on the A string.',
    why: 'Fret 3 on the A string is C. Move up 12 frets and you get the next C at fret 15.',
    range: [12, 17], string: 4, answer: { kind: 'pitch', midi: 60 },
  },
  {
    id: 'octave-d', topic: 'octaves', prompt: 'Find the note an octave below B string, fret 15.',
    hint: 'For an octave down, subtract 12 frets.',
    why: 'Fret 15 on the B string is D. Fret 3 is also D, an octave lower.',
    range: [0, 5], string: 1, answer: { kind: 'pitch', midi: 62 },
  },
  ...RELATIONSHIP_EXERCISES,
  ...HARMONY_EXERCISES,
  ...LISTENING_EXERCISES,
  ...RHYTHM_EXERCISES,
  ...SHAPE_EXERCISES,
  ...PENTATONIC_EXERCISES,
  ...PHRASE_EXERCISES,
]

export function findTopic(id: string) {
  return TOPICS.find((topic) => topic.id === id)
}

export function findExercise(id: string) {
  return EXERCISES.find((exercise) => exercise.id === id)
}
