import { frequencyOf } from './theory'

let context: AudioContext | undefined
let playing: OscillatorNode[] = []
let playback = 0

export async function playGroups(groups: readonly (readonly number[])[], gap = 0.62, duration = 0.8) {
  const request = ++playback
  context ??= new AudioContext()
  if (context.state !== 'running') await context.resume()
  if (request !== playback) return
  const audio = context
  playing.forEach((voice) => voice.stop())
  playing = []
  const start = audio.currentTime + 0.015

  groups.forEach((pitches, index) => {
    const time = start + index * gap
    pitches.forEach((pitch) => {
      const oscillator = audio.createOscillator()
      const envelope = audio.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = frequencyOf(pitch)
      envelope.gain.setValueAtTime(0.001, time)
      envelope.gain.exponentialRampToValueAtTime(0.18 / pitches.length, time + 0.015)
      envelope.gain.exponentialRampToValueAtTime(0.001, time + duration)
      oscillator.connect(envelope).connect(audio.destination)
      oscillator.onended = () => {
        oscillator.disconnect()
        envelope.disconnect()
        playing = playing.filter((voice) => voice !== oscillator)
      }
      playing.push(oscillator)
      oscillator.start(time)
      oscillator.stop(time + duration + 0.02)
    })
  })
}

export function playPitches(pitches: readonly number[], together = false) {
  return playGroups(together ? [pitches] : pitches.map((pitch) => [pitch]))
}
