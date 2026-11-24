import { noteName, pitchAt, pitchClass, positionName, samePosition, STRINGS, type Position, type StringIndex } from '../music/theory'
import type { Exercise } from './content'

export function isCorrect(exercise: Exercise, position: Position) {
  if (exercise.string !== undefined && position.string !== exercise.string) return false
  const midi = pitchAt(position)
  const answer = exercise.answer
  if (answer.kind === 'position') return samePosition(answer.position, position)
  return answer.kind === 'note' ? pitchClass(midi) === answer.pitchClass : midi === answer.midi
}

export function solutionFor(exercise: Exercise): Position {
  for (let fret = exercise.range[0]; fret <= exercise.range[1]; fret++) {
    for (const index of STRINGS.keys()) {
      const position = { string: index as StringIndex, fret }
      if (isCorrect(exercise, position)) return position
    }
  }
  throw new Error(`No valid position in the range for ${exercise.id}`)
}

export function feedbackFor(exercise: Exercise, position: Position) {
  if (isCorrect(exercise, position)) return exercise.why
  const pitch = noteName(pitchAt(position))
  const location = positionName(position)
  if (exercise.string !== undefined && position.string !== exercise.string) {
    return `You found ${pitch} at ${location.toLowerCase()}. Try again on the ${STRINGS[exercise.string].name} string.`
  }
  const fret = solutionFor(exercise).fret
  const direction = position.fret < fret ? 'a higher' : 'a lower'
  return `That’s ${pitch}. Stay on this string and try ${direction} fret.`
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
