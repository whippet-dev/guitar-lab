import { useState } from 'react'
import { CircleHelp, Guitar } from 'lucide-react'
import { Fretboard } from './Fretboard'
import { FretboardPractice } from './FretboardPractice'
import { AudioButton } from './AudioButton'
import { intervalFrom, noteName, octaveOf, pitchAt, pitchClass, positionName, SCALES, scaleNotes, type Position, type ScaleKind, type Spelling } from '../music/theory'

const MODES = ['Notes', 'Scales', 'Intervals', 'Practice'] as const
type Mode = typeof MODES[number]
const RANGES = [[0, 5], [0, 12], [6, 12], [13, 18], [19, 24], [0, 24]] as const

export function Explorer() {
  const [mode, setMode] = useState<Mode>('Notes')
  const [root, setRoot] = useState(9)
  const [kind, setKind] = useState<ScaleKind>('minorPentatonic')
  const [spelling, setSpelling] = useState<Spelling>('common')
  const [range, setRange] = useState(0)
  const [selected, setSelected] = useState<Position | null>(null)
  const scale = scaleNotes(root, kind, spelling)
  const rootName = noteName(root, spelling)
  const [firstFret, lastFret] = RANGES[range]
  const pitch = selected ? pitchAt(selected) : null
  const selectedScaleNote = scale.find((note) => pitch !== null && note.pitch === pitchClass(pitch))
  const selectedName = pitch === null ? '' : (mode === 'Scales' && selectedScaleNote?.name) || noteName(pitch, spelling)

  function marker(position: Position) {
    const midi = pitchAt(position)
    const pc = pitchClass(midi)
    if (mode === 'Notes') return { label: noteName(pc, spelling) }
    const style = pc === root ? 'root' as const : undefined
    if (mode === 'Intervals') return { label: intervalFrom(root, pc).symbol, kind: style }
    const match = scale.find((note) => note.pitch === pc)
    return match ? { label: match.name, kind: style } : undefined
  }

  return (
    <>
      <div className="page-heading">
        <div className="eyebrow"><Guitar size={17} /> Playable reference</div>
        <h1 tabIndex={-1}>Fretboard explorer</h1>
        <p>See how notes, scales and intervals fit together across the neck.</p>
      </div>
      <section className={`panel explorer-panel${mode === 'Practice' ? ' is-practising' : ''}`} aria-label="Explore the guitar neck">
        <div className="explorer-controls">
          <div className="segmented" role="group" aria-label="Fretboard display">
            {MODES.map((option) => <button key={option} type="button" aria-pressed={mode === option} onClick={() => setMode(option)}>{option}</button>)}
          </div>
          <div className="select-controls">
            {(mode === 'Scales' || mode === 'Intervals') && <label>Root<select value={root} onChange={(event) => setRoot(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, pc) => <option key={pc} value={pc}>{noteName(pc, spelling)}</option>)}
            </select></label>}
            {mode === 'Scales' && <label>Scale<select value={kind} onChange={(event) => setKind(event.target.value as ScaleKind)}>
              {Object.entries(SCALES).map(([value, scale]) => <option value={value} key={value}>{scale.label}</option>)}
            </select></label>}
            <label>Note names<select value={spelling} onChange={(event) => setSpelling(event.target.value as Spelling)}>
              <option value="common">Common ♯ / ♭</option><option value="sharps">Sharps ♯</option><option value="flats">Flats ♭</option>
            </select></label>
            <label>Fret range<select value={range} onChange={(event) => { setRange(Number(event.target.value)); setSelected(null) }}>
              {RANGES.map(([first, last], index) => <option key={first + '-' + last} value={index}>{index === RANGES.length - 1 ? 'All frets (0–24)' : `${first}–${last}`}</option>)}
            </select></label>
          </div>
        </div>
        {mode === 'Practice' ? <FretboardPractice key={range} range={RANGES[range]} spelling={spelling} /> : <>
          {mode === 'Scales' && <p className="explorer-guide">A <strong>scale</strong> is a set of notes arranged from low to high. The <strong>root</strong> is its home note, marked with a lavender outline. Choose a <strong>scale</strong> to change which notes light up. Major and natural minor use seven notes. Pentatonic scales use five.</p>}
          {mode === 'Intervals' && <p className="explorer-guide">An <strong>interval</strong> is the distance between two notes. Choose a <strong>root</strong> as your starting note, shown as 1. Tap another position to see its interval from {rootName} within one octave.</p>}
          <div className="board-caption"><span>Standard tuning</span><span>E A D G B E</span></div>
          <Fretboard key={range} range={RANGES[range]} selected={selected} onSelect={setSelected} marker={marker} />
          <div className="explorer-result">
            <div aria-live="polite">
              {selected && pitch !== null ? <>
                <strong>{selectedName}<sub>{octaveOf(pitch, selectedName)}</sub></strong>
                <span>{positionName(selected)}{mode === 'Intervals' && ` · ${intervalFrom(root, pitch).name}`}{mode === 'Scales' && ` · ${selectedScaleNote ? `Degree ${selectedScaleNote.degree}` : 'Outside this scale'}`}</span>
              </> : <span>Select a position to see its pitch and hear it.</span>}
            </div>
            {pitch !== null && <AudioButton pitches={[pitch]} label="Hear note" />}
          </div>
          {mode === 'Scales' && <>
            <div className="scale-strip" aria-label="Notes in this scale">{scale.map((note) => <span className={note.degree === 1 ? 'scale-root' : ''} key={note.pitch}>{note.name}</span>)}</div>
            <details className="explanation">
              <summary><CircleHelp size={17} /> How do the scale options differ?</summary>
              <p>Major and natural minor each use seven notes. The gaps between those notes are different, which gives each scale its sound. Pentatonic means five notes. Each pentatonic scale takes five notes from its seven-note version.</p>
              <p>A degree is a note’s place in the seven-note scale, counting the root as 1. The pentatonic versions keep the degree numbers of the notes they use.</p>
              <p>Use <strong>Note names</strong> to choose how to write the root, such as F♯ or G♭. The rest of the scale is spelled to fit that root.</p>
            </details>
          </>}
          {mode === 'Intervals' && <p className="board-footnote"><strong>How to read the numbers.</strong> A 5 is a perfect fifth, seven frets above the root on the same string. A ♭3 is a minor third, one fret smaller than a 3 (major third).</p>}
        </>}
        {lastFret - firstFret > 6 && <p className="board-footnote">{mode === 'Practice'
          ? 'Swipe or scroll to a different part of the neck, then tap Next note to practise there.'
          : 'Swipe or scroll sideways to reach any frets off screen.'}</p>}
      </section>
    </>
  )
}
