import { noteName, pitchAt, pitchClass, positionName, samePosition, STRINGS, type Position, type StringIndex } from '../music/theory'
import type { ChordExercise, PositionExercise } from './content'
import { TRIADS } from '../music/harmony'

export function isCorrect(exercise: PositionExercise, position: Position) {
  if (exercise.string !== undefined && position.string !== exercise.string) return false
  const midi = pitchAt(position)
  const answer = exercise.answer
  if (answer.kind === 'position') return samePosition(answer.position, position)
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

export function feedbackFor(exercise: PositionExercise, position: Position) {
  if (isCorrect(exercise, position)) return exercise.why
  const pitch = noteName(pitchAt(position))
  const location = positionName(position)
  if (exercise.string !== undefined && position.string !== exercise.string) {
    return `You found ${pitch} at ${location.toLowerCase()}. Try again on the ${STRINGS[exercise.string].name} string.`
  }
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
