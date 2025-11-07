import { expect } from '@playwright/test'

export async function clearBrowserSession(page) {
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('/login')
}

const settleLoginNavigation = async (page) => {
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })
    return true
  } catch {
    const hasToken = await page.evaluate(() => Boolean(localStorage.getItem('accessToken')))
    if (!hasToken) return false

    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
    return true
  }
}

export async function loginWithCredentials(page, credentials) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.context().clearCookies()

  let loggedIn = false
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeVisible()

    const emailInput = page
      .locator('label:has-text("Email hoặc Số điện thoại")')
      .locator('..')
      .locator('input')
      .first()
    const passwordInput = page.locator('label:has-text("Mật khẩu")').locator('..').locator('input').first()

    await emailInput.fill(credentials.email)
    await passwordInput.fill(credentials.password)
    await page.getByRole('button', { name: /Đăng nhập/i }).click()

    loggedIn = await settleLoginNavigation(page)
    if (loggedIn) break

    if (attempt < 3) {
      await page.waitForTimeout(1_000)
    }
  }

  expect(loggedIn).toBeTruthy()
  const hasToken = await page.evaluate(() => Boolean(localStorage.getItem('accessToken')))
  expect(hasToken).toBeTruthy()
}
