import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { pickPracticePosition } from '../learning/exercise'
import { noteName, pitchAt, pitchClass, samePosition, STRINGS, type Position, type Spelling } from '../music/theory'
import { Fretboard, type FretboardView } from './Fretboard'

type Drill = 'find' | 'name'
type Feedback = { result: 'retry' | 'correct' | 'shown'; position: Position; guess?: number }
const PITCH_CLASSES = Array.from({ length: 12 }, (_, index) => index)

function drillLocation({ string, fret }: Position) {
  return `String ${string + 1}, ${fret === 0 ? 'open' : `fret ${fret}`}`
}

export function FretboardPractice({ range, spelling }: { range: readonly [number, number]; spelling: Spelling }) {
  const board = useRef<FretboardView>(null)
  const [drill, setDrill] = useState<Drill>('find')
  const [question, setQuestion] = useState<Position | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const askingForPosition = drill === 'find'
  const answered = !!feedback && feedback.result !== 'retry'
  const target = question ? pitchClass(pitchAt(question)) : null
  const targetName = target === null ? '' : noteName(target, spelling)

  useLayoutEffect(() => {
    setQuestion(pickPracticePosition(board.current?.visibleRange() ?? range))
  }, [range])

  function nextQuestion() {
    setQuestion(pickPracticePosition(board.current?.visibleRange() ?? range, question))
    setFeedback(null)
  }

  function switchDrill(next: Drill) {
    if (next === drill) return
    setDrill(next)
    nextQuestion()
  }

  function choosePosition(position: Position) {
    if (!question || answered) return
    const result = pitchClass(pitchAt(position)) === target ? 'correct' : 'retry'
    setFeedback({ result, position })
  }

  function chooseName(guess: number) {
    if (!question || answered) return
    setFeedback({ result: guess === target ? 'correct' : 'retry', position: question, guess })
  }

  function showAnswer() {
    if (question && !answered) setFeedback({ result: 'shown', position: question })
  }

  function marker(position: Position) {
    if (!askingForPosition && !answered && samePosition(question, position)) {
      return { label: '?', kind: 'target' as const, spokenLabel: `${drillLocation(position)}, highlighted note` }
    }
    if (feedback && samePosition(feedback.position, position) && (askingForPosition || answered)) {
      return { label: noteName(pitchAt(position), spelling), kind: answered ? 'target' as const : undefined }
    }
  }

  function feedbackText() {
    if (!feedback) return ''
    if (feedback.result === 'retry') {
      return feedback.guess === undefined
        ? `That’s ${noteName(pitchAt(feedback.position), spelling)}. Try another position for ${targetName}.`
        : `You chose ${noteName(feedback.guess, spelling)}. Try a different note name.`
    }
    const { string, fret } = feedback.position
    const stringName = STRINGS[string].name
    const location = fret === 0 ? `The open ${stringName} string` : `Fret ${fret} on the ${stringName} string`
    return `${feedback.result === 'correct' ? 'That’s it.' : 'Here’s the answer.'} ${location} plays ${targetName}.`
  }

  return (
    <section className="note-practice" aria-label="Fretboard note practice">
      <div className="segmented practice-drills" role="group" aria-label="Practice type">
        <button type="button" aria-pressed={askingForPosition} onClick={() => switchDrill('find')}>Find a note</button>
        <button type="button" aria-pressed={!askingForPosition} onClick={() => switchDrill('name')}>Name a note</button>
      </div>
      <div className="practice-prompt" aria-live="polite" aria-atomic="true">
        <h2>{askingForPosition ? (question ? `Where is ${targetName}?` : 'Find a note') : 'What note is highlighted?'}</h2>
        {askingForPosition ? <p className="practice-instruction">Tap any position that plays this note.</p> : <p>{question && `${drillLocation(question)}. `}<span className="practice-instruction">Choose the note name.</span></p>}
      </div>
      <Fretboard range={range} viewRef={board} onSelect={choosePosition} selected={askingForPosition ? feedback?.position : null} marker={marker}
        locked={!askingForPosition || answered} label={!askingForPosition ? 'Guitar fretboard with the marked position.' : undefined} />
      {!askingForPosition && <div className="practice-note-choices" role="group" aria-label="Note names">
        {PITCH_CLASSES.map((pitch) => <button className="button button-secondary" key={pitch} type="button"
          aria-pressed={answered ? target === pitch : feedback?.guess === pitch} aria-disabled={answered || undefined}
          onClick={() => chooseName(pitch)}>{noteName(pitch, spelling)}</button>)}
      </div>}
      <p className={`practice-feedback${answered ? ' is-answered' : ''}`} role="status">{feedbackText()}</p>
      <div className="practice-actions">
        <button className="button button-secondary" type="button" aria-disabled={answered || undefined} onClick={showAnswer}>Show answer</button>
        <button className="button button-primary" type="button" onClick={nextQuestion}>Next note<ArrowRight size={17} /></button>
      </div>
    </section>
  )
}
