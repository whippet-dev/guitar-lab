import { useState } from 'react'
import { chordPitches, TRIADS, triadKind, triadNotes } from '../music/harmony'
import { noteName, pitchAt, pitchClass, samePosition, type Position } from '../music/theory'
import type { ChordExercise } from '../learning/content'
import { chordSolution, isChordCorrect } from '../learning/exercise'
import type { ChordResponse } from '../learning/progress'
import { AudioButton } from './AudioButton'
import { Fretboard } from './Fretboard'

const fretRange = [0, 5] as const
const chordRoots = [48, 43, 45, 50, 52, 53]

export function TriadLab() {
  const [root, setRoot] = useState(chordRoots[0])
  const [third, setThird] = useState(4)
  const [fifth, setFifth] = useState(7)
  const [selected, setSelected] = useState<Position | null>(null)
  const kind = triadKind(third, fifth)
  const notes = triadNotes(root, third, fifth)
  const chord = kind ? `${notes[0].name} ${TRIADS[kind].label}` : `${notes[0].name} with a ${third === 3 ? 'minor' : 'major'} third and a ${fifth === 6 ? 'lowered' : 'raised'} fifth`
  const active = selected && notes.find((note) => note.pitch === pitchClass(pitchAt(selected)))
  const pitches = [root, root + third, root + fifth]

  return <div className="music-lab" aria-label="Triad workshop">
    <div className="lab-controls">
      <label className="lab-select">Root note<select value={root} onChange={(event) => { setRoot(Number(event.target.value)); setSelected(null) }}>
        {chordRoots.map((pitch) => <option value={pitch} key={pitch}>{noteName(pitch)}</option>)}
      </select></label>
      <label className="lab-select">Third<select value={third} onChange={(event) => { setThird(Number(event.target.value)); setSelected(null) }}>
        <option value={3}>Minor · 3 frets</option><option value={4}>Major · 4 frets</option>
      </select></label>
      <label className="lab-select">Fifth<select value={fifth} onChange={(event) => { setFifth(Number(event.target.value)); setSelected(null) }}>
        <option value={6}>Lowered · 6 frets</option><option value={7}>Perfect · 7 frets</option><option value={8}>Raised · 8 frets</option>
      </select></label>
    </div>
    <div className="lab-chord" aria-label="Chord notes">
      {notes.map(({ degree, name }) => <span key={degree}><strong>{name}</strong>{degree === 1 ? 'Root' : degree === 3 ? 'Third' : 'Fifth'}</span>)}
    </div>
    <Fretboard range={fretRange} selected={selected} onSelect={setSelected} marker={(position) => {
      const note = notes.find(({ pitch }) => pitch === pitchClass(pitchAt(position)))
      return note ? { label: note.name, kind: note.degree === 1 ? 'root' : undefined } : undefined
    }} />
    <div className="lab-result">
      <p role="status"><strong>{chord}</strong>{selected && (active ? ` · ${active.name} is the ${active.degree === 1 ? 'root' : active.degree === 3 ? 'third' : 'fifth'}.` : ` · ${noteName(pitchAt(selected), 'common')} sits outside the chord.`)}</p>
      <div className="lab-choices"><AudioButton pitches={pitches} together label="Hear the chord" /><AudioButton pitches={pitches} label="Hear notes separately" /></div>
    </div>
  </div>
}

export function ChordCheck({ exercise, response, onResponse }: { exercise: ChordExercise; response?: ChordResponse; onResponse: (value: ChordResponse) => void }) {
  const [positions, setPositions] = useState<Position[]>(response?.positions ?? [])
  const [hint, setHint] = useState(false)
  const [message, setMessage] = useState('')
  const root = pitchAt(exercise.root)
  const finished = !!response && response.result !== 'retry'
  const tried = response && response.positions.length === positions.length && response.positions.every((position, index) => samePosition(positions[index], position))
  const pitches = chordPitches(root, positions.map(pitchAt))
  const quality = TRIADS[exercise.quality]
  const target = triadNotes(root, quality.third, quality.fifth)
  const toneName = (pitch: number) => target.find(({ pitch: targetPitch }) => targetPitch === pitchClass(pitch))?.name ?? noteName(pitch, 'common')

  function pick(position: Position) {
    const pitch = pitchClass(pitchAt(position))
    if (pitch === pitchClass(root)) { setMessage('The root is already in the chord. Choose its two companion notes.'); return }
    if (positions.some((note) => pitchClass(pitchAt(note)) === pitch)) {
      setPositions(positions.filter((note) => pitchClass(pitchAt(note)) !== pitch))
    } else if (positions.length < 2) {
      setPositions([...positions, position])
    } else {
      setMessage('Tap one of your chosen notes to remove it, then try another.'); return
    }
    setMessage('')
  }

  function check() {
    if (positions.length !== 2 || finished) return
    setMessage('')
    onResponse({ result: isChordCorrect(exercise, positions) ? 'correct' : 'retry', positions })
  }

  function reveal() {
    const solution = chordSolution(exercise)
    setPositions(solution)
    setMessage('')
    onResponse({ result: 'shown', positions: solution })
  }

  return <div className="music-lab" aria-label="Build a triad">
    <p className="lab-instruction">The root is marked. Choose two other notes anywhere on the board. Tap a chosen note again to remove it.</p>
    <div className="lab-chord" aria-label="Your chord">
      {pitches.map((pitch, index) => <span key={pitch}><strong>{toneName(pitch)}</strong>{index === 0 ? 'Root' : 'Chosen note'}</span>)}
      {Array.from({ length: 3 - pitches.length }, (_, index) => <span key={`empty-${index}`}><strong>·</strong>Choose a note</span>)}
    </div>
    <Fretboard range={exercise.range} locked={finished} onSelect={pick} selectedPositions={positions}
      marker={(position) => samePosition(exercise.root, position) ? { label: noteName(root, 'common'), kind: 'root' }
        : positions.some((item) => samePosition(item, position)) ? { label: toneName(pitchAt(position)), kind: 'target' } : undefined} />
    <div className="lab-choices">
      <AudioButton pitches={pitches} together label={finished ? 'Hear the chord' : 'Hear your notes'} />
      {!finished && <>
        <button className="button button-primary" type="button" disabled={positions.length !== 2} onClick={check}>Check chord</button>
        <button className="button button-secondary" type="button" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Get a hint'}</button>
        <button className="button button-quiet" type="button" onClick={reveal}>Show answer</button>
      </>}
    </div>
    {hint && !finished && <p className="lab-instruction">{exercise.hint}</p>}
    <div className="lab-result"><p role="status">{message || (finished ? <><strong>{response.result === 'shown' ? 'Here’s the chord.' : 'That’s it.'}</strong> {exercise.why}</>
      : tried ? `Listen to ${pitches.map(toneName).join(', ')} together. ${exercise.hint}` : '')}</p></div>
  </div>
}
