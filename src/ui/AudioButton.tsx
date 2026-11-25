import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { playGroups, playPitches } from '../music/audio'

type Playback = { pitches: readonly number[]; together?: boolean } | { groups: readonly (readonly number[])[]; gap?: number }

export function AudioButton({ label, reference, strum, ...playback }: { label: string; reference?: boolean; strum?: boolean } & Playback) {
  const [status, setStatus] = useState<'ready' | 'loading' | 'fallback' | 'unavailable'>('ready')
  const active = useRef<AbortController>(undefined)

  useEffect(() => () => active.current?.abort(), [])

  async function play() {
    active.current?.abort()
    const request = new AbortController()
    active.current = request
    setStatus('loading')
    const options = { reference, strum, signal: request.signal }
    try {
      const result = 'groups' in playback ? await playGroups(playback.groups, playback.gap, options)
        : await playPitches(playback.pitches, playback.together, options)
      if (!request.signal.aborted) setStatus(result === 'fallback' ? 'fallback' : 'ready')
    } catch {
      if (!request.signal.aborted) setStatus('unavailable')
    }
  }

  return (
    <div className="audio-control">
      <button className="button button-secondary" type="button" onClick={play} aria-busy={status === 'loading' || undefined}><Volume2 size={17} />{label}</button>
      {status === 'unavailable' && <span role="status" className="muted">Audio is unavailable in this browser.</span>}
      {status === 'fallback' && <span role="status" className="muted">Playing the reference tone.</span>}
    </div>
  )
}
