import { getInstrument } from './instruments'
import { sampleFor, SAMPLE_BANKS, type Guitar } from './samples'
import { frequencyOf } from './theory'

export type TimedNote = { pitch: number; at: number; duration: number; volume: number; voice?: 'reference' | 'click' }
type PlaybackResult = 'playing' | 'fallback' | 'cancelled'
type PlaybackOptions = { reference?: boolean; signal?: AbortSignal; strum?: boolean }
type Mixer = { context: AudioContext; output: DynamicsCompressorNode }
type Voice = { source: AudioScheduledSourceNode; gain: AudioParam; start: number; end: number }

let mixer: Mixer | undefined
let voices: Voice[] = []
let playback = 0
let removeAbortListener: (() => void) | undefined
let bank: { instrument: Guitar; context: AudioContext; buffer: Promise<AudioBuffer | undefined> } | undefined

function getMixer(): Mixer {
  if (!mixer || mixer.context.state === 'closed') {
    const context = new AudioContext({ latencyHint: 'interactive' })
    const output = context.createDynamicsCompressor()
    output.threshold.value = -8
    output.knee.value = 8
    output.ratio.value = 5
    output.attack.value = 0.003
    output.release.value = 0.09
    output.connect(context.destination)
    mixer = { context, output }
  }
  return mixer
}

function loadBank(context: AudioContext, instrument: Guitar) {
  if (bank?.instrument === instrument && bank.context === context) return bank.buffer
  const buffer = fetch(SAMPLE_BANKS[instrument].url)
    .then((response) => {
      if (!response.ok) throw new Error('Guitar samples could not be loaded.')
      return response.arrayBuffer()
    })
    .then((bytes) => context.decodeAudioData(bytes))
    .catch(() => {
      if (bank?.buffer === buffer) bank = undefined
      return undefined
    })
  // Retain just the most recently used decoded guitar bank.
  bank = { instrument, context, buffer }
  return buffer
}

function withTimeout<T>(pending: Promise<T>, delay: number, fallback: T) {
  let timer: ReturnType<typeof setTimeout>
  const deadline = new Promise<T>((resolve) => { timer = setTimeout(() => resolve(fallback), delay) })
  return Promise.race([pending, deadline]).finally(() => clearTimeout(timer))
}

export function stopAudio() {
  playback += 1
  removeAbortListener?.()
  removeAbortListener = undefined
  const context = mixer?.context
  if (context && context.state !== 'closed') {
    const now = context.currentTime
    for (const { source, gain, start, end } of voices) {
      if (end <= now) continue
      if (start > now || context.state !== 'running') {
        source.stop(now)
        continue
      }
      if (typeof gain.cancelAndHoldAtTime === 'function') gain.cancelAndHoldAtTime(now)
      else {
        gain.cancelScheduledValues(now)
        gain.setValueAtTime(gain.value, now)
      }
      const tail = Math.min(end, now + 0.018)
      gain.linearRampToValueAtTime(0, tail)
      source.stop(tail)
    }
  }
  voices = []
}

function scheduleVoice({ context, output }: Mixer, note: TimedNote, start: number, guitar?: { instrument: Guitar; buffer: AudioBuffer }) {
  const time = start + note.at
  const release = note.voice === 'click' ? 0.015 : Math.min(0.09, note.duration / 4)
  const envelope = context.createGain()
  const sample = guitar && !note.voice ? sampleFor(guitar.instrument, note.pitch) : undefined
  const sustain = sample ? Math.min(note.duration, sample.duration / sample.rate - release) : note.duration
  const end = time + sustain + release
  const level = note.volume * (sample ? 2.45 : note.voice === 'click' ? 1 : 0.68)
  envelope.gain.setValueAtTime(0, time)
  envelope.gain.linearRampToValueAtTime(level, time + (sample ? 0.004 : 0.009))
  envelope.gain.setValueAtTime(level, time + sustain)
  envelope.gain.linearRampToValueAtTime(0, end)

  let source: AudioScheduledSourceNode
  if (guitar && sample) {
    const sampler = context.createBufferSource()
    sampler.buffer = guitar.buffer
    sampler.playbackRate.value = sample.rate
    sampler.connect(envelope)
    sampler.start(time, sample.start, sample.duration)
    source = sampler
  } else {
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequencyOf(note.pitch)
    oscillator.connect(envelope)
    oscillator.start(time)
    source = oscillator
  }
  envelope.connect(output)
  source.stop(end)
  const voice = { source, gain: envelope.gain, start: time, end }
  voices.push(voice)
  source.onended = () => {
    source.disconnect()
    envelope.disconnect()
    voices = voices.filter((playing) => playing !== voice)
  }
}

export async function playTimedNotes(notes: readonly TimedNote[], options: PlaybackOptions = {}): Promise<PlaybackResult> {
  if (options.signal?.aborted) return 'cancelled'
  stopAudio()
  const request = playback
  if (!notes.length) return 'playing'
  const { signal } = options
  const selected = options.reference ? 'reference' : getInstrument()
  const instrument = selected !== 'reference' && notes.some(({ voice }) => !voice) ? selected : undefined
  const audio = getMixer()
  const { context } = audio
  // Resume directly in the gesture handler, ahead of any fetch or decode.
  const resumed = context.state === 'running' ? Promise.resolve(true) : withTimeout(context.resume().then(() => true, () => false), 1600, false)
  const samples = instrument ? withTimeout(loadBank(context, instrument), 580, undefined) : undefined
  if (signal) {
    const cancel = () => { if (request === playback) stopAudio() }
    signal.addEventListener('abort', cancel, { once: true })
    removeAbortListener = () => signal.removeEventListener('abort', cancel)
  }
  const [ready, buffer] = await Promise.all([resumed, samples])
  if (request !== playback) return 'cancelled'
  if (!ready || context.state !== 'running') {
    stopAudio()
    throw new Error('Audio is unavailable in this browser.')
  }
  const guitar = instrument && buffer ? { instrument, buffer } : undefined
  const start = context.currentTime + 0.018
  notes.forEach((note) => scheduleVoice(audio, note, start, guitar))
  return instrument && !buffer ? 'fallback' : 'playing'
}

export function playGroups(groups: readonly (readonly number[])[], gap = 0.62, options: PlaybackOptions = {}) {
  const duration = groups.length === 1 ? 1.55 : gap * 0.89
  return playTimedNotes(groups.flatMap((pitches, group) => pitches.map((pitch, index) => ({
    pitch, at: group * gap + (options.strum ? index * 0.011 : 0), duration, volume: 0.18 / Math.sqrt(pitches.length),
  }))), options)
}

export function playPitches(pitches: readonly number[], together = false, options: PlaybackOptions = {}) {
  return playGroups(together ? [pitches] : pitches.map((pitch) => [pitch]), undefined, options)
}
