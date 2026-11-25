import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { playGroups } from '../music/audio'
import { pitchAt, type Position } from '../music/theory'

const gap = 0.34

export function ScalePlayback({ path, onPosition }: { path: Position[]; onPosition: (position: Position | null) => void }) {
  const [playing, setPlaying] = useState(false)
  const [notice, setNotice] = useState('')
  const request = useRef<AbortController>(undefined)
  const frame = useRef(0)

  useEffect(() => () => {
    request.current?.abort()
    cancelAnimationFrame(frame.current)
    onPosition(null)
  }, [onPosition])

  function stop() {
    request.current?.abort()
    cancelAnimationFrame(frame.current)
    onPosition(null)
    setPlaying(false)
    setNotice('')
  }

  async function play() {
    const controller = new AbortController()
    request.current = controller
    setPlaying(true)
    setNotice('')
    try {
      const result = await playGroups(path.map((position) => [pitchAt(position)]), gap, {
        signal: controller.signal,
        onStart(elapsed) {
          let previous = -1
          function follow() {
            const time = elapsed()
            if (time === undefined || time >= path.length * gap) { stop(); return }
            const index = Math.floor(time / gap)
            if (index >= 0 && index !== previous) {
              previous = index
              onPosition(path[index])
            }
            frame.current = requestAnimationFrame(follow)
          }
          frame.current = requestAnimationFrame(follow)
        },
      })
      if (controller.signal.aborted) return
      if (result === 'cancelled') stop()
      if (result === 'fallback') setNotice('Playing the reference tone.')
    } catch {
      if (controller.signal.aborted) return
      stop()
      setNotice(typeof AudioContext === 'undefined' ? 'Audio is unavailable in this browser.' : 'Audio could not start. Tap again to retry.')
    }
  }

  return <div className="audio-control">
    <button className="button button-secondary" type="button" onClick={playing ? stop : play} disabled={!path.length}>
      {playing ? <><Square size={17} />Stop scale</> : <><Volume2 size={17} />Hear scale</>}
    </button>
    {notice && <span role="status" className="muted">{notice}</span>}
  </div>
}
