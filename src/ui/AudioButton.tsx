import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { playPitches } from '../music/audio'

export function AudioButton({ pitches, label }: { pitches: readonly number[]; label: string }) {
  const [unavailable, setUnavailable] = useState(false)

  async function play() {
    try {
      await playPitches(pitches)
      setUnavailable(false)
    } catch {
      setUnavailable(true)
    }
  }

  return (
    <div className="audio-control">
      <button className="button button-secondary" type="button" onClick={play}><Volume2 size={17} />{label}</button>
      {unavailable && <span role="status" className="muted">Audio is unavailable in this browser.</span>}
    </div>
  )
}
