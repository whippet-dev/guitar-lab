# Guitar Lab

A personal, iPhone-first guitar and music theory app with guided five-minute practice, an interactive fretboard and offline learning. See the [product and development principles](PRODUCT.md) before making significant changes.

## Run locally

Use Node.js 22.12 or later on a supported, even-numbered release line (Node.js 24 LTS recommended).

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. For service worker and installation testing, use the production preview.

```sh
npm run build
npm run preview
```

Open `http://localhost:4173`. Visit online once to cache the app. On an iPhone, open a deployed HTTPS copy in Safari, choose **Share → Add to Home Screen**, and enable **Open as Web App** when offered. Open the installed app online before going offline. Progress stays in the storage context where you practised. [Apple’s iPhone guide](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios)

Open **Sound** using the speaker icon to choose clean electric guitar, steel-string acoustic guitar or a pure reference tone. Both guitar banks are included in the offline cache.

## Checks

```sh
npm test
npm run build
```

For UI changes, a quick manual check on iPhone and Windows is often enough. Use the browser suite when it helps verify a fragile flow such as session resumption or offline use.

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite launches its own production build under a test subpath. To use an installed Chromium browser instead, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable before running the suite. For the iPhone viewport in WebKit, run `npx playwright install webkit` and set `PLAYWRIGHT_WEBKIT=1`. Emulated WebKit shares the viewport and rendering engine with iPhone Safari and can differ in media and installation support. [Playwright browser documentation](https://playwright.dev/docs/browsers)

## GitHub Pages

Push this project to a GitHub repository with a `main` branch and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow runs the unit tests, builds and deploys `dist`. The browser suite is optional and runs locally. Both root and repository-subpath Pages URLs are supported. [Vite static deployment guide](https://vite.dev/guide/static-deploy)

- [Curriculum](CURRICULUM.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Guitar recording sources and licences](public/audio-credits.txt)
