import { expect, test } from '@playwright/test'
import { noteName, pitchAt, positionName, STRINGS, type StringIndex } from '../src/music/theory'

test('starts a daily plan, resumes after reload and uses the results to progress', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('link', { name: 'Start daily practice' }).click()
  await expect(page.getByRole('heading', { name: 'Your first landmarks' })).toBeVisible()
  await page.getByText('Why does this work?').click()
  await expect(page.getByText('That doubles the frequency', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Low E at fret 12' }).click()
  await expect(page.getByRole('button', { name: 'low E string, fret 12, E' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Start exercises' }).click()
  await page.getByRole('button', { name: 'low E string, fret 1', exact: true }).click()
  await expect(page.getByText('Stay on this string and try a lower fret.', { exact: false })).toBeVisible()

  await page.getByRole('link', { name: 'Back to Today' }).click()
  await page.reload()
  await page.getByRole('link', { name: 'Resume daily practice' }).click()
  await expect(page.getByText('Try another position.')).toBeVisible()
  await page.getByRole('button', { name: 'Open low E string', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Open A string', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'low E string, fret 12', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Listen to the example' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Try it in the explorer' })).toBeVisible()
  await page.getByRole('button', { name: 'Finish practice' }).click()
  await expect(page.getByRole('heading', { name: 'Practice complete' })).toBeVisible()
  await page.getByRole('link', { name: 'Progress', exact: true }).click()
  await expect(page.getByText('1 daily session completed')).toBeVisible()
  await expect(page.getByText('Finding notes confidently')).toBeVisible()
  await page.getByRole('link', { name: 'Today', exact: true }).click()
  await page.getByRole('link', { name: 'Practise again' }).click()
  await expect(page.getByRole('heading', { name: 'One fret at a time' })).toBeVisible()
})

test('opens a lesson independently and gives a hint and a worked answer', async ({ page }) => {
  await page.goto('./#learn')
  await page.getByRole('link', { name: 'One fret at a time', exact: true }).click()
  await page.getByRole('link', { name: 'Try an exercise' }).click()
  await expect(page.getByRole('heading', { name: 'Find F on the low E string.' })).toBeVisible()
  await page.getByRole('button', { name: 'Get a hint' }).click()
  await expect(page.getByText('E and F are one semitone apart.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await expect(page.getByText('Here’s the position.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'low E string, fret 1, F' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: 'Next exercise' }).click()
  await expect(page.getByRole('heading', { name: 'Find G on the low E string.' })).toBeVisible()
})

test('explores all fret ranges, scale spellings and intervals with usable controls', async ({ page }) => {
  await page.goto('./#fretboard')
  await expect(page.getByRole('heading', { name: 'Fretboard explorer' })).toBeVisible()
  const fretRange = page.getByRole('combobox', { name: 'Fret range' })
  await fretRange.selectOption({ label: '0–12' })
  await expect(page.getByRole('button', { name: 'low E string, fret 2, F♯', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'low E string, fret 6, B♭', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'low E string, fret 12, E', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^low E string, fret 13/ })).toHaveCount(0)
  await fretRange.selectOption({ label: '19–24' })
  const highE = page.getByRole('button', { name: 'high E string, fret 24, E', exact: true })
  const box = await highE.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
  await highE.click()
  await expect(page.locator('.explorer-result strong')).toHaveText('E6')
  const audioSupported = await page.evaluate(() => typeof window.AudioContext === 'function')
  await page.getByRole('button', { name: 'Hear note' }).click()
  await expect(page.getByText('Audio is unavailable in this browser.')).toHaveCount(audioSupported ? 0 : 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth))

  await fretRange.selectOption({ label: 'All frets (0–24)' })
  const lowE = page.getByRole('button', { name: 'Open low E string, E', exact: true })
  await lowE.focus()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'low E string, fret 24, E', exact: true })).toBeFocused()

  await page.getByRole('button', { name: 'Scales', exact: true }).click()
  await expect(page.getByText('A scale is a set of notes arranged from low to high.', { exact: false })).toBeVisible()
  await page.getByText('How do the scale options differ?').click()
  await expect(page.getByText('Pentatonic means five notes.', { exact: false })).toBeVisible()
  await page.getByRole('combobox', { name: 'Scale', exact: true }).selectOption('major')
  await page.getByRole('combobox', { name: 'Root', exact: true }).selectOption('6')
  await page.getByLabel('Note names').selectOption('flats')
  await expect(page.locator('.scale-strip')).toHaveText('G♭A♭B♭C♭D♭E♭F')

  await fretRange.selectOption({ label: '0–5' })
  await page.getByRole('button', { name: 'Intervals', exact: true }).click()
  await expect(page.getByText('An interval is the distance between two notes.', { exact: false })).toBeVisible()
  await page.getByRole('combobox', { name: 'Root', exact: true }).selectOption('9')
  await page.getByRole('button', { name: 'Open low E string, 5', exact: true }).click()
  await expect(page.getByText('Open low E string · Perfect fifth', { exact: true })).toBeVisible()
})

test('practises finding and naming notes without replacing or moving the board', async ({ page }) => {
  await page.goto('./#fretboard')
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  const practice = page.getByRole('region', { name: 'Fretboard note practice' })
  const board = practice.locator('.board-scroll')
  const next = practice.getByRole('button', { name: 'Next note' })
  const feedback = practice.getByRole('status')
  const prompt = practice.getByRole('heading', { name: /^Where is / })
  const firstPrompt = await prompt.textContent()
  const target = firstPrompt?.match(/^Where is (.+)\?$/)?.[1]
  expect(target).toBeTruthy()

  await practice.getByRole('button', { name: target === 'E' ? 'Open A string' : 'Open low E string', exact: true }).click()
  await expect(feedback).toContainText('Try another position')
  const answer = STRINGS.flatMap((_, index) => Array.from({ length: 6 }, (_, fret) => ({ string: index as StringIndex, fret })))
    .find((position) => noteName(pitchAt(position), 'common') === target)!
  await practice.getByRole('button', { name: positionName(answer), exact: true }).click()
  await expect(feedback).toContainText('That’s it.')
  await board.evaluate((element) => { element.dataset.retained = 'yes' })
  await next.scrollIntoViewIfNeeded()
  const pageTop = await page.evaluate(() => window.scrollY)
  await next.click()
  await expect(prompt).not.toHaveText(firstPrompt!)
  await expect(board).toHaveAttribute('data-retained', 'yes')
  expect(await page.evaluate(() => window.scrollY)).toBe(pageTop)

  await practice.getByRole('button', { name: 'Name a note' }).click()
  await page.getByRole('combobox', { name: 'Fret range' }).selectOption({ label: 'All frets (0–24)' })
  await practice.getByRole('button', { name: 'Name a note' }).click()
  const scrollLeft = await board.evaluate((element) => { element.scrollLeft = 230; return element.scrollLeft })
  expect(scrollLeft).toBeGreaterThan(0)
  await next.click()
  expect(await board.evaluate((element) => element.scrollLeft)).toBe(scrollLeft)
  const highlighted = board.getByRole('button', { name: /, highlighted note$/ })
  expect(await highlighted.evaluate((cell) => {
    const scroller = cell.closest('.board-scroll')!
    const { left, right } = cell.getBoundingClientRect()
    return left >= scroller.getBoundingClientRect().left + 45 && right <= scroller.getBoundingClientRect().right
  })).toBe(true)

  const [string, fret] = (await highlighted.getAttribute('data-position'))!.split('-').map(Number)
  await expect(highlighted).toHaveAccessibleName(`String ${string + 1}, ${fret === 0 ? 'open' : `fret ${fret}`}, highlighted note`)
  const name = noteName(pitchAt({ string: string as StringIndex, fret }), 'common')
  const choices = practice.getByRole('group', { name: 'Note names' })
  await choices.getByRole('button', { name: name === 'C' ? 'D' : 'C', exact: true }).click()
  await expect(feedback).toContainText('Try a different note name')
  await choices.getByRole('button', { name, exact: true }).click()
  await expect(feedback).toContainText(`plays ${name}.`)
  await expect(highlighted).toHaveCount(0)
  await next.click()
  await expect(highlighted).toHaveCount(1)
  await practice.getByRole('button', { name: 'Show answer' }).click()
  await expect(feedback).toContainText('Here’s the answer.')
})

test('keeps practice controls and the guitar neck visible in landscape', async ({ page }) => {
  await page.goto('./#fretboard')
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  const practice = page.getByRole('region', { name: 'Fretboard note practice' })
  await practice.getByRole('button', { name: 'Name a note' }).click()
  const board = practice.locator('.board-scroll')
  await board.evaluate((element) => { element.dataset.retained = 'yes' })
  const elements = [
    page.getByRole('combobox', { name: 'Fret range' }), page.getByRole('combobox', { name: 'Note names', exact: true }),
    board, practice.getByRole('group', { name: 'Practice type' }), practice.getByRole('heading'),
    practice.getByRole('group', { name: 'Note names' }), practice.getByRole('status'),
    practice.getByRole('button', { name: 'Show answer' }), practice.getByRole('button', { name: 'Next note' }),
  ]

  for (const { width, height, side, bottom } of [
    { width: 844, height: 390, side: 47, bottom: 21 },
    { width: 750, height: 340, side: 0, bottom: 0 },
    { width: 568, height: 320, side: 0, bottom: 0 },
  ]) {
    await page.setViewportSize({ width, height })
    await page.locator('.app-shell').evaluate((shell, insets) => {
      shell.style.setProperty('--practice-inset-left', `${insets.side}px`)
      shell.style.setProperty('--practice-inset-right', `${insets.side}px`)
      shell.style.setProperty('--practice-inset-bottom', `${insets.bottom}px`)
    }, { side, bottom })
    await practice.getByRole('button', { name: 'Show answer' }).click()
    await expect(practice.getByRole('status')).toContainText('Here’s the answer.')
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    for (const element of elements) {
      const bounds = await element.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(side)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - side + 0.5)
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height - bottom + 0.5)
    }
    await practice.getByRole('button', { name: 'Next note' }).click()
  }

  await expect(board).toHaveAttribute('data-retained', 'yes')
  await page.getByRole('combobox', { name: 'Fret range' }).selectOption({ label: '0–12' })
  await expect(board.locator('.board-nut')).toHaveCount(1)
  await expect(board.locator('.board-fret').last().locator('.board-dot')).toHaveCount(2)
  const gauges = await board.locator('.board-string').evaluateAll((rows) => rows.map((row) => parseFloat(getComputedStyle(row).getPropertyValue('--string-width'))))
  expect(gauges).toHaveLength(6)
  expect(gauges.slice(1).every((gauge, index) => gauge > gauges[index])).toBe(true)
})

test('opens and continues a saved session offline from a Pages-style subpath', async ({ page, context }) => {
  await page.goto('./')
  await expect(page.getByText('Ready to use offline')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('link', { name: 'Start daily practice' }).click()
  await page.getByRole('button', { name: 'Start exercises' }).click()
  await expect(page.getByRole('heading', { name: 'Find the open low E.' })).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Find the open low E.' })).toBeVisible()
  await page.getByRole('button', { name: 'Open low E string', exact: true }).click()
  await expect(page.getByText('That’s it.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: 'Find the open A string.' })).toBeVisible()
})
