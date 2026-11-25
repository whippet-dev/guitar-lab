import { useState } from 'react'
import { degreeSymbol, INTERVALS, intervalNote, noteName, pitchAt, samePosition, SCALES, scaleNotes, scaleSteps, spellDegree, STRINGS, type Position, type StringIndex } from '../music/theory'
import { AudioButton } from './AudioButton'
import { Fretboard, toneKind } from './Fretboard'

const intervalRange = [0, 7] as const
const intervalRoots: readonly Position[] = [{ string: 4, fret: 3 }, { string: 5, fret: 5 }]
const intervalChoices = [3, 4, 6, 7, 12]

function intervalName(distance: number) {
  return distance === 0 ? 'Unison' : distance === 12 ? 'Octave' : INTERVALS[distance][1]
}

export function IntervalLab() {
  const [rootIndex, setRootIndex] = useState(0)
  const [distance, setDistance] = useState(4)
  const [asFifth, setAsFifth] = useState(false)
  const [selected, setSelected] = useState<Position>()
  const [message, setMessage] = useState('')
  const root = intervalRoots[rootIndex]
  const rootPitch = pitchAt(root)
  const target = rootPitch + distance
  const targetName = intervalNote(rootPitch, distance, 'common', asFifth).name
  const targetKind = toneKind(distance === 12 ? 8 : INTERVALS[distance][2], distance) ?? 'target'
  const positions = STRINGS.flatMap(({ midi }, string) => {
    const fret = target - midi
    return fret >= intervalRange[0] && fret <= intervalRange[1] ? [{ string: string as StringIndex, fret }] : []
  })
  const nearby = positions.sort((a, b) => Math.abs(a.fret - root.fret) - Math.abs(b.fret - root.fret))[0]
  const note = selected ?? nearby

  function pick(position: Position) {
    const interval = pitchAt(position) - rootPitch
    if (interval < 0 || interval > 12) {
      setMessage('Try a note from the starting pitch up to one octave higher.')
      return
    }
    setSelected(position)
    setDistance(interval)
    setMessage('')
  }

  return <div className="music-lab" aria-label="Interval demonstration">
    <div className="lab-controls">
      <label className="lab-select">Starting note<select value={rootIndex} onChange={(event) => { setRootIndex(Number(event.target.value)); setSelected(undefined); setMessage('') }}>
        {intervalRoots.map((position, index) => <option key={index} value={index}>{noteName(pitchAt(position))}</option>)}
      </select></label>
      <div className="lab-choices" role="group" aria-label="Interval">
        {intervalChoices.map((choice) => <button className="button button-secondary" key={choice} type="button" aria-pressed={distance === choice}
          onClick={() => { setDistance(choice); setSelected(undefined); setMessage('') }}>{intervalName(choice)}</button>)}
      </div>
    </div>
    <div className="lab-choices">
      <AudioButton pitches={[rootPitch, target]} label="Hear the interval" />
      {distance === 6 && <label className="lab-select">Tritone spelling<select value={asFifth ? 'fifth' : 'fourth'} onChange={(event) => setAsFifth(event.target.value === 'fifth')}>
        <option value="fourth">Augmented fourth</option><option value="fifth">Diminished fifth</option>
      </select></label>}
    </div>
    <Fretboard range={intervalRange} selected={note} reveal={note} onSelect={pick}
      marker={(position) => samePosition(root, position) ? { label: noteName(rootPitch), kind: 'root' }
        : samePosition(note, position) ? { label: targetName, kind: targetKind } : undefined} />
    <div className="lab-result">
      <p role="status">{message || <><strong>{intervalName(distance)}</strong> · {distance} {distance === 1 ? 'semitone' : 'semitones'}</>}</p>
    </div>
    {distance === 6 && <p className="lab-instruction">{noteName(rootPitch)} to {targetName} is {asFifth ? 'a diminished fifth' : 'an augmented fourth'}. Both spellings use the same fret and sound the same here. Count the note letters to see why the interval names differ.</p>}
  </div>
}

const dString = 3
const openD = STRINGS[dString].midi
const scaleRange = [0, 12] as const

export function ScaleLab() {
  const [kind, setKind] = useState<'major' | 'minor'>('major')
  const [path, setPath] = useState([0])
  const [trial, setTrial] = useState<Position>()
  const notes = [...scaleNotes(openD, kind), spellDegree(openD, 8, 12)]
  const steps = [...SCALES[kind].semitones, 12]
  const gaps = scaleSteps(kind)
  const last = path[path.length - 1]
  const complete = last === 12
  const selected = { string: dString, fret: last } as const
  const travelled = path.length > 1 ? { from: { string: dString, fret: path[path.length - 2] } as const, to: selected } : undefined
  const nextGap = gaps[path.length - 1]

  function addStep(position: Position) {
    if (complete) return
    if (position.string === dString && position.fret === steps[path.length]) {
      setPath([...path, position.fret])
      setTrial(undefined)
    } else {
      setTrial(position)
    }
  }

  function restart(next = kind) {
    setKind(next)
    setPath([0])
    setTrial(undefined)
  }

  return <div className="music-lab" aria-label="Scale builder">
    <div className="lab-choices" role="group" aria-label="Scale to build">
      <button className="button button-secondary" type="button" aria-pressed={kind === 'major'} onClick={() => { if (kind !== 'major') restart('major') }}>D major</button>
      <button className="button button-secondary" type="button" aria-pressed={kind === 'minor'} onClick={() => { if (kind !== 'minor') restart('minor') }}>D natural minor</button>
    </div>
    <p className="lab-instruction"><strong>W</strong> is a whole step (tone), two semitones or two frets on one string. <strong>H</strong> is a half step (semitone), one fret.</p>
    <div className="scale-map">
      <div className="scale-pattern" aria-label="Step pattern">
        {gaps.map((gap, index) => <span key={index} className={index < path.length - 1 ? 'is-filled' : ''} aria-current={index === path.length - 1 ? 'step' : undefined}>{gap === 2 ? 'W' : 'H'}</span>)}
      </div>
      <div className="lab-sequence" aria-label="Scale notes so far">
        {notes.map(({ name, degree }, index) => <span key={index} className={index < path.length ? `is-filled ${toneKind(degree, steps[index]) ?? ''}` : ''}>
          <small aria-label={`Degree ${degreeSymbol(degree, steps[index])}`}>{degreeSymbol(degree, steps[index])}</small>
          <strong className="scale-note-name">{index < path.length ? name : '·'}</strong>
        </span>)}
      </div>
    </div>
    <div className="lab-choices" role="group" aria-label="Add a scale step">
      {[1, 2].map((size) => <button className="button button-secondary" type="button" key={size} disabled={complete || last + size > 12}
        onClick={() => addStep({ string: dString, fret: last + size })}>Add {size} {size === 1 ? 'fret' : 'frets'}</button>)}
      <button className="button button-quiet" type="button" disabled={path.length === 1 && !trial} onClick={() => restart()}>Start again</button>
    </div>
    <div className="lab-result">
      <p role="status">{trial ? (trial.string !== dString ? 'Build the scale along the D string so you can see each gap.' : `That takes you to fret ${trial.fret}. From fret ${last}, try the ${nextGap === 1 ? 'one-fret' : 'two-fret'} step.`)
        : complete ? `You’ve built D ${kind === 'major' ? 'major' : 'natural minor'}. Listen, then try the other pattern.`
        : <>{notes[path.length - 1].name} · degree {degreeSymbol(path.length, last)} · fret {last}. Next is <strong>{nextGap === 1 ? 'H · one fret' : 'W · two frets'}</strong>.</>}</p>
    </div>
    <Fretboard range={scaleRange} guideString={dString} selected={selected} travelled={travelled} reveal={selected} onSelect={addStep} locked={complete}
      marker={(position) => {
        if (position.string !== dString) return undefined
        const index = path.indexOf(position.fret)
        return index >= 0 ? { label: notes[index].name, kind: toneKind(notes[index].degree, steps[index]) } : undefined
      }} />
    <div className="lab-choices"><AudioButton pitches={path.map((fret) => openD + fret)} label={complete ? 'Hear the scale' : 'Hear notes so far'} /></div>
  </div>
}
