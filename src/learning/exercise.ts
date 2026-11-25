import { intervalNote, noteName, pitchAt, pitchClass, samePosition, scaleNotes, STRINGS, type Position, type StringIndex } from '../music/theory'
import type { ChordExercise, PositionExercise } from './content'
import { TRIADS } from '../music/harmony'

export function isCorrect(exercise: PositionExercise, position: Position) {
  if (exercise.string !== undefined && position.string !== exercise.string) return false
  const midi = pitchAt(position)
  const answer = exercise.answer
  if (answer.kind === 'position') return samePosition(answer.position, position)
  if (answer.kind === 'tones') return answer.pitchClasses.includes(pitchClass(midi))
  return answer.kind === 'note' ? pitchClass(midi) === answer.pitchClass : midi === answer.midi
}

export function solutionFor(exercise: PositionExercise): Position {
  for (let fret = exercise.range[0]; fret <= exercise.range[1]; fret++) {
    for (const index of STRINGS.keys()) {
      const position = { string: index as StringIndex, fret }
      if (isCorrect(exercise, position)) return position
    }
  }
  throw new Error(`No valid position in the range for ${exercise.id}`)
}

export function exerciseNoteName(exercise: PositionExercise, position: Position) {
  const midi = pitchAt(position)
  if (exercise.scale) {
    const { tonic, kind } = exercise.scale
    const scaleNote = scaleNotes(tonic, kind, 'common').find((note) => note.pitch === pitchClass(midi))
    if (scaleNote) return scaleNote.name
  }
  if (exercise.topic === 'intervals' && exercise.anchor) {
    const start = pitchAt(exercise.anchor)
    return intervalNote(start, pitchClass(midi - start)).name
  }
  return noteName(midi, 'common')
}

export function feedbackFor(exercise: PositionExercise, position: Position) {
  if (isCorrect(exercise, position)) return exercise.why
  const pitch = exerciseNoteName(exercise, position)
  if (exercise.string !== undefined && position.string !== exercise.string) {
    return `You found ${pitch}. Try again on the ${STRINGS[exercise.string].name} string.`
  }
  if (exercise.answer.kind === 'tones') return `That’s ${pitch}. ${exercise.hint}`
  if (exercise.answer.kind === 'pitch' && pitchClass(pitchAt(position)) === pitchClass(exercise.answer.midi)) {
    return `That’s the right note name in ${pitchAt(position) > exercise.answer.midi ? 'a higher' : 'a lower'} octave. Match the exact pitch this time.`
  }
  if (exercise.listen) return `That’s ${pitch}. Hear the target and your note side by side, then adjust your choice.`
  if (exercise.anchor) {
    const distance = pitchAt(position) - pitchAt(exercise.anchor)
    if (distance === 0) return 'That’s the starting pitch. Try the note that completes the relationship.'
    return `That’s ${pitch}, ${Math.abs(distance)} ${Math.abs(distance) === 1 ? 'semitone' : 'semitones'} ${distance > 0 ? 'above' : 'below'} the marked note. ${exercise.hint}`
  }
  const fret = solutionFor(exercise).fret
  const direction = position.fret < fret ? 'a higher' : 'a lower'
  return `That’s ${pitch}. Stay on this string and try ${direction} fret.`
}

export function chordOffsets(exercise: ChordExercise) {
  const { third, fifth } = TRIADS[exercise.quality]
  return [third, fifth]
}

export function isChordCorrect(exercise: ChordExercise, positions: readonly Position[]) {
  const root = pitchAt(exercise.root)
  const played = new Set(positions.map((position) => pitchClass(pitchAt(position) - root)))
  return positions.length === 2 && chordOffsets(exercise).every((offset) => played.has(offset))
}

export function chordSolution(exercise: ChordExercise) {
  const root = pitchAt(exercise.root)
  const [first, last] = exercise.range
  return chordOffsets(exercise).map((offset) => {
    for (const [index, { midi }] of STRINGS.entries()) {
      const fret = first + pitchClass(root + offset - midi - first)
      if (fret <= last) return { string: index as StringIndex, fret }
    }
    throw new Error(`No valid chord tone in the range for ${exercise.id}`)
  })
}

export function pickPracticePosition(range: readonly [number, number], previous?: Position | null): Position {
  const previousPitch = previous ? pitchClass(pitchAt(previous)) : undefined
  const positions: Position[] = []
  for (let fret = range[0]; fret <= range[1]; fret++) {
    for (const index of STRINGS.keys()) {
      const position = { string: index as StringIndex, fret }
      if (pitchClass(pitchAt(position)) !== previousPitch) positions.push(position)
    }
  }
  return positions[Math.floor(Math.random() * positions.length)]
}
