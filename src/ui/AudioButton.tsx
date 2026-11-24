import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { playGroups, playPitches } from '../music/audio'

type Playback = { pitches: readonly number[]; together?: boolean } | { groups: readonly (readonly number[])[]; gap?: number }

export function AudioButton({ label, ...playback }: { label: string } & Playback) {
  const [unavailable, setUnavailable] = useState(false)

  async function play() {
    try {
      if ('groups' in playback) await playGroups(playback.groups, playback.gap)
      else await playPitches(playback.pitches, playback.together)
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
