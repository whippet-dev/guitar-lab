import { TRIADS, triadVoicing, type TriadInversion, type TriadKind } from './harmony'
import { MAX_FRET, pitchClass, scalePitchesInRange, STRINGS, type Position, type ScaleKind, type StringIndex } from './theory'

type ScaleStep = { position: Position; cost: number; previous?: ScaleStep }

export function scalePath(root: number, kind: ScaleKind, range: readonly [number, number]) {
  const [first, last] = range
  let choices: ScaleStep[] = []
  // Remember the easiest route to each fret. Prefer small shifts and neighbouring strings.
  for (const pitch of scalePitchesInRange(root, kind, range)) {
    choices = STRINGS.flatMap(({ midi }, string) => {
      const fret = pitch - midi
      if (fret < first || fret > last) return []
      let best: ScaleStep | undefined
      let cost = Infinity
      for (const choice of choices) {
        const crossing = choice.position.string - string
        if (crossing < 0) continue
        const move = Math.abs(choice.position.fret - fret)
        const effort = choice.cost + move + 3 * Math.max(0, move - 3) + crossing ** 2
        if (effort < cost) { best = choice; cost = effort }
      }
      if (choices.length && !best) return []
      return [{ position: { string: string as StringIndex, fret }, cost: (best ? cost : 0) + (fret - first) / 10, previous: best }]
    })
  }
  const route: Position[] = []
  let step = choices.reduce<ScaleStep | undefined>((best, choice) => !best || choice.cost < best.cost ? choice : best, undefined)
  while (step) {
    route.push(step.position)
    step = step.previous
  }
  return route.reverse()
}

// Fret offsets in strumming order, from the thickest string to the thinnest.
export const CAGED = [
  { name: 'C', tonic: 0, frets: [null, 3, 2, 0, 1, 0] },
  { name: 'A', tonic: 9, frets: [null, 0, 2, 2, 2, 0] },
  { name: 'G', tonic: 7, frets: [3, 2, 0, 0, 0, 3] },
  { name: 'E', tonic: 4, frets: [0, 2, 2, 1, 0, 0] },
  { name: 'D', tonic: 2, frets: [null, null, 0, 2, 3, 2] },
] as const

export type ChordForm = (typeof CAGED)[number]

export function formPositions(form: ChordForm, shift: number): Position[] {
  return form.frets.flatMap((offset, index) => offset === null ? [] : [{ string: (5 - index) as StringIndex, fret: offset + shift }])
}

export function cagedRoute(tonic: number) {
  const shapes = CAGED.map((form) => ({ form, shift: pitchClass(tonic - form.tonic) })).sort((a, b) => a.shift - b.shift)
  return [...shapes, { form: shapes[0].form, shift: shapes[0].shift + 12 }]
}

export function guitarTriads(tonic: number, quality: TriadKind, bassString: StringIndex, inversion: TriadInversion) {
  const { third, fifth } = TRIADS[quality]
  const voicing = triadVoicing(tonic, third, fifth, inversion)
  // Align the bass with the lowest playable octave on the chosen string.
  const firstOctave = Math.ceil((STRINGS[bassString].midi - voicing[0]) / 12) * 12
  return [firstOctave, firstOctave + 12, firstOctave + 24].flatMap((octave) => {
    const shape = voicing.map((pitch, index) => {
      const string = (bassString - index) as StringIndex
      return { string, fret: pitch + octave - STRINGS[string].midi }
    })
    return shape.every(({ fret }) => fret >= 0 && fret <= MAX_FRET) ? [shape] : []
  })
}
