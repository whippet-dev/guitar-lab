import { frequencyOf } from './theory'

let context: AudioContext | undefined

export async function playPitches(pitches: readonly number[]) {
  context ??= new AudioContext()
  if (context.state !== 'running') await context.resume()
  const audio = context
  const start = audio.currentTime + 0.015

  pitches.forEach((pitch, index) => {
    const time = start + index * 0.62
    const oscillator = audio.createOscillator()
    const envelope = audio.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequencyOf(pitch)
    envelope.gain.setValueAtTime(0.001, time)
    envelope.gain.exponentialRampToValueAtTime(0.18, time + 0.015)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.8)
    oscillator.connect(envelope).connect(audio.destination)
    oscillator.start(time)
    oscillator.stop(time + 0.82)
  })
}
