import type { RhythmExercise, Topic } from './content'

export const RHYTHM_TOPIC: Topic = {
  id: 'rhythm', group: 'Listening and timing', activity: 'rhythm', title: 'Find the spaces between beats',
  description: 'Put the same note in different places and hear how its timing changes the phrase.',
  intro: 'This bar is in 4/4, four crotchet beats to the bar. Count 1, 2, 3, 4 with the click. Say “and” halfway between each pair of numbers. Try the patterns, then tap the boxes to place your own notes.',
  detail: 'Two quavers divide each crotchet beat into equal halves. The “and” is an offbeat. Emphasising an offbeat or another weak part of the bar can create syncopation. Tempo is measured in beats per minute (BPM). The boxes control when notes start. A quaver lasts half a crotchet, even though the examples use short sounds.',
  task: 'Count with these four evenly spaced notes. The next time you play a phrase on guitar, leave one beat empty and keep counting. You can try the same thing on screen in the rhythm lesson.',
  taskPositions: Array.from({ length: 4 }, () => ({ string: 3, fret: 0 })),
}

export const RHYTHM_EXERCISES: readonly RhythmExercise[] = [
  { id: 'rhythm-pulse', topic: 'rhythm', kind: 'rhythm', slots: [0, 2, 4, 6],
    prompt: 'Place one note on each of the four beats.', hint: 'Tap 1, 2, 3 and 4. Keep every “and” empty.',
    why: 'Each note lands with a click. This gives you four evenly spaced notes, one on each beat.' },
  { id: 'rhythm-offbeats', topic: 'rhythm', kind: 'rhythm', slots: [1, 3, 5, 7],
    prompt: 'Place the notes between the clicks.', hint: 'Tap the “and” after each beat. Leave the four numbers empty.',
    why: 'The notes are still evenly spaced, but every one falls halfway between the clicks. Those are the offbeats.' },
  { id: 'rhythm-spaces', topic: 'rhythm', kind: 'rhythm', slots: [0, 3, 6],
    prompt: 'Play on beat 1, the “and” after 2, and beat 4.', hint: 'Use the top boxes for 1 and 4, and the second box under 2. Count through the empty third beat.',
    why: 'The empty third beat gives the phrase room before beat 4. Keep counting the pulse through the gap.' },
]

export function slotName(index: number) {
  const beat = Math.floor(index / 2) + 1
  return index % 2 === 0 ? `beat ${beat}` : `the “and” after beat ${beat}`
}

export function rhythmDifference(expected: readonly number[], played: readonly number[]) {
  return { missing: expected.find((slot) => !played.includes(slot)), extra: played.find((slot) => !expected.includes(slot)) }
}

export function secondsPerQuaver(bpm: number) {
  return 60 / bpm / 2
}
