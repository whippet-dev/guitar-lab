import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { playGroups } from '../music/audio'
import { rhythmDifference, slotName } from '../learning/rhythm'
import type { RhythmExercise } from '../learning/content'
import type { RhythmResponse } from '../learning/progress'

const beats = [0, 2, 4, 6]
const presets = [{ label: 'On the beats', slots: beats }, { label: 'Between the beats', slots: [1, 3, 5, 7] }, { label: 'A short phrase', slots: [0, 3, 6] }]

type Check = { exercise: RhythmExercise; response?: RhythmResponse; onResponse: (response: RhythmResponse) => void }

export function RhythmLab({ check }: { check?: Check }) {
  const [slots, setSlots] = useState<number[]>(() => check ? (check.response?.slots ?? []) : beats)
  const [tempo, setTempo] = useState(80)
  const [active, setActive] = useState<number | null>(null)
  const [hint, setHint] = useState(false)
  const [silent, setSilent] = useState(false)
  const clock = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const playRequest = useRef(0)
  const response = check?.response
  const finished = !!response && response.result !== 'retry'
  const attempted = response && response.slots.length === slots.length && response.slots.every((slot) => slots.includes(slot))
  const difference = check && rhythmDifference(check.exercise.slots, slots)

  useEffect(() => () => {
    playRequest.current += 1
    clearInterval(clock.current)
  }, [])

  async function play() {
    const request = ++playRequest.current
    clearInterval(clock.current)
    const eighth = 30 / tempo
    const bar = Array.from({ length: 8 }, (_, slot) => [
      ...(slot % 2 === 0 ? [slot === 0 ? 88 : 83] : []),
      ...(slots.includes(slot) ? [50] : []),
    ])
    let unavailable = false
    try {
      await playGroups(bar, eighth, 0.16)
    } catch {
      unavailable = true
    }
    if (request !== playRequest.current) return
    setSilent(unavailable)
    setActive(0)
    const start = performance.now()
    clock.current = setInterval(() => {
      const slot = Math.floor((performance.now() - start) / (eighth * 1000))
      if (slot >= 8) {
        clearInterval(clock.current)
        setActive(null)
      } else {
        setActive(slot)
      }
    }, 25)
  }

  function toggle(slot: number) {
    if (!finished) setSlots(slots.includes(slot) ? slots.filter((value) => value !== slot) : [...slots, slot])
  }

  function submit() {
    if (!check || !difference || finished) return
    const correct = difference.missing === undefined && difference.extra === undefined
    check.onResponse({ result: correct ? 'correct' : 'retry', slots })
  }

  function showAnswer() {
    if (!check || finished) return
    const solution = [...check.exercise.slots]
    setSlots(solution)
    check.onResponse({ result: 'shown', slots: solution })
  }

  return <div className="music-lab" aria-label="Rhythm board">
    {!check ? <div className="lab-choices" role="group" aria-label="Rhythm examples">
      {presets.map((pattern) => <button type="button" className="button button-secondary" key={pattern.label} onClick={() => setSlots(pattern.slots)}>{pattern.label}</button>)}
    </div> : <p className="lab-instruction">Tap a box to place or remove a note. Play the bar whenever you want to hear your pattern.</p>}
    <div className="rhythm-grid" role="group" aria-label="One bar of four beats">
      {beats.map((beat, group) => <div className="rhythm-beat" key={beat}>
        {[beat, beat + 1].map((slot) => <button type="button" key={slot} className={`button rhythm-pad${active === slot ? ' is-current' : ''}`}
          aria-label={slotName(slot)} aria-pressed={slots.includes(slot)} aria-disabled={finished || undefined} onClick={() => toggle(slot)}>
          {slot === beat ? group + 1 : '&'}
        </button>)}
      </div>)}
    </div>
    <div className="lab-controls">
      <label className="lab-select">Tempo<select value={tempo} onChange={(event) => setTempo(Number(event.target.value))}>
        {[60, 80, 100, 120].map((speed) => <option key={speed} value={speed}>{speed} BPM</option>)}
      </select></label>
      <button type="button" className="button button-secondary" onClick={() => { void play() }}><Play size={17} />Play the bar</button>
      {check && !finished && <>
        <button type="button" className="button button-primary" onClick={submit}>Check pattern</button>
        <button type="button" className="button button-secondary" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Get a hint'}</button>
        <button type="button" className="button button-quiet" onClick={showAnswer}>Show answer</button>
      </>}
    </div>
    {hint && !finished && <p className="lab-instruction">{check?.exercise.hint}</p>}
    {silent && <p className="lab-instruction">Audio is unavailable here. Follow the moving beat.</p>}
    {check && <div className="lab-result"><p role="status">{finished ? check.exercise.why
      : attempted && difference ? [difference.missing === undefined ? '' : `Add a note on ${slotName(difference.missing)}.`, difference.extra === undefined ? '' : `Leave ${slotName(difference.extra)} empty.`].join(' ').trim()
        : ''}</p></div>}
  </div>
}
