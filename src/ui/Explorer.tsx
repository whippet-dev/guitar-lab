import { useState } from 'react'
import { CircleHelp, Guitar } from 'lucide-react'
import { Fretboard, toneKind } from './Fretboard'
import { FretboardPractice } from './FretboardPractice'
import { AudioButton } from './AudioButton'
import { ScalePlayback } from './ScalePlayback'
import { degreeSymbol, INTERVALS, intervalFrom, intervalNote, noteName, octaveOf, pitchAt, pitchClass, positionName, SCALES, scaleNotes, scaleSteps, type Position, type ScaleKind, type Spelling } from '../music/theory'
import { scalePath } from '../music/guitarShapes'
import { tonicTriadKind, TRIADS } from '../music/harmony'

const MODES = ['Notes', 'Scales', 'Intervals', 'Practice'] as const
type Mode = typeof MODES[number]
const RANGES = [[0, 5], [0, 12], [6, 12], [13, 18], [19, 24], [0, 24]] as const
const scaleLabels = ['Notes', 'Scale degrees'] as const
const roleNames = { root: 'Tonic', third: 'Third', fifth: 'Perfect fifth' }

function scaleNoteDetail(name: string, tonic: string, semitones: number, hasTriad: boolean) {
  if (semitones === 0) return `${name} is the tonic, the home note. The scale starts again here in each octave.`
  const distance = `${name} is ${semitones} ${semitones === 1 ? 'semitone' : 'semitones'} above ${tonic} within one octave.`
  switch (semitones) {
    case 3: return `${distance} This minor third gives the scale its minor sound.`
    case 4: return `${distance} This major third gives the scale its major sound.`
    case 7: return hasTriad ? `${distance} It completes the triad with the tonic and third.` : distance
    case 10: return `${distance} Try moving up a whole step to the tonic.`
    case 11: return `${distance} The next tonic is just a semitone away. This is called the leading note.`
    default: return distance
  }
}

export function Explorer() {
  const [mode, setMode] = useState<Mode>('Notes')
  const [root, setRoot] = useState(9)
  const [kind, setKind] = useState<ScaleKind>('minorPentatonic')
  const [scaleLabel, setScaleLabel] = useState<(typeof scaleLabels)[number]>('Notes')
  const [spelling, setSpelling] = useState<Spelling>('common')
  const [range, setRange] = useState(0)
  const [selected, setSelected] = useState<Position | null>(null)
  const [sounding, setSounding] = useState<Position | null>(null)
  const scale = scaleNotes(root, kind, spelling).map((note) => {
    const interval = intervalFrom(root, note.pitch)
    return { ...note, interval, symbol: degreeSymbol(note.degree, interval.semitones), role: toneKind(note.degree, interval.semitones) }
  })
  const triad = tonicTriadKind(SCALES[kind])
  const triadNotes = triad ? scale.filter(({ degree }) => degree === 1 || degree === 3 || degree === 5) : []
  const steps = scaleSteps(kind)
  const hasLargerSteps = steps.some((step) => step > 2)
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
    if (mode === 'Intervals') {
      const { symbol, semitones } = intervalFrom(root, pc)
      return { label: symbol, kind: toneKind(INTERVALS[semitones][2], semitones) }
    }
    const match = scale.find((note) => note.pitch === pc)
    return match ? {
      label: scaleLabel === 'Notes' ? match.name : match.symbol,
      kind: match.role,
      spokenLabel: `${positionName(position)}, ${match.name}, ${match.role === 'root' ? 'tonic' : match.interval.name.toLowerCase()} (${match.symbol})`,
    } : undefined
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
          {mode === 'Scales' && <div className="scale-toolbar">
            <div className="segmented scale-labels" role="group" aria-label="Scale fretboard labels">
              {scaleLabels.map((label) => <button key={label} type="button" aria-pressed={scaleLabel === label} onClick={() => setScaleLabel(label)}>{label}</button>)}
            </div>
            <ScalePlayback key={`${root}-${kind}-${range}`} path={scalePath(root, kind, RANGES[range])} onPosition={setSounding} />
            <ul className="scale-legend" aria-label="Highlighted scale degrees">
              {scale.map(({ role, symbol }) => role && <li key={symbol}><span className={`fret-note ${role}`}>{symbol}</span>{roleNames[role]}</li>)}
            </ul>
          </div>}
          {mode === 'Intervals' && <p className="explorer-guide">An <strong>interval</strong> is the distance between two pitches. Here the starting note {rootName} is marked 1. The labels repeat in each octave, so you can find the same relationship anywhere on the neck.</p>}
          <div className="board-caption"><span>Standard tuning</span><span aria-label="Thickest to thinnest, E, A, D, G, B, E">E A D G B E</span></div>
          <Fretboard key={range} range={RANGES[range]} selected={selected} sounding={sounding} reveal={sounding} onSelect={setSelected} marker={marker} />
          <div className="explorer-result">
            <div aria-live="polite" className={selectedScaleNote && mode === 'Scales' ? 'scale-selection' : undefined}>
              {selected && pitch !== null ? <>
                <strong>{selectedName}<sub>{octaveOf(pitch, selectedName)}</sub></strong>
                {mode === 'Scales' && selectedScaleNote ? <>
                  <span className="scale-interval">{selectedScaleNote.role === 'root' ? 'Tonic' : selectedScaleNote.interval.name} ({selectedScaleNote.symbol})</span>
                  <span>{positionName(selected)}</span>
                  <p>{scaleNoteDetail(selectedName, rootName, selectedScaleNote.interval.semitones, !!triad)}</p>
                </> : <span>{positionName(selected)}{selectedInterval && ` · ${selectedInterval.name}`}{mode === 'Scales' && ' · Outside this scale'}</span>}
              </> : <span>{mode === 'Scales' ? 'Tap a highlighted note to see how it relates to the tonic.' : 'Select a position to see its pitch and hear it.'}</span>}
            </div>
            {pitch !== null && <AudioButton pitches={[pitch]} label="Hear note" />}
          </div>
          {mode === 'Notes' && <details className="explanation">
            <summary><CircleHelp size={17} /> Why do some notes have two names?</summary>
            <p>A pitch is a particular highness or lowness of sound. Low E is E2 and high E is E4. They are different pitches in the same pitch class, E.</p>
            <p>A sharp raises a note by a semitone and a flat lowers it by a semitone. F♯ and G♭ are enharmonic names for the same pitch on this equal-tempered fretboard. A scale or chord determines which name makes sense on the page.</p>
          </details>}
          {mode === 'Scales' && <>
            <div className="scale-summary">
              <h2>{rootName} {SCALES[kind].label.toLowerCase()}</h2>
              <ul className="scale-strip" aria-label="Notes and degrees in this scale">
                {scale.map(({ pitch: pc, name, role, symbol }) => <li key={pc} aria-current={selectedScaleNote?.pitch === pc ? 'true' : undefined}>
                  <span aria-label={`Degree ${symbol}`}>{symbol}</span><strong className={`fret-note${role ? ` ${role}` : ''}`}>{name}</strong>
                </li>)}
              </ul>
              <p className="scale-steps">{hasLargerSteps ? 'Steps in semitones' : 'Step pattern'} <strong>{steps.map((step) => hasLargerSteps ? step : step === 2 ? 'W' : 'H').join('–')}</strong></p>
              {triad && <div className="scale-triad">
                <p><strong>{triadNotes[0].name}, {triadNotes[1].name} and {triadNotes[2].name}</strong> form the {rootName} {TRIADS[triad].label} triad.</p>
                <AudioButton pitches={triadNotes.map(({ interval }) => 48 + root + interval.semitones)} together label="Hear triad" />
              </div>}
              {hasLargerSteps && <a className="back-link" href="#learn/pentatonic">Connect pentatonic positions</a>}
            </div>
            <details className="explanation">
              <summary><CircleHelp size={17} /> How do the scale options differ?</summary>
              <p><strong>Hear scale</strong> plays the notes in your chosen fret range, from low to high. The highlight follows one route from the thicker strings towards the thinner ones, favouring small shifts when a pitch is available in several places.</p>
              <p>A scale is an ordered pattern of pitches. The steps above measure the gaps between its notes, including the last step back to the tonic an octave higher. W is a whole step (two semitones) and H is a half step (one semitone).</p>
              <p>Major and natural minor each use seven notes. Pentatonic means five notes. Major pentatonic leaves out 4 and 7 from the major scale. Minor pentatonic leaves out 2 and ♭6 from natural minor. Both have some gaps of three semitones.</p>
              <p>Scale degrees describe intervals from the tonic. A ♭3 is a third one semitone lower than in the major scale on the same tonic. C is the second note of A minor pentatonic, but its degree is still ♭3.</p>
              <p>A triad is a three-note chord. In these scales, you can build one on the tonic using degree 1, the third and the perfect fifth. Try hearing the triad, then listen to an individual scale note.</p>
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
