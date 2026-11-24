import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, Clock3, Lightbulb, ListMusic } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { noteName, octaveOf, pitchAt, positionName, samePosition, type Position } from '../music/theory'
import { EXERCISES, TOPICS, findExercise, findTopic, type Exercise, type PositionExercise, type Topic } from '../learning/content'
import { feedbackFor, isCorrect, solutionFor } from '../learning/exercise'
import { SESSION_MINUTES, topicProgress, type Progress, type PositionResponse, type Response, type Session } from '../learning/progress'
import { Fretboard, noteMarker } from './Fretboard'
import { AudioButton } from './AudioButton'
import { IntervalLab, ScaleLab } from './RelationshipLabs'
import { ChordCheck, TriadLab } from './HarmonyLabs'
import { ProgressionLab } from './ProgressionLab'

function PositionDemo({ topic }: { topic: Extract<Topic, { demo: [Position, Position] }> }) {
  const [selected, setSelected] = useState<Position | null>(null)
  const [reveal, setReveal] = useState<Position | null>(null)
  const [from, to] = topic.demo
  const pitch = selected ? pitchAt(selected) : null

  return (
    <>
      <div className="demo-controls">
        <div className="demo-positions" role="group" aria-label="Demonstration notes">
          {topic.demo.map((position, index) => <button type="button" className="button button-secondary" key={index}
            aria-pressed={samePosition(selected, position)} onClick={() => { setSelected(position); setReveal(position) }}>{topic.demoLabels[index]}</button>)}
        </div>
        <AudioButton pitches={topic.demo.map(pitchAt)} label="Listen to both" />
      </div>
      <Fretboard range={[Math.max(0, from.fret - 1), Math.max(from.fret + 5, to.fret)]} selected={selected} reveal={reveal} guideString={from.string}
        onSelect={setSelected} marker={(position) => topic.demo.some((item) => samePosition(item, position)) ? noteMarker(position, 'root') : samePosition(selected, position) ? noteMarker(position) : undefined} />
      <div className="explorer-result lesson-result">
        <div aria-live="polite">{selected && pitch !== null ? <>
          <strong>{noteName(pitch)}<sub>{octaveOf(pitch)}</sub></strong><span>{positionName(selected)}</span>
        </> : <span>Try the two marked positions on the fretboard.</span>}</div>
        {pitch !== null && <AudioButton pitches={[pitch]} label="Hear note" />}
      </div>
    </>
  )
}

export function LessonBody({ topic }: { topic: Topic }) {
  return <>
    <p className="teaching-copy">{topic.intro}</p>
    {topic.activity === undefined && <PositionDemo topic={topic} />}
    {topic.activity === 'intervals' && <IntervalLab />}
    {topic.activity === 'scales' && <ScaleLab />}
    {topic.activity === 'triads' && <TriadLab />}
    {topic.activity === 'changes' && <ProgressionLab />}
    <details className="explanation">
        <summary><CircleHelp size={17} /> Why does this work?</summary>
        <p>{topic.detail}</p>
      </details>
  </>
}

export function ExerciseBody({ exercise, response, onResponse }: {
  exercise: Exercise; response?: Response; onResponse: (response: Response) => void;
}) {
  return exercise.kind === 'chord' ? <ChordCheck exercise={exercise} response={response && 'positions' in response ? response : undefined} onResponse={onResponse} />
    : <PositionCheck exercise={exercise} response={response && 'position' in response ? response : undefined} onResponse={onResponse} />
}

function PositionCheck({ exercise, response, onResponse }: {
  exercise: PositionExercise; response?: PositionResponse; onResponse: (response: PositionResponse) => void;
}) {
  const [hint, setHint] = useState(false)
  const [reveal, setReveal] = useState<Position | null>(null)
  const finished = !!response && response.result !== 'retry'
  const anchor = exercise.anchor

  function submit(position: Position) {
    onResponse({ result: isCorrect(exercise, position) ? 'correct' : 'retry', position })
  }

  function showAnswer() {
    const position = solutionFor(exercise)
    setReveal(position)
    onResponse({ result: 'shown', position })
  }

  return (
    <>
      <p className="teaching-copy">Tap a position on the fretboard.</p>
      <Fretboard range={exercise.range} guideString={exercise.string} selected={response?.position} onSelect={submit} locked={finished}
        reveal={reveal ?? response?.position ?? anchor} marker={(position) => samePosition(response?.position, position) ? noteMarker(position, finished ? 'target' : undefined)
          : samePosition(anchor, position) ? noteMarker(position, 'root') : undefined} />
      <div className="exercise-feedback" aria-live="polite" role="status">
        {response && <div className={`feedback-box ${finished ? 'is-finished' : ''}`}>
          {response.result === 'correct' ? <Check size={20} /> : <Lightbulb size={20} />}
          <div><strong>{response.result === 'correct' ? 'That’s it.' : response.result === 'shown' ? 'Here’s the position.' : 'Try another position.'}</strong>
            <p>{response.result === 'shown' ? exercise.why : feedbackFor(exercise, response.position)}</p></div>
        </div>}
      </div>
      <div className="exercise-tools">
        {!finished && <>
          <button className="button button-secondary" type="button" aria-expanded={hint} aria-controls="exercise-hint" onClick={() => setHint(!hint)}><Lightbulb size={17} />{hint ? 'Hide hint' : 'Get a hint'}</button>
          <button className="button button-quiet" type="button" onClick={showAnswer}>Show answer</button>
        </>}
        {finished && <AudioButton pitches={anchor ? [pitchAt(anchor), pitchAt(response.position)].sort((a, b) => a - b) : [pitchAt(response.position)]} label="Hear the answer" />}
      </div>
      {!finished && <p id="exercise-hint" className="hint" hidden={!hint}>{exercise.hint}</p>}
    </>
  )
}

export function Library({ progress }: { progress: Progress }) {
  const groups = [...new Set(TOPICS.map((topic) => topic.group ?? 'Fretboard foundations'))]
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow"><BookOpen size={17} /> Lesson library</div>
        <h1 tabIndex={-1}>Learn at your own pace</h1>
        <p>Start with the landmarks, or choose an idea you’d like to practise.</p>
      </div>
      {groups.map((group) => <section key={group} className="panel library-list" aria-label={group}>
        <h2>{group}</h2>
        {TOPICS.filter((topic) => (topic.group ?? 'Fretboard foundations') === group).map((topic) => <a key={topic.id} className="library-row" href={`#learn/${topic.id}`} aria-labelledby={`lesson-${topic.id}`}>
          <span className="card-icon"><BookOpen size={21} /></span>
          <div><h3 id={`lesson-${topic.id}`}>{topic.title}</h3><p>{topic.description}</p>
            {progress.lessons.includes(topic.id) && <span className="lesson-state"><Check size={15} /> Lesson explored</span>}
          </div>
          <span className="icon-link"><ChevronRight size={23} /></span>
        </a>)}
      </section>)}
    </>
  )
}

export function Lesson({ topic, onRead }: { topic: Topic; onRead: () => void }) {
  const first = EXERCISES.find((exercise) => exercise.topic === topic.id)
  return (
    <div className="learning-layout">
      <a className="back-link" href="#learn"><ArrowLeft size={16} /> All lessons</a>
      <section className="panel lesson-panel">
        <div className="eyebrow"><BookOpen size={16} /> {topic.group ?? 'Fretboard foundations'}</div>
        <h1 tabIndex={-1}>{topic.title}</h1>
        <LessonBody key={topic.id} topic={topic} />
        {first && <div className="learning-actions"><a href={`#exercise/${first.id}`} onClick={onRead} className="button button-primary">Try an exercise<ArrowRight size={19} /></a></div>}
      </section>
    </div>
  )
}

export function ExerciseView({ exercise, onAttempt }: { exercise: Exercise; onAttempt: (response: Response) => void }) {
  const [response, setResponse] = useState<Response>()
  const group = EXERCISES.filter((item) => item.topic === exercise.topic)
  const next = group[group.findIndex((item) => item.id === exercise.id) + 1]
  return (
    <div className="learning-layout">
      <a className="back-link" href={`#learn/${exercise.topic}`}><ArrowLeft size={16} /> Back to lesson</a>
      <section className="panel lesson-panel">
        <div className="eyebrow"><ListMusic size={17} /> {exercise.kind === 'chord' ? 'Build a chord' : 'Note identification'}</div>
        <h1 tabIndex={-1}>{exercise.prompt}</h1>
        <ExerciseBody exercise={exercise} response={response} onResponse={(answer) => { if (!response) onAttempt(answer); setResponse(answer) }} />
        {response && response.result !== 'retry' && <div className="learning-actions">
          <a href={next ? `#exercise/${next.id}` : '#learn'} className="button button-primary">{next ? 'Next exercise' : 'Back to lessons'}<ArrowRight size={19} /></a>
        </div>}
      </section>
    </div>
  )
}

export function DailyPractice({ session, onStart, onAdvance, onResponse }: {
  session: Session | null; onStart: () => void; onAdvance: (session: Session) => void;
  onResponse: (session: Session, exercise: string, response: Response) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const step = session?.step
  const completed = session?.completedAt != null
  useEffect(() => { heading.current?.focus() }, [step, completed])

  if (!session) return <section className="panel lesson-panel learning-layout">
    <div className="eyebrow"><Clock3 size={17} /> About {SESSION_MINUTES} min</div>
    <h1 tabIndex={-1} ref={heading}>Daily practice</h1><p>Start with a short demonstration and try the idea on the fretboard.</p>
    <button className="button button-primary" type="button" onClick={onStart}>Start daily practice<ArrowRight size={19} /></button>
  </section>

  const topic = findTopic(session.topic)!
  const exercise = findExercise(session.exercises[session.step - 1])
  const response = exercise && session.responses[exercise.id]
  const total = session.exercises.length + 2
  const title = completed ? 'Practice complete' : session.step === 0 ? topic.title : exercise?.prompt ?? 'Try it in a short phrase'

  return (
    <div className="learning-layout">
      <div className="practice-topline"><a className="back-link" href="#today"><ArrowLeft size={16} /> Back to Today</a>
        {!completed && <span>Step {session.step + 1} of {total}</span>}
      </div>
      {!completed && <progress className="session-progress" aria-label="Daily practice progress" value={session.step + 1} max={total} />}
      <section className="panel lesson-panel">
        <div className="eyebrow">{completed ? <Check size={18} /> : <BookOpen size={17} />}{completed ? 'Daily practice' : exercise ? (exercise.kind === 'chord' ? 'Build a chord' : 'Find a note') : session.step === 0 ? 'Short lesson' : 'Put it into practice'}</div>
        <h1 tabIndex={-1} ref={heading}>{title}</h1>
        {completed ? <>
          <p className="teaching-copy">You worked on {topic.title.toLowerCase()}. Your answers will help choose what to revisit in your next session.</p>
          <div className="learning-actions"><a className="button button-primary" href="#today">Back to Today<ArrowRight size={19} /></a><a className="button button-secondary" href="#fretboard">Open fretboard</a></div>
        </> : <>
          {session.step === 0 && <LessonBody key={session.id} topic={topic} />}
          {exercise && <ExerciseBody key={`${session.id}/${exercise.id}`} exercise={exercise} response={response} onResponse={(answer) => onResponse(session, exercise.id, answer)} />}
          {session.step > session.exercises.length && <>
            <p className="teaching-copy">{topic.task}</p>
            <AudioButton pitches={topic.taskPositions.map(pitchAt)} label="Listen to the example" />
          </>}
          {(!exercise || (response && response.result !== 'retry')) && <div className="learning-actions">
            <button className="button button-primary" type="button" onClick={() => onAdvance(session)}>{session.step === 0 ? 'Start exercises' : session.step === total - 1 ? 'Finish practice' : 'Continue'}<ArrowRight size={19} /></button>
            {session.step === total - 1 && <a href="#fretboard" className="button button-secondary">Try it in the explorer</a>}
          </div>}
        </>}
      </section>
    </div>
  )
}

export function ProgressView({ progress }: { progress: Progress }) {
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow"><ListMusic size={17} /> Practice history</div>
        <h1 tabIndex={-1}>Your progress</h1>
        <p>See the ideas you’ve worked on and what could use another look.</p>
      </div>
      <section className="panel library-list" aria-label="Learning history">
        <h2>Learning topics</h2>
        <p className="progress-total">{progress.sessionsCompleted === 0 ? 'Your completed daily sessions will appear here.' : `${progress.sessionsCompleted} daily ${progress.sessionsCompleted === 1 ? 'session' : 'sessions'} completed`}</p>
        {TOPICS.map((topic) => {
          const status = topicProgress(progress, topic.id)
          return <a key={topic.id} className="library-row" href={`#learn/${topic.id}`} aria-labelledby={`progress-${topic.id}`}>
            <span className="card-icon">{status.established ? <Check size={21} /> : <BookOpen size={21} />}</span>
            <div><h3 id={`progress-${topic.id}`}>{topic.title}</h3><p>{status.established ? 'Finding notes confidently' : status.attempted ? 'Worth another look' : progress.lessons.includes(topic.id) ? 'Lesson explored' : 'Ready to explore'}</p></div>
            <span className="icon-link"><ChevronRight size={23} /></span>
          </a>
        })}
      </section>
    </>
  )
}
