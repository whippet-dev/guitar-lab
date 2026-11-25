import { expect, it } from 'vitest'
import { BACKINGS, MELODIES, phraseVoices } from './phrasing'

it('keeps rests silent and places melody and chord changes on the same clock', () => {
  const [example] = MELODIES
  const quaver = 0.375
  const lead = phraseVoices(example.slots, BACKINGS[0], quaver, false)
  expect(lead.map(({ pitch, at }) => [pitch, at])).toEqual([[64, 0], [67, 1.125], [69, 1.5], [64, 3], [67, 4.125], [65, 5.25]])
  const arranged = phraseVoices(example.slots, BACKINGS[0], quaver, true)
  expect(arranged.slice(0, 6).map(({ pitch, at, duration }) => [pitch, at, duration])).toEqual([
    [45, 0, 3], [48, 0, 3], [52, 0, 3], [41, 3, 3], [45, 3, 3], [48, 3, 3],
  ])
  expect(arranged.slice(6)).toEqual(lead)
  expect(phraseVoices(example.slots, BACKINGS[1], quaver, true).slice(6)).toEqual(lead)
  expect(phraseVoices(example.slots, BACKINGS[2], quaver, true).every(({ pitch }) => pitch >= 40)).toBe(true)
})
