import { useState } from 'react'
import { pentatonicPair } from '../music/pentatonic'
import { degreeSymbol, noteName, pitchAt, pitchClass, positionName, samePosition, scaleNotes, STRINGS, type Position } from '../music/theory'
import { AudioButton } from './AudioButton'
import { Fretboard, toneKind } from './Fretboard'

const positionNumbers = [1, 2, 3, 4, 5]
const minorNames = Array.from({ length: 12 }, (_, pitch) => noteName(pitch, pitch === 8 ? 'sharps' : 'common'))

export function PentatonicLab() {
  const [minorTonic, setMinorTonic] = useState(9)
  const [major, setMajor] = useState(false)
  const [index, setIndex] = useState(0)
  const [overlap, setOverlap] = useState(true)
  const [tonesOnly, setTonesOnly] = useState(false)
  const [selected, setSelected] = useState<Position>()
  const { current, next } = pentatonicPair(minorTonic, index)
  const all = overlap ? [...current, ...next] : current
  const range = [Math.min(...all.map(({ fret }) => fret)), Math.max(...all.map(({ fret }) => fret))] as const
  const tonic = pitchClass(minorTonic + (major ? 3 : 0))
  const minorNotes = scaleNotes(minorTonic, 'minorPentatonic', minorTonic === 8 ? 'sharps' : 'common')
  const relativeMajor = minorNotes[1].name
  const notes = major ? scaleNotes(tonic, 'majorPentatonic', relativeMajor.endsWith('♭') ? 'flats' : 'sharps') : minorNotes
  const chordNotes = notes.filter(({ degree }) => degree === 1 || degree === 3 || degree === 5)
  const active = selected && all.some((position) => samePosition(selected, position)) ? selected : undefined
  const activeNote = active && notes.find((note) => note.pitch === pitchClass(pitchAt(active)))
  const crossingString = active?.string ?? 0
  const crossing = [...current.filter(({ string }) => string === crossingString), next.filter(({ string }) => string === crossingString)[1]]
  const tonicName = notes[0].name

  function select(position: Position) {
    if (!all.some((note) => samePosition(note, position))) return
    const note = notes.find(({ pitch }) => pitch === pitchClass(pitchAt(position)))
    if (!tonesOnly || (note && chordNotes.includes(note))) setSelected(position)
  }

  return <div className="music-lab" aria-label="Connected pentatonic positions">
    <div className="lab-controls">
      <label className="lab-select">Minor tonic<select value={minorTonic} onChange={(event) => { setMinorTonic(Number(event.target.value)); setSelected(undefined) }}>
        {minorNames.map((name, pitch) => <option value={pitch} key={pitch}>{name}</option>)}
      </select></label>
      <div className="lab-choices" role="group" aria-label="Hear the same positions as">
        <button type="button" className="button button-secondary" aria-pressed={!major} onClick={() => setMajor(false)}>{minorNames[minorTonic]} minor</button>
        <button type="button" className="button button-secondary" aria-pressed={major} onClick={() => setMajor(true)}>{relativeMajor} major</button>
      </div>
    </div>
    <div className="lab-choices" role="group" aria-label="Pentatonic position">
      {positionNumbers.map((number) => <button key={number} type="button" className="button button-secondary" aria-label={`Position ${number}`} aria-pressed={index === number - 1}
        onClick={() => { setIndex(number - 1); setSelected(undefined) }}>{number}</button>)}
    </div>
    <div className="lab-choices">
      <button type="button" className="button button-secondary" aria-pressed={overlap} onClick={() => setOverlap(!overlap)}>Show neighbour</button>
      <button type="button" className="button button-secondary" aria-pressed={tonesOnly} onClick={() => { setTonesOnly(!tonesOnly); setSelected(undefined) }}>Chord tones only</button>
    </div>
    <p className="lab-instruction">{tonicName} is home in this view. {overlap ? `A double ring marks notes shared with position ${index === 4 ? '1 in the next octave' : index + 2}. Faded notes belong to that next position.` : 'Each string has two scale notes in this position.'}</p>
    <Fretboard range={range} selected={active} onSelect={select} marker={(position) => {
      const inCurrent = current.some((item) => samePosition(position, item))
      const inNext = overlap && next.some((item) => samePosition(position, item))
      if (!inCurrent && !inNext) return undefined
      const note = notes.find(({ pitch }) => pitch === pitchClass(pitchAt(position)))!
      if (tonesOnly && !chordNotes.includes(note)) return undefined
      const offset = pitchClass(note.pitch - tonic)
      return { label: note.name, kind: toneKind(note.degree, offset), comparison: inNext ? (inCurrent ? 'shared' : 'neighbour') : undefined,
        spokenLabel: `${positionName(position)}, ${note.name}, degree ${degreeSymbol(note.degree, offset)}${inCurrent && inNext ? ', shared by both positions' : inNext ? ', next position' : ''}` }
    }} />
    <p className="lab-instruction" role="status">{activeNote ? `${activeNote.name} is degree ${degreeSymbol(activeNote.degree, pitchClass(activeNote.pitch - tonic))} in ${tonicName} ${major ? 'major' : 'minor'} pentatonic${chordNotes.includes(activeNote) ? ' and a note in its tonic triad' : ''}.`
      : `${chordNotes[0].name}, ${chordNotes[1].name} and ${chordNotes[2].name} form the ${tonicName} ${major ? 'major' : 'minor'} triad.`}</p>
    <div className="lab-choices">
      <AudioButton pitches={chordNotes.map(({ pitch }) => 48 + tonic + pitchClass(pitch - tonic))} together label="Hear triad" />
      {overlap && !tonesOnly && <AudioButton pitches={crossing.map(pitchAt)} label="Hear the crossing" />}
      {active && <AudioButton pitches={[pitchAt(active)]} label="Hear note" />}
    </div>
    {overlap && !tonesOnly && <p className="lab-instruction">Try {crossing.map(({ fret }) => fret).join('–')} on the {STRINGS[crossingString].name} string. The middle fret belongs to both positions.</p>}
  </div>
}
