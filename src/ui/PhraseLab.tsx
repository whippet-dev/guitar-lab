import { useEffect, useRef, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { secondsPerQuaver, slotName } from '../learning/rhythm'
import { playTimedNotes } from '../music/audio'
import { BACKINGS, BAR_SLOTS, MELODIES, phraseVoices } from '../music/phrasing'
import { pitchAt, pitchClass, positionName, scaleNotes, type Position } from '../music/theory'
import { Fretboard, toneKind } from './Fretboard'

const notes = scaleNotes(0, 'major', 'common')
const beats = [0, 2, 4, 6]
const roleNames = ['root', 'third', 'fifth']

export function PhraseLab() {
  const [example, setExample] = useState(0)
  const [melody, setMelody] = useState([...MELODIES[0].slots])
  const [backingIndex, setBackingIndex] = useState(0)
  const [withChords, setWithChords] = useState(true)
  const [tempo, setTempo] = useState(80)
  const [slot, setSlot] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const [audioStatus, setAudioStatus] = useState<'silent' | 'fallback'>()
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const playRequest = useRef<AbortController>(undefined)
  const showing = active ?? slot
  const bar = Math.floor(showing / BAR_SLOTS)
  const backing = BACKINGS[backingIndex]
  const chord = backing[bar]
  const chosen = melody[showing]
  const chosenPitch = chosen ? pitchClass(pitchAt(chosen)) : undefined
  const chosenNote = notes.find(({ pitch }) => pitch === chosenPitch)
  const chordRole = chord.notes.findIndex(({ pitch }) => pitch === chosenPitch)

  useEffect(() => {
    function onVisibility() {
      if (!document.hidden) return
      playRequest.current?.abort()
      clearInterval(timer.current)
      setActive(null)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      playRequest.current?.abort()
      clearInterval(timer.current)
    }
  }, [])

  function stop() {
    playRequest.current?.abort()
    clearInterval(timer.current)
    setActive(null)
  }

  function edit(position: Position | null) {
    if (position && (pitchAt(position) < 60 || !notes.some(({ pitch }) => pitch === pitchClass(pitchAt(position))))) return
    stop()
    setMelody(melody.map((note, index) => index === showing ? position : note))
    setSlot(showing)
  }

  async function play() {
    const request = new AbortController()
    playRequest.current = request
    const quaver = secondsPerQuaver(tempo)
    setActive(0)
    try {
      const result = await playTimedNotes(phraseVoices(melody, backing, quaver, withChords), { signal: request.signal })
      if (request.signal.aborted) return
      if (result === 'cancelled') { setActive(null); return }
      setAudioStatus(result === 'fallback' ? 'fallback' : undefined)
    } catch {
      if (!request.signal.aborted) setAudioStatus('silent')
    }
    if (request.signal.aborted) return
    const start = performance.now()
    timer.current = setInterval(() => {
      const current = Math.floor((performance.now() - start) / (quaver * 1000))
      if (current >= BAR_SLOTS * 2) stop()
      else setActive(current)
    }, 25)
  }

  return <div className="music-lab" aria-label="Lead phrase workshop">
    <div className="lab-controls">
      <label className="lab-select">Starting idea<select value={example} onChange={(event) => {
        const index = Number(event.target.value)
        stop(); setExample(index); setMelody([...MELODIES[index].slots]); setSlot(0)
      }}>{MELODIES.map(({ label }, index) => <option key={label} value={index}>{label}</option>)}</select></label>
      <label className="lab-select">Chord changes<select value={backingIndex} onChange={(event) => { stop(); setBackingIndex(Number(event.target.value)) }}>
        {BACKINGS.map((pair, index) => <option key={index} value={index}>{pair.map(({ label }) => label).join(' → ')}</option>)}
      </select></label>
      <label className="lab-select">Tempo<select value={tempo} onChange={(event) => { stop(); setTempo(Number(event.target.value)) }}>
        {[60, 80, 100].map((speed) => <option key={speed} value={speed}>{speed} BPM</option>)}
      </select></label>
    </div>
    <p className="lab-instruction">{MELODIES[example].detail}</p>
    <div className="lab-choices" role="group" aria-label="Bars of the phrase">
      {backing.map(({ label }, index) => <button key={label} type="button" className="button button-secondary" aria-pressed={bar === index}
        onClick={() => { stop(); setSlot(index * BAR_SLOTS) }}>Bar {index + 1} · {label}</button>)}
    </div>
    <div className="rhythm-grid phrase-grid" role="group" aria-label={`Quavers of bar ${bar + 1}`}>
      {beats.map((beat) => <div className="rhythm-beat" key={beat}>{[beat, beat + 1].map((offset) => {
        const index = bar * BAR_SLOTS + offset
        const position = melody[index]
        const noteName = position ? notes.find(({ pitch }) => pitch === pitchClass(pitchAt(position)))?.name : undefined
        return <button key={offset} type="button" className={`button rhythm-pad${active === index ? ' is-current' : ''}`} aria-pressed={showing === index}
          aria-label={`${slotName(offset)}, ${noteName ?? 'rest'}`} onClick={() => { stop(); setSlot(index) }}>
          <small>{offset % 2 === 0 ? offset / 2 + 1 : '&'}</small><strong>{noteName ?? '·'}</strong>
        </button>
      })}</div>)}
    </div>
    <div className="lab-choices">
      <button type="button" className="button button-primary" onClick={active === null ? () => { void play() } : stop}>
        {active === null ? <><Play size={17} />Play phrase</> : <><Square size={15} />Stop</>}
      </button>
      <button type="button" className="button button-secondary" aria-pressed={withChords} onClick={() => { stop(); setWithChords(!withChords) }}>Backing chords</button>
      <button type="button" className="button button-quiet" disabled={!chosen} onClick={() => edit(null)}>Make this a rest</button>
    </div>
    {audioStatus === 'silent' && <p className="lab-instruction">Audio is unavailable here. The highlighted beat still follows the phrase.</p>}
    {audioStatus === 'fallback' && <p className="lab-instruction">Playing the reference tone.</p>}
    <p className="lab-instruction" aria-live={active === null ? 'polite' : 'off'}>{chosenNote ? <>
      <strong>{chosenNote.name}</strong> {chordRole >= 0 ? `is the ${roleNames[chordRole]} of ${chord.label}. Try it as a landing note.`
        : `lies outside ${chord.label}. Hear the colour it adds, then try moving to one of the outlined chord tones.`}
    </> : 'Choose a beat, then tap a note on the fretboard or leave the space empty.'}</p>
    <Fretboard range={[0, 5]} selected={chosen} onSelect={edit} marker={(position) => {
      if (pitchAt(position) < 60) return undefined
      const pc = pitchClass(pitchAt(position))
      const note = notes.find(({ pitch }) => pitch === pc)
      if (!note) return undefined
      const role = chord.notes.findIndex(({ pitch }) => pitch === pc)
      return { label: note.name, kind: role >= 0 ? toneKind(role * 2 + 1, pitchClass(pc - chord.pitches[0])) : undefined,
        spokenLabel: `${positionName(position)}, ${note.name}${role >= 0 ? `, ${roleNames[role]} of ${chord.label}` : ''}` }
    }} />
    <a className="back-link" href="#learn/phrase-ear">Listen for where a phrase lands</a>
  </div>
}
