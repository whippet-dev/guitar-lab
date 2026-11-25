import { useState } from 'react'
import { chordsInMajorKey } from '../music/progression'
import { noteName, pitchAt, pitchClass, samePosition, scaleNotes, type Position } from '../music/theory'
import { AudioButton } from './AudioButton'
import { Fretboard, toneKind } from './Fretboard'

const ranges = [0, 5] as const
const keys = [48, 43, 50, 53]
const progressions = [
  { label: 'I–IV–V–I', degrees: [0, 3, 4, 0] },
  { label: 'I–V–vi–IV', degrees: [0, 4, 5, 3] },
  { label: 'vi–IV–I–V', degrees: [5, 3, 0, 4] },
]
const roleNames = ['root', 'third', 'fifth']

export function ProgressionLab() {
  const [key, setKey] = useState(keys[0])
  const [pattern, setPattern] = useState(0)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<Position | null>(null)
  const chords = chordsInMajorKey(key)
  const scale = scaleNotes(key, 'major', 'common')
  const progression = progressions[pattern].degrees.map((degree) => chords[degree])
  const chord = progression[step]
  const selectedPitch = selected ? pitchAt(selected) : undefined
  const pitch = selectedPitch === undefined ? undefined : pitchClass(selectedPitch)
  const selectedRole = chord.notes.findIndex((note) => note.pitch === pitch)
  const keyNote = scale.find((note) => note.pitch === pitch)
  const topChordPitch = chord.pitches[chord.pitches.length - 1]
  const leadPitch = selectedPitch === undefined ? undefined : selectedPitch + 12 * Math.max(0, Math.floor((topChordPitch - selectedPitch) / 12) + 1)

  return <div className="music-lab" aria-label="Chord changes workshop">
    <div className="lab-controls">
      <label className="lab-select">Key<select value={key} onChange={(event) => { setKey(Number(event.target.value)); setStep(0); setSelected(null) }}>
        {keys.map((root) => <option key={root} value={root}>{noteName(root)} major</option>)}
      </select></label>
      <label className="lab-select">Progression<select value={pattern} onChange={(event) => { setPattern(Number(event.target.value)); setStep(0) }}>
        {progressions.map(({ label }, index) => <option key={label} value={index}>{label}</option>)}
      </select></label>
      <AudioButton groups={progression.map(({ pitches }) => pitches)} gap={1.12} label="Hear the progression" />
    </div>
    <div className="lab-progression" role="group" aria-label="Chords in the progression">
      {progression.map(({ numeral, label, rootName, kind }, index) => <button className="button button-secondary" type="button"
        key={index} aria-label={`${label}, chord ${index + 1}`} aria-pressed={index === step} onClick={() => setStep(index)}>
        <small>{numeral}</small><strong>{rootName}{kind === 'minor' ? 'm' : ''}</strong>
      </button>)}
    </div>
    <div className="lab-result">
      <p className="lab-instruction">Lavender marks the chord root, teal the third and amber the perfect fifth.</p>
      <AudioButton pitches={chord.pitches} together label="Hear this chord" />
    </div>
    <Fretboard range={ranges} selected={selected} onSelect={setSelected} marker={(position) => {
      const midi = pitchAt(position)
      const pc = pitchClass(midi)
      const memberIndex = chord.notes.findIndex((note) => note.pitch === pc)
      if (memberIndex >= 0) return { label: chord.notes[memberIndex].name, kind: toneKind(1 + memberIndex * 2, chord.pitches[memberIndex] - chord.pitches[0]) }
      const inKey = scale.find((note) => note.pitch === pc)
      if (inKey || samePosition(selected, position)) return { label: inKey?.name ?? noteName(midi, 'common') }
    }} />
    <div className="lab-result">
      <p role="status"><strong>{chord.label}</strong> · {selectedPitch === undefined ? `${chord.notes.map(({ name }) => name).join(', ')} are the chord tones. Tap a note to hear how it fits.`
        : selectedRole >= 0 ? `${chord.notes[selectedRole].name} is the ${roleNames[selectedRole]} of this chord.`
        : keyNote ? `${keyNote.name} is in the key, outside this chord. Hear how it sounds, then try moving it to a chord tone.`
        : `${noteName(selectedPitch, 'common')} is outside this key. Compare its colour with a nearby note in the key.`}</p>
      {leadPitch !== undefined && <AudioButton pitches={[...chord.pitches, leadPitch]} together label="Hear your note over the chord" />}
    </div>
    {leadPitch !== undefined && leadPitch !== selectedPitch && <p className="lab-instruction">Playback lifts your note by octaves so you can hear it above the chord.</p>}
    <a className="back-link" href="#learn/phrasing">Try these ideas in a phrase</a>
  </div>
}
