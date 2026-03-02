// @ts-check
import { defineConfig } from '@playwright/test';

/**
 * Dedicated config for fail-verification cases generated from sheet summaries.
 */
export default defineConfig({
  testDir: './tests/e2e/specs/sheet-fail-generated',
  testMatch: ['**/*.spec.js'],
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
    ['html', { open: 'never', outputFolder: 'playwright-report/sheet-fail-generated' }],
    ['json', { outputFile: 'test-results/e2e-sheet-fail-results.json' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'off',
    video: 'off',
  },
  outputDir: 'test-results/playwright-sheet-fail-artifacts',
});
