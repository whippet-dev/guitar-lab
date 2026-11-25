import electric from '../assets/audio/electric.mp3?url'
import acoustic from '../assets/audio/acoustic.mp3?url'
import samples from './guitarSamples.json'

export const SAMPLE_BANKS = { electric: { url: electric, notes: samples.electric }, acoustic: { url: acoustic, notes: samples.acoustic } }

export type Guitar = keyof typeof SAMPLE_BANKS

export function sampleFor(instrument: Guitar, pitch: number) {
  // Keep the lower anchor at ties. The same pitch always takes the same route.
  const notes = SAMPLE_BANKS[instrument].notes
  const nearest = notes.reduce((best, sample) => Math.abs(sample.midi - pitch) < Math.abs(best.midi - pitch) ? sample : best)
  return { ...nearest, rate: 2 ** ((pitch - nearest.midi - nearest.cents / 100) / 12) }
}
