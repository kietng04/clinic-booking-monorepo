import { expect } from '@playwright/test'

export async function clearBrowserSession(page) {
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('/login')
}

export async function loginWithCredentials(page, credentials) {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeVisible()

  const emailInput = page.locator('label:has-text("Email hoặc Số điện thoại")').locator('..').locator('input').first()
  const passwordInput = page.locator('label:has-text("Mật khẩu")').locator('..').locator('input').first()

  await emailInput.fill(credentials.email)
  await passwordInput.fill(credentials.password)
  await page.getByRole('button', { name: /Đăng nhập/i }).click()
  await page.waitForURL('**/dashboard')

  const hasToken = await page.evaluate(() => Boolean(localStorage.getItem('accessToken')))
  expect(hasToken).toBeTruthy()
}
