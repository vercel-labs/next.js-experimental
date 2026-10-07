import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Short timeout so the blocked navigation inside instant() times out quickly.
  timeout: 20_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'next start -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
