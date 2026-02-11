import { test, expect } from '../fixtures/test-fixtures.js'
import { E2E_ACCOUNTS } from '../helpers/auth-accounts.js'
import { loginWithCredentials } from '../helpers/session.js'

const fillLoginForm = async (page, email, password) => {
  const emailInput = page.locator('label:has-text("Email hoặc Số điện thoại")').locator('..').locator('input').first()
  const passwordInput = page.locator('label:has-text("Mật khẩu")').locator('..').locator('input').first()
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await page.getByRole('button', { name: /Đăng nhập/i }).click()
}

test.describe('Auth Flows (Real Backend)', () => {
  test('login page renders quick demo buttons', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /Bệnh nhân/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Bác sĩ/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Quản trị/i })).toBeVisible()
  })

  test('invalid credentials show login error', async ({ page }) => {
    await page.goto('/login')
    await fillLoginForm(page, 'invalid-user@clinic.com', 'wrong-password')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible()
  })

  test('patient login succeeds', async ({ page }) => {
    await loginWithCredentials(page, E2E_ACCOUNTS.PATIENT)
    await expect(page.getByTestId('sidebar-link-appointments-book').first()).toBeVisible()
  })

  test('doctor login succeeds', async ({ page }) => {
    await loginWithCredentials(page, E2E_ACCOUNTS.DOCTOR)
    await expect(page.getByTestId('sidebar-link-doctor-appointments').first()).toBeVisible()
  })

  test('admin login succeeds', async ({ page }) => {
    await loginWithCredentials(page, E2E_ACCOUNTS.ADMIN)
    await expect(page.getByTestId('sidebar-link-users').first()).toBeVisible()
  })
})
