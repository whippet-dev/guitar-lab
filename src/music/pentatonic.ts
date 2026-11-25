import { MAX_FRET, pitchClass, SCALES, STRINGS, type Position, type StringIndex } from './theory'

export function pentatonicPair(minorTonic: number, index: number) {
  const referenceFret = pitchClass(minorTonic - STRINGS[5].midi)
  // Start with two notes per string around the low-E tonic. Each following
  // position keeps the upper note of each pair and adds the next scale note.
  const strings = STRINGS.map(({ midi }, string) => {
    const frets = Array.from({ length: 19 }, (_, offset) => referenceFret + offset).filter((fret) =>
      SCALES.minorPentatonic.semitones.some((interval) => interval === pitchClass(midi + fret - minorTonic)))
    return frets.slice(index, index + 3).map((fret): Position => ({ string: string as StringIndex, fret }))
  })
  const lowerBy = strings.some((notes) => notes[2].fret > MAX_FRET) ? 12 : 0
  const adjusted = strings.map((notes) => notes.map((position) => ({ ...position, fret: position.fret - lowerBy })))
  return {
    current: adjusted.flatMap((notes) => notes.slice(0, 2)),
    next: adjusted.flatMap((notes) => notes.slice(1)),
  }
}
