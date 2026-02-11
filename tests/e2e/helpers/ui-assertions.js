import { expect } from '@playwright/test'

export async function assertRenderablePage(page, options = {}) {
  const { requiredText } = options

  await page.waitForLoadState('domcontentloaded')

  const bodyLength = await page.locator('body').evaluate((el) => (el.innerText || '').trim().length)
  expect(bodyLength).toBeGreaterThan(30)

  const candidateCounts = await Promise.all([
    page.locator('h1').count(),
    page.locator('[role="heading"]').count(),
    page.locator('form').count(),
    page.locator('table').count(),
    page.locator('button').count(),
  ])

  expect(candidateCounts.some((count) => count > 0)).toBeTruthy()

  if (requiredText) {
    await expect(page.getByText(requiredText, { exact: false }).first()).toBeVisible()
  }
}

export async function assertOnRoute(page, pathPrefix) {
  await expect.poll(() => new URL(page.url()).pathname.startsWith(pathPrefix)).toBeTruthy()
}
