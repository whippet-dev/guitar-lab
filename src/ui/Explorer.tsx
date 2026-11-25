import { useState } from 'react'
import { CircleHelp, Guitar } from 'lucide-react'
import { Fretboard } from './Fretboard'
import { FretboardPractice } from './FretboardPractice'
import { AudioButton } from './AudioButton'
import { degreeSymbol, intervalFrom, intervalNote, noteName, octaveOf, pitchAt, pitchClass, positionName, SCALES, scaleNotes, type Position, type ScaleKind, type Spelling } from '../music/theory'

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
  const selectedInterval = mode === 'Intervals' && pitch !== null ? intervalFrom(root, pitch) : undefined
  const selectedName = pitch === null ? '' : selectedInterval ? intervalNote(root, selectedInterval.semitones, spelling).name
    : (mode === 'Scales' && selectedScaleNote?.name) || noteName(pitch, spelling)

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
            {(mode === 'Scales' || mode === 'Intervals') && <label>{mode === 'Scales' ? 'Tonic' : 'Starting note'}<select value={root} onChange={(event) => setRoot(Number(event.target.value))}>
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
          {mode === 'Scales' && <p className="explorer-guide">A <strong>scale</strong> is an ordered pattern of pitches. The <strong>tonic</strong> is its home note, marked with a lavender outline. Change the scale to see how its pattern puts different notes around the same tonic.</p>}
          {mode === 'Intervals' && <p className="explorer-guide">An <strong>interval</strong> is the distance between two pitches. Here the starting note {rootName} is marked 1. The labels repeat in each octave, so you can find the same relationship anywhere on the neck.</p>}
          <div className="board-caption"><span>Standard tuning</span><span aria-label="Thickest to thinnest, E, A, D, G, B, E">E A D G B E</span></div>
          <Fretboard key={range} range={RANGES[range]} selected={selected} onSelect={setSelected} marker={marker} />
          <div className="explorer-result">
            <div aria-live="polite">
              {selected && pitch !== null ? <>
                <strong>{selectedName}<sub>{octaveOf(pitch, selectedName)}</sub></strong>
                <span>{positionName(selected)}{selectedInterval && ` · ${selectedInterval.name}`}{mode === 'Scales' && ` · ${selectedScaleNote ? `Degree ${degreeSymbol(selectedScaleNote.degree, pitchClass(pitch - root))}` : 'Outside this scale'}`}</span>
              </> : <span>Select a position to see its pitch and hear it.</span>}
            </div>
            {pitch !== null && <AudioButton pitches={[pitch]} label="Hear note" />}
          </div>
          {mode === 'Notes' && <details className="explanation">
            <summary><CircleHelp size={17} /> Why do some notes have two names?</summary>
            <p>A pitch is a particular highness or lowness of sound. Low E is E2 and high E is E4. They are different pitches in the same pitch class, E.</p>
            <p>A sharp raises a note by a semitone and a flat lowers it by a semitone. F♯ and G♭ are enharmonic names for the same pitch on this equal-tempered fretboard. A scale or chord determines which name makes sense on the page.</p>
          </details>}
          {mode === 'Scales' && <>
            <div className="scale-strip" aria-label="Notes in this scale">{scale.map((note) => <span className={note.degree === 1 ? 'scale-root' : ''} key={note.pitch}>{note.name}</span>)}</div>
            <p className="board-footnote">Degree formula {scale.map(({ pitch: pc, degree }) => degreeSymbol(degree, pitchClass(pc - root))).join('–')}</p>
            <details className="explanation">
              <summary><CircleHelp size={17} /> How do the scale options differ?</summary>
              <p>Major and natural minor each use seven notes with different gaps. Pentatonic means five notes. These two pentatonic scales keep five degrees from their corresponding seven-note scales.</p>
              <p>Scale degrees count from the tonic. A ♭3 in the formula means a third one semitone lower than in the major scale on the same tonic. A note with that degree can still have a natural letter name.</p>
              <p>Natural minor is the seven-note minor scale shown here. Harmonic minor raises its seventh. The ascending form of melodic minor raises both its sixth and seventh.</p>
              <p><strong>Note names</strong> lets you choose a tonic spelling such as F♯ or G♭. The scale’s other notes follow that spelling.</p>
            </details>
          </>}
          {mode === 'Intervals' && <p className="board-footnote"><strong>How to read the numbers.</strong> A 5 is a perfect fifth, seven semitones. A ♭3 is a minor third, three semitones. The ♯4 marks a tritone, which can also be written as a diminished fifth (♭5). Tap a position to see the note spelled from the chosen starting note.</p>}
        </>}
        {lastFret - firstFret > 6 && <p className="board-footnote">{mode === 'Practice'
          ? 'Swipe or scroll to a different part of the neck, then tap Next note to practise there.'
          : 'Swipe or scroll sideways to reach any frets off screen.'}</p>}
      </section>
    </>
  )
}
