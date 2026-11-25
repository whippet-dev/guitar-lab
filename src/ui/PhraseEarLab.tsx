import { useState } from 'react'
import { INTERVALS, noteName, pitchAt, pitchClass, samePosition, type Position } from '../music/theory'
import { Fretboard, toneKind } from './Fretboard'
import { AudioButton } from './AudioButton'

const a = { string: 2, fret: 2 } as const
const c = { string: 1, fret: 1 } as const
const cSharp = { string: 1, fret: 2 } as const
const e = { string: 0, fret: 0 } as const
const b = { string: 1, fret: 0 } as const
const examples = [
  { label: 'Minor', notes: [a, c, e], detail: 'A, C and E rise through A minor. Hear how close C is to the starting A.' },
  { label: 'Major', notes: [a, cSharp, e], detail: 'A, C♯ and E rise through A major. Only the middle note has moved, up one semitone.' },
  { label: 'Falling', notes: [e, c, a], detail: 'The minor triad plays in reverse. E and C lead down to A, the root.' },
  { label: 'Resolve to A', notes: [b, a], detail: 'B can add tension over A minor. A is already in the chord. Listen to how that one whole step changes the ending.' },
] as const

export function PhraseEarLab() {
  const [choice, setChoice] = useState(0)
  const [selected, setSelected] = useState<Position>()
  const { notes, detail } = examples[choice]
  const pitches = notes.map(pitchAt)
  return <div className="music-lab" aria-label="Phrase listening workshop">
    <div className="lab-choices" role="group" aria-label="Listening examples">
      {examples.map(({ label }, index) => <button type="button" className="button button-secondary" key={label} aria-pressed={choice === index}
        onClick={() => { setChoice(index); setSelected(undefined) }}>{label}</button>)}
    </div>
    <div className="lab-choices">
      <AudioButton pitches={pitches} label="Hear the phrase" />
      {choice === 3 && <AudioButton groups={pitches.map((pitch) => [45, 48, 52, pitch])} gap={0.9} label="Hear it over A minor" />}
    </div>
    <details className="explanation">
      <summary>See the notes on the fretboard</summary>
      <p>{detail}</p>
      <Fretboard range={[0, 5]} selected={selected} onSelect={(position) => { if (notes.some((note) => samePosition(position, note))) setSelected(position) }}
        marker={(position) => {
          if (!notes.some((note) => samePosition(position, note))) return undefined
          const midi = pitchAt(position)
          const offset = pitchClass(midi - 9)
          return { label: noteName(midi, 'common'), kind: toneKind(INTERVALS[offset][2], offset) }
        }} />
      {selected && <AudioButton pitches={[pitchAt(selected)]} label="Hear selected note" />}
    </details>
  </div>
}
