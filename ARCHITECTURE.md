# Architecture

Keep the code readable. Add features and abstractions when they support a current learning need. Use the existing static app and local progress storage. Consider accounts, databases or backend services only for a demonstrated need, and keep hosting and dependencies free of recurring charges.

## Application boundaries

- `src/music/theory.ts` is the pure music model. It uses MIDI semitone numbers for absolute pitch and pitch classes for recurring note names. String indices run from thinnest to thickest in the visual fretboard. Fret zero is open and each fret adds one semitone. Chromatic notes can use common names, sharps or flats. Scales follow the letter pattern of their chosen root.
- `src/learning` contains the authored lessons and prompts, answer evaluation, sequencing, and versioned progress model. A session saves stable identifiers and the active step, so it can resume after a refresh or offline. First results are recorded once per attempt even when the learner retries.
- `src/ui` contains the reusable fretboard and the lesson, practice and exploration views. The explorer and exercise views read the same pitch model. The fretboard uses touch-sized buttons, horizontal scrolling, range jumps, and a single keyboard tab stop with arrow navigation.
- `src/music/audio.ts` plays notes through Web Audio when the learner starts playback. Microphone or audio-interface input is a future possibility.

## Persistence and deployment

Versioned progress is stored in localStorage on the current origin and path. The active flow works in memory if storage is unavailable. There is no account, analytics, backend or cross-device sync. Updates from other tabs are observed. If local storage is cleared, progress starts again.

The app uses hash navigation and relative Vite assets, making nested GitHub Pages locations work without rewrite rules. The production build emits a service worker and an asset list from the complete `dist` directory. The worker precaches the build, uses a scope-specific cache, and serves app navigations from the matching cached shell. Browser activation lets an existing tab finish with a consistent version before an update takes over. Production runs under HTTPS or localhost.

The app ships its typeface and hero photograph locally, so both are available offline. The built-in image generator produced [`fretboard-hero.webp`](src/assets/fretboard-hero.webp) from this prompt.

> Create a landscape editorial studio macro photograph for the right side of a dark, polished guitar learning web app hero. One real six-string electric guitar fretboard, beautiful dark rosewood, fine strings and metal frets with subtle pearl fret markers; extreme close-up perspective, neck running diagonally from the lower centre edge toward the top right, with no hands or other objects. Light falls across strings in muted lavender, violet and cool silver, with one delicate warm highlight on the wood. Very deep nearly black-blue backdrop (#12111b), subtle photographic grain and shallow depth of field. The far-left 25% smoothly falls away to plain almost black navy for blending with an overlay; keep relevant instrument detail in right 65%, let it fill the crop. Wide 3:2 landscape. Strong readable close-up realistic instrument, sophisticated subdued low-key lighting but visible wood texture. No words, typography, labels, logos or watermarks.

## Testing

Keep lightweight Vitest checks for theory and fragile learning or persistence logic. Use the existing Playwright checks selectively for flows such as resumption and offline use. Prefer a manual check when it is quicker and gives enough confidence. Add tests for specific risks and keep browser checks optional for GitHub Pages deployments.
