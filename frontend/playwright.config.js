// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['setup/**/*.setup.js', 'specs/**/*.spec.js'],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  globalSetup: './tests/e2e/setup/global.setup.js',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'setup',
      testMatch: 'setup/**/*.setup.js',
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testMatch: 'specs/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_USE_MOCK_BACKEND: 'false',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
    },
  },
  outputDir: 'test-results/playwright-artifacts',
});
