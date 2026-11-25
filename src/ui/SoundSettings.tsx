import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { stopAudio } from '../music/audio'
import { getInstrument, INSTRUMENTS, setInstrument, type Instrument } from '../music/instruments'
import { AudioButton } from './AudioButton'

export function SoundSettings() {
  const [instrument, selectInstrument] = useState(getInstrument)

  return <section className="panel lesson-panel learning-layout" aria-labelledby="sound-heading">
    <div className="eyebrow"><Volume2 size={17} /> Playback</div>
    <h1 id="sound-heading" tabIndex={-1}>Sound settings</h1>
    <p className="teaching-copy">Choose the sound you hear in lessons and on the fretboard. Pitch-matching checks use the same pure tone for every note.</p>
    <div className="lab-controls">
      <label className="lab-select">Instrument<select value={instrument} onChange={(event) => {
        const value = event.target.value as Instrument
        stopAudio()
        setInstrument(value)
        selectInstrument(value)
      }}>
        {Object.entries(INSTRUMENTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <AudioButton key={instrument} pitches={[45, 52, 57, 60, 64]} strum together label="Try sound" />
    </div>
    <p className="lab-instruction sound-credit">Guitar recordings from FreePats and Meta Open Sound. <a href="./audio-credits.txt">Recording credits</a></p>
  </section>
}
