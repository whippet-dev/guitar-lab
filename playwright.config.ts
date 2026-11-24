import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:4174/guitar-lab/'
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
const useWebKit = process.env.PLAYWRIGHT_WEBKIT === '1'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } } },
    {
      name: 'iPhone viewport',
      use: {
        ...devices['iPhone 14'],
        browserName: useWebKit ? 'webkit' : 'chromium',
        launchOptions: useWebKit ? {} : { executablePath },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4174 --strictPort --base /guitar-lab/',
    url: baseURL,
    timeout: 60_000,
  },
})
