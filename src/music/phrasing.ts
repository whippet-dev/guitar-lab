import type { TimedNote } from './audio'
import { chordsInMajorKey } from './progression'
import { pitchAt, type Position } from './theory'

export const BAR_SLOTS = 8
type Melody = readonly (Position | null)[]

const chords = chordsInMajorKey(48)
export const BACKINGS = [[chords[5], chords[3]], [chords[5], chords[4]], [chords[0], chords[3]]] as const

const e = { string: 0, fret: 0 } as const
const f = { string: 0, fret: 1 } as const
const g = { string: 0, fret: 3 } as const
const a = { string: 0, fret: 5 } as const

export const MELODIES: readonly { label: string; detail: string; slots: Melody }[] = [
  { label: 'Question and answer', detail: 'The second bar starts like the first, then lands on a different note. Listen for the space between them.',
    slots: [e, null, null, g, a, null, null, null, e, null, null, g, null, null, f, null] },
  { label: 'Repeat the idea', detail: 'Both bars have the same notes and rhythm. The chord change gives the repeated phrase a new sound.',
    slots: [e, null, null, g, a, null, null, null, e, null, null, g, a, null, null, null] },
  { label: 'Leave more space', detail: 'Two notes ask the question. Let the backing ring before the answer comes in.',
    slots: [e, null, null, a, null, null, null, null, null, null, null, null, g, null, f, null] },
  { label: 'Empty phrase', detail: 'Try two or three notes, then leave a space. Put a chord tone at the end of the answer and listen.',
    slots: Array<null>(BAR_SLOTS * 2).fill(null) },
]

export function phraseVoices(melody: Melody, backing: (typeof BACKINGS)[number], quaver: number, withChords: boolean): TimedNote[] {
  const lead = melody.flatMap((position, slot) => position ? [{ pitch: pitchAt(position), at: slot * quaver, duration: quaver * 0.8, volume: 0.22 }] : [])
  if (!withChords) return lead
  const harmony = backing.flatMap((chord, bar) => {
    const octaveDrop = chord.pitches[0] >= 52 ? 12 : 0
    return chord.pitches.map((pitch) => ({ pitch: pitch - octaveDrop, at: bar * BAR_SLOTS * quaver, duration: BAR_SLOTS * quaver, volume: 0.065 }))
  })
  return [...harmony, ...lead]
}
