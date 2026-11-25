import { useState } from 'react'
import { cagedRoute, formPositions, guitarTriads } from '../music/guitarShapes'
import { TRIADS, triadNotes, type TriadInversion, type TriadKind } from '../music/harmony'
import { MAX_FRET, noteName, pitchAt, pitchClass, positionName, samePosition, STRINGS, type Position, type StringIndex } from '../music/theory'
import { AudioButton } from './AudioButton'
import { Fretboard, toneKind } from './Fretboard'

const chromaticNotes = Array.from({ length: 12 }, (_, pitch) => noteName(pitch, 'common'))
const inversionNames = ['Root position', 'First inversion', 'Second inversion']
const toneNames = { 1: 'root', 3: 'third', 5: 'fifth' }

function ChordFretboard({ root, quality, positions, comparison = [] }: {
  root: number; quality: TriadKind; positions: Position[]; comparison?: Position[]
}) {
  const [selected, setSelected] = useState<Position>()
  const { third, fifth } = TRIADS[quality]
  const tones = triadNotes(root, third, fifth)
  const all = [...positions, ...comparison]
  const start = Math.max(0, Math.min(...all.map(({ fret }) => fret)) - 1)
  const end = Math.min(MAX_FRET, Math.max(start + 5, ...all.map(({ fret }) => fret)))
  const shared = positions.filter((position) => comparison.some((other) => samePosition(position, other)))
  const bass = tones.find(({ pitch }) => pitch === pitchClass(pitchAt(positions[0])))!
  const current = selected && all.some((position) => samePosition(selected, position)) ? selected : undefined
  const activeTone = current && tones.find(({ pitch }) => pitch === pitchClass(pitchAt(current)))
  return <>
    <Fretboard range={[start, end]} selected={current} onSelect={setSelected} marker={(position) => {
      const here = positions.some((item) => samePosition(item, position))
      const there = comparison.some((item) => samePosition(item, position))
      if (!here && !there) return undefined
      const tone = tones.find(({ pitch }) => pitch === pitchClass(pitchAt(position)))!
      const role = toneNames[tone.degree as keyof typeof toneNames]
      return { label: tone.name, kind: toneKind(tone.degree, pitchClass(tone.pitch - root)), comparison: there ? (here ? 'shared' : 'neighbour') : undefined,
        spokenLabel: `${positionName(position)}, ${tone.name}, ${role}${here && there ? ', shared by both shapes' : there ? ', next shape' : ''}` }
    }} />
    <div className="lab-result">
      <p role="status">{activeTone && current ? `${positionName(current)} is ${activeTone.name}, the ${toneNames[activeTone.degree as keyof typeof toneNames]}${shared.some((item) => samePosition(current, item)) ? ' in both shapes' : ' of this chord'}.`
        : comparison.length ? `${shared.length} ${shared.length === 1 ? 'fret position belongs' : 'fret positions belong'} to both shapes. A double ring marks each shared position.` : `${bass.name} is the lowest note. Tap a marked fret to check its role.`}</p>
    </div>
    <div className="lab-choices">
      <AudioButton pitches={positions.map(pitchAt)} together label="Hear shape" />
      {comparison.length > 0 && <AudioButton pitches={comparison.map(pitchAt)} together label="Hear next shape" />}
      {current && <AudioButton pitches={[pitchAt(current)]} label="Hear note" />}
    </div>
  </>
}

export function CagedLab() {
  const [root, setRoot] = useState(0)
  const [index, setIndex] = useState(0)
  const [placement, setPlacement] = useState<'along-neck' | 'open' | 'overlap'>('along-neck')
  const route = cagedRoute(root)
  const { form, shift } = route[index]
  const next = route[index + 1]
  const open = placement === 'open'
  const actualRoot = open ? form.tonic : root
  const positions = formPositions(form, open ? 0 : shift)
  const comparison = placement === 'overlap' ? formPositions(next.form, next.shift) : []

  return <div className="music-lab" aria-label="CAGED workshop">
    <div className="lab-controls">
      <label className="lab-select">Major chord<select value={root} onChange={(event) => { setRoot(Number(event.target.value)); setIndex(0); setPlacement('along-neck') }}>
        {chromaticNotes.map((name, pitch) => <option key={pitch} value={pitch}>{name} major</option>)}
      </select></label>
      <div className="lab-choices" role="group" aria-label="CAGED forms">
        {route.slice(0, 5).map(({ form: shape }, step) => <button key={shape.name} type="button" className="button button-secondary" aria-label={`${shape.name} form`}
          aria-pressed={step === index} onClick={() => setIndex(step)}>{shape.name}</button>)}
      </div>
    </div>
    <div className="lab-choices" role="group" aria-label="Compare CAGED forms">
      <button type="button" className="button button-secondary" aria-pressed={open} onClick={() => setPlacement(open ? 'along-neck' : 'open')}>Show open form</button>
      <button type="button" className="button button-secondary" aria-pressed={placement === 'overlap'} onClick={() => setPlacement(placement === 'overlap' ? 'along-neck' : 'overlap')}>Show overlap</button>
    </div>
    <p className="lab-instruction"><strong>{noteName(actualRoot, 'common')} major · {form.name} form.</strong> {open ? 'This is the familiar open chord.' : shift === 0 ? 'This form starts at the nut.' : `Move the whole open form up ${shift} ${shift === 1 ? 'fret' : 'frets'}. Fret ${shift} takes the place of the nut.`}
      {comparison.length > 0 && ` The faded markers add the neighbouring ${next.form.name} form${index === 4 ? ' an octave above the first form' : ''}.`}</p>
    <p className="shape-tab">Thick to thin {form.frets.map((fret) => fret === null ? '×' : fret + (open ? 0 : shift)).join(' · ')}</p>
    <ChordFretboard key={`${root}-${index}-${placement}`} root={actualRoot} quality="major" positions={positions} comparison={comparison} />
  </div>
}

export function VoicingLab() {
  const [root, setRoot] = useState(0)
  const [quality, setQuality] = useState<TriadKind>('major')
  const [bassString, setBassString] = useState<StringIndex>(2)
  const [inversion, setInversion] = useState<TriadInversion>(0)
  const [register, setRegister] = useState(0)
  const shapes = guitarTriads(root, quality, bassString, inversion)
  const positions = shapes[register]
  return <div className="music-lab" aria-label="Movable triad workshop">
    <div className="lab-controls">
      <label className="lab-select">Root note<select value={root} onChange={(event) => { setRoot(Number(event.target.value)); setRegister(0) }}>
        {chromaticNotes.map((name, pitch) => <option key={pitch} value={pitch}>{name}</option>)}
      </select></label>
      <label className="lab-select">Chord quality<select value={quality} onChange={(event) => { setQuality(event.target.value as TriadKind); setRegister(0) }}>
        {Object.entries(TRIADS).map(([kind, chord]) => <option key={kind} value={kind}>{chord.label}</option>)}
      </select></label>
      <label className="lab-select">Strings<select value={bassString} onChange={(event) => { setBassString(Number(event.target.value) as StringIndex); setRegister(0) }}>
        {[2, 3, 4, 5].map((bass) => <option value={bass} key={bass}>{STRINGS.slice(bass - 2, bass + 1).reverse().map(({ name }) => name).join('–')}</option>)}
      </select></label>
      <label className="lab-select">Inversion<select value={inversion} onChange={(event) => { setInversion(Number(event.target.value) as TriadInversion); setRegister(0) }}>
        {inversionNames.map((name, value) => <option key={name} value={value}>{name}</option>)}
      </select></label>
    </div>
    <div className="lab-result">
      <p><strong>{noteName(root, 'common')} {TRIADS[quality].label}</strong> · bass {['root', 'third', 'fifth'][inversion]}</p>
      {shapes.length > 1 && <label className="lab-select">Bass fret<select value={register} onChange={(event) => setRegister(Number(event.target.value))}>
        {shapes.map((shape, index) => <option key={index} value={index}>{shape[0].fret}</option>)}
      </select></label>}
    </div>
    <ChordFretboard key={`${root}-${quality}-${bassString}-${inversion}-${register}`} root={root} quality={quality} positions={positions} />
  </div>
}
