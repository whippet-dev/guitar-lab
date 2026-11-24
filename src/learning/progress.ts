import { EXERCISES, TOPICS, findExercise, findTopic, type TopicId } from './content'
import { MAX_FRET, type Position } from '../music/theory'

export type Result = 'correct' | 'retry' | 'shown'
export type Attempt = { id: string; exercise: string; result: Result; at: number }
export type PositionResponse = { result: Result; position: Position }
export type ChordResponse = { result: Result; positions: Position[] }
export type RhythmResponse = { result: Result; slots: number[] }
export type Response = PositionResponse | ChordResponse | RhythmResponse

export type Session = {
  id: string
  topic: TopicId
  exercises: string[]
  step: number
  responses: Record<string, Response>
  completedAt: number | null
}

export type Progress = {
  version: 1
  attempts: Attempt[]
  lessons: TopicId[]
  sessionsCompleted: number
  session: Session | null
}

export const EMPTY_PROGRESS: Progress = { version: 1, attempts: [], lessons: [], sessionsCompleted: 0, session: null }
export const SESSION_MINUTES = 5
const DAY = 86_400_000

export function topicProgress(progress: Progress, topic: TopicId) {
  const attempts = progress.attempts.filter(({ exercise }) => findExercise(exercise)?.topic === topic)
  const recent = attempts.slice(-3)
  const last = recent.at(-1)
  const correct = recent.filter(({ result }) => result === 'correct').length
  const distinctCorrect = new Set(attempts.filter(({ result }) => result === 'correct').map(({ exercise }) => exercise))
  return {
    established: new Set(recent.filter(({ result }) => result === 'correct').map(({ exercise }) => exercise)).size >= 2 && last?.result === 'correct',
    familiar: distinctCorrect.size >= 2,
    attempted: recent.length > 0,
    misses: recent.length - correct,
    lastAt: last?.at ?? 0,
  }
}

export function planSession(progress: Progress, id: string, now: number): Session {
  const skills = TOPICS.map(({ id: topic }) => ({ topic, ...topicProgress(progress, topic) }))
  const next = skills.find(({ familiar }) => !familiar)
  const reviewPriority = (skill: typeof skills[number]) => (now - skill.lastAt) / DAY + skill.misses * 2
  const review = skills.filter(({ familiar }) => familiar).sort((a, b) => reviewPriority(b) - reviewPriority(a))
  const focus = next ?? review[0]
  const focusIndex = skills.indexOf(focus)
  const lastSeen = new Map(progress.attempts.map(({ exercise, at }) => [exercise, at]))
  const lastSession = new Set(progress.session?.exercises ?? [])
  const promptsFor = (topic: TopicId) => EXERCISES.filter((exercise) => exercise.topic === topic)
    .sort((a, b) => Number(lastSession.has(a.id)) - Number(lastSession.has(b.id)) || (lastSeen.get(a.id) ?? 0) - (lastSeen.get(b.id) ?? 0))
    .map((exercise) => exercise.id)
  const focusPrompts = promptsFor(focus.topic)
  const overdue = review.find((skill) => skill !== focus && (now - skill.lastAt >= 7 * DAY || (skill.misses > 0 && now - skill.lastAt >= 2 * DAY)))
  const revisit = overdue ?? skills[focusIndex - 1]
  const exercises = revisit ? [promptsFor(revisit.topic)[0], ...focusPrompts.slice(0, 2)] : focusPrompts.slice(0, 3)

  return { id, topic: focus.topic, exercises, step: 0, responses: {}, completedAt: null }
}

export function recordAttempt(progress: Progress, attempt: Attempt): Progress {
  if (progress.attempts.some(({ id }) => id === attempt.id)) return progress
  return { ...progress, attempts: [...progress.attempts, attempt].slice(-300) }
}

export function markLesson(progress: Progress, topic: TopicId): Progress {
  if (progress.lessons.includes(topic)) return progress
  return { ...progress, lessons: [...progress.lessons, topic] }
}

export function saveSessionResponse(progress: Progress, sessionId: string, exercise: string, response: Response, at: number): Progress {
  const session = progress.session
  if (session?.id !== sessionId || session.completedAt !== null || session.exercises[session.step - 1] !== exercise) return progress
  const updated = recordAttempt(progress, { id: `${sessionId}/${exercise}`, exercise, result: response.result, at })
  return { ...updated, session: { ...session, responses: { ...session.responses, [exercise]: response } } }
}

export function advanceSession(progress: Progress, sessionId: string, step: number, now: number): Progress {
  const session = progress.session
  if (session?.id !== sessionId || session.step !== step || session.completedAt !== null) return progress
  if (step === 0) {
    return { ...markLesson(progress, session.topic), session: { ...session, step: 1 } }
  }
  if (step <= session.exercises.length) {
    const response = session.responses[session.exercises[step - 1]]
    if (!response || response.result === 'retry') return progress
    return { ...progress, session: { ...session, step: step + 1 } }
  }
  return { ...progress, sessionsCompleted: progress.sessionsCompleted + 1, session: { ...session, completedAt: now } }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isResult(value: unknown): value is Result {
  return value === 'correct' || value === 'retry' || value === 'shown'
}

function isPosition(value: unknown): value is Position {
  return record(value) && typeof value.string === 'number' && Number.isInteger(value.string) && value.string >= 0 && value.string < 6 &&
    typeof value.fret === 'number' && Number.isInteger(value.fret) && value.fret >= 0 && value.fret <= MAX_FRET
}

function isResponse(value: unknown): value is Response {
  return record(value) && isResult(value.result) && (isPosition(value.position) ||
    (Array.isArray(value.positions) && value.positions.length === 2 && value.positions.every(isPosition)) ||
    (Array.isArray(value.slots) && new Set(value.slots).size === value.slots.length && value.slots.every((slot) => Number.isInteger(slot) && slot >= 0 && slot < 8)))
}

function isAttempt(value: unknown): value is Attempt {
  return record(value) && typeof value.id === 'string' && typeof value.exercise === 'string' &&
    !!findExercise(value.exercise) && isResult(value.result) && typeof value.at === 'number' && Number.isFinite(value.at)
}

function isTopic(value: unknown): value is TopicId {
  return typeof value === 'string' && !!findTopic(value)
}

function isSession(value: unknown): value is Session {
  if (!record(value) || typeof value.id !== 'string' || !isTopic(value.topic) || !Array.isArray(value.exercises) ||
      value.exercises.length !== 3 || !value.exercises.every((id) => typeof id === 'string' && !!findExercise(id))) return false
  return typeof value.step === 'number' && Number.isInteger(value.step) && value.step >= 0 && value.step <= value.exercises.length + 1 &&
    record(value.responses) && Object.entries(value.responses).every(([id, response]) => {
      const exercise = findExercise(id)
      return exercise && isResponse(response) && (exercise.kind === 'chord' ? 'positions' in response : exercise.kind === 'rhythm' ? 'slots' in response : 'position' in response)
    }) &&
    (value.completedAt === null || (typeof value.completedAt === 'number' && Number.isFinite(value.completedAt)))
}

export function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY_PROGRESS
  try {
    const value: unknown = JSON.parse(raw)
    if (!record(value) || value.version !== 1) return EMPTY_PROGRESS
    return {
      version: 1,
      attempts: Array.isArray(value.attempts) ? value.attempts.filter(isAttempt).slice(-300) : [],
      lessons: Array.isArray(value.lessons) ? [...new Set(value.lessons.filter(isTopic))] : [],
      sessionsCompleted: typeof value.sessionsCompleted === 'number' && Number.isSafeInteger(value.sessionsCompleted) && value.sessionsCompleted > 0
        ? value.sessionsCompleted : 0,
      session: isSession(value.session) ? value.session : null,
    }
  } catch {
    return EMPTY_PROGRESS
  }
}
