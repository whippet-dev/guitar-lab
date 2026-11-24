import { describe, expect, it } from 'vitest'
import { EXERCISES, findExercise } from './content'
import { feedbackFor, isCorrect, solutionFor } from './exercise'
import { advanceSession, EMPTY_PROGRESS, parseProgress, planSession, recordAttempt, saveSessionResponse, topicProgress, type Progress, type Result } from './progress'

const day = 86_400_000

function addAttempt(progress: Progress, exercise: string, result: Result, at: number) {
  return recordAttempt(progress, { id: `${exercise}/${at}`, exercise, result, at })
}

describe('exercise content and feedback', () => {
  it.each(EXERCISES)('has a valid answer within the range for $id', (exercise) => {
    const answer = solutionFor(exercise)
    expect(isCorrect(exercise, answer)).toBe(true)
    expect(feedbackFor(exercise, answer)).toBe(exercise.why)
  })

  it('distinguishes the required string, note name and exact octave', () => {
    const exercise = findExercise('higher-e')!
    expect(isCorrect(exercise, { string: 5, fret: 0 })).toBe(false)
    expect(isCorrect(exercise, { string: 4, fret: 7 })).toBe(false)
    expect(feedbackFor(exercise, { string: 4, fret: 7 })).toContain('Try again on the low E string')
    expect(feedbackFor(exercise, { string: 5, fret: 11 })).toContain('try a higher fret')
    expect(feedbackFor(exercise, { string: 5, fret: 13 })).toContain('try a lower fret')
    expect(isCorrect(findExercise('low-g')!, { string: 5, fret: 15 })).toBe(true)
  })
})

describe('daily practice and progress', () => {
  it('starts with landmarks and introduces semitones with prerequisite review', () => {
    expect(planSession(EMPTY_PROGRESS, 'first', day).exercises).toEqual(['open-low-e', 'open-a', 'higher-e'])
    let progress = addAttempt(EMPTY_PROGRESS, 'open-low-e', 'correct', 1)
    progress = addAttempt(progress, 'open-a', 'correct', 2)
    const next = planSession(progress, 'next', day)
    expect(next.topic).toBe('semitones')
    expect(next.exercises).toEqual(['higher-e', 'low-f', 'low-g'])
  })

  it('reinforces an uncertain foundation before progressing', () => {
    let progress = addAttempt(EMPTY_PROGRESS, 'open-low-e', 'correct', 1)
    progress = addAttempt(progress, 'open-a', 'correct', 2)
    progress = addAttempt(progress, 'higher-e', 'shown', 3)
    expect(topicProgress(progress, 'landmarks').established).toBe(false)
    expect(planSession(progress, 'review', day).topic).toBe('landmarks')
  })

  it('uses elapsed time and difficulty to prioritise review after the available progression', () => {
    let progress = addAttempt(EMPTY_PROGRESS, 'open-low-e', 'correct', day)
    progress = addAttempt(progress, 'open-a', 'correct', day + 1)
    progress = addAttempt(progress, 'low-f', 'correct', 3 * day)
    progress = addAttempt(progress, 'low-g', 'correct', 3 * day + 1)
    progress = addAttempt(progress, 'octave-g', 'correct', 4 * day)
    progress = addAttempt(progress, 'octave-c', 'correct', 4 * day + 1)
    expect(planSession(progress, 'review', 5 * day).topic).toBe('landmarks')
    progress = addAttempt(progress, 'low-f', 'retry', 5 * day)
    progress = addAttempt(progress, 'b-to-c', 'correct', 5 * day + 1)
    progress = addAttempt(progress, 'open-a', 'correct', 5 * day + 2)
    expect(planSession(progress, 'review', 5 * day + 3).topic).toBe('semitones')
  })

  it('resumes an exercise and keeps its first result when the learner retries', () => {
    const session = planSession(EMPTY_PROGRESS, 'one', 1)
    let progress = advanceSession({ ...EMPTY_PROGRESS, session }, 'one', 0, 2)
    expect(progress.lessons).toEqual(['landmarks'])
    expect(advanceSession(progress, 'one', 1, 2)).toBe(progress)
    progress = saveSessionResponse(progress, 'one', 'open-low-e', { result: 'retry', position: { string: 5, fret: 1 } }, 3)
    progress = parseProgress(JSON.stringify(progress))
    expect(progress.session?.step).toBe(1)
    expect(progress.session?.responses['open-low-e'].result).toBe('retry')
    progress = saveSessionResponse(progress, 'one', 'open-low-e', { result: 'correct', position: { string: 5, fret: 0 } }, 4)
    expect(progress.attempts.map(({ result }) => result)).toEqual(['retry'])
    expect(advanceSession(progress, 'one', 1, 5).session?.step).toBe(2)
  })

  it('rejects stale responses and records completing a session only once', () => {
    const session = planSession(EMPTY_PROGRESS, 'one', 1)
    const progress = { ...EMPTY_PROGRESS, session: { ...session, step: 4 } }
    expect(saveSessionResponse(progress, 'other', 'open-low-e', { result: 'shown', position: { string: 5, fret: 0 } }, 2)).toBe(progress)
    const finished = advanceSession(progress, 'one', 4, 3)
    expect(finished.sessionsCompleted).toBe(1)
    expect(finished.session?.completedAt).toBe(3)
    expect(advanceSession(finished, 'one', 4, 4)).toBe(finished)
  })

  it('recovers from missing, invalid, or superseded local data', () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS)
    expect(parseProgress('{')).toEqual(EMPTY_PROGRESS)
    expect(parseProgress('{"version":2}')).toEqual(EMPTY_PROGRESS)
    expect(parseProgress('{"version":1,"lessons":["landmarks","landmarks","invalid"],"session":{"id":"bad"}}')).toEqual({ ...EMPTY_PROGRESS, lessons: ['landmarks'] })
  })
})
