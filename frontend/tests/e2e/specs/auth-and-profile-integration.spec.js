import { test, expect } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertOnRoute, assertRenderablePage } from '../helpers/ui-assertions.js'

const logoutFromNavbar = async (page, userNamePattern) => {
  const profileToggle = page.getByRole('button', { name: userNamePattern }).first()
  if (await profileToggle.isVisible().catch(() => false)) {
    await profileToggle.click()
    const logoutButton = page.getByRole('button', { name: /Đăng xuất/i })
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click()
      await expect(page).toHaveURL(/\/login/)
      return
    }
  }

  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.context().clearCookies()
  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)
}

const quickLoginAndAssert = async (page, { roleTestId, sidebarTestId, userNamePattern }) => {
  let lastError

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId(roleTestId)).toBeEnabled()
    await page.getByTestId(roleTestId).click()

    try {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
      await expect(page.getByTestId(sidebarTestId)).toBeVisible()

      if (userNamePattern) {
        await logoutFromNavbar(page, userNamePattern)
      }
      return
    } catch (error) {
      lastError = error
      if (attempt === 2) break

      await page.goto('/')
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      await page.context().clearCookies()
      await page.goto('/login')
    }
  }

  throw lastError
}

test.describe.serial('Auth and Profile Integration', () => {
  test('quick login buttons work for all roles and land on correct sidebar', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/login')

    await quickLoginAndAssert(page, {
      roleTestId: 'quick-login-patient',
      sidebarTestId: 'sidebar-patient',
      userNamePattern: /Nguyen Van A|patient/i,
    })

    await quickLoginAndAssert(page, {
      roleTestId: 'quick-login-doctor',
      sidebarTestId: 'sidebar-doctor',
      userNamePattern: /Dr\. Sarah Johnson|doctor/i,
    })

    await quickLoginAndAssert(page, {
      roleTestId: 'quick-login-admin',
      sidebarTestId: 'sidebar-admin',
    })
  })

  test('forgot password flow accepts valid email request', async ({ page }) => {
    const observer = createNetworkObserver(page)
    await page.goto('/forgot-password')
    await assertOnRoute(page, '/forgot-password')
    await assertRenderablePage(page, { requiredText: /Quên mật khẩu/i })

    await page.getByPlaceholder('email@example.com').fill('patient1@clinic.com')
    await page.getByRole('button', { name: /Gửi link đặt lại/i }).click()
    await expect(page.getByText(/Email đã gửi/i)).toBeVisible()

    await observer.expectNoBlockingEvents()
    observer.stop()
  })

  test('register form keeps user on page when passwords do not match', async ({ page }) => {
    await page.goto('/register')
    await assertOnRoute(page, '/register')

    await page.getByPlaceholder('John Anderson').fill('E2E Register User')
    await page.getByPlaceholder('john@example.com').fill(`e2e.${Date.now()}@example.com`)
    await page.getByPlaceholder('+1 (555) 000-0000').fill('0909999000')

    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.nth(0).fill('password123')
    await passwordInputs.nth(1).fill('password123-mismatch')

    await page.locator('input[type="checkbox"]').check()
    await page.getByRole('button', { name: /Create Account/i }).click()

    await expect(page).toHaveURL(/\/register/)
  })

  test('patient profile settings page can submit update call', async ({ patientPage }) => {
    const observer = createNetworkObserver(patientPage)
    await patientPage.goto('/profile')
    await assertOnRoute(patientPage, '/profile')
    await assertRenderablePage(patientPage, { requiredText: /Cài đặt tài khoản/i })

    await patientPage.getByRole('button', { name: /Lưu thay đổi/i }).click()
    await expect(patientPage.getByText(/Cài đặt tài khoản/i)).toBeVisible()

    await observer.expectNoBlockingEvents()
    observer.stop()
  })

  test('patient security settings validates mismatch password before API call', async ({ patientPage }) => {
    await patientPage.goto('/profile/security')
    await assertOnRoute(patientPage, '/profile/security')
    await assertRenderablePage(patientPage, { requiredText: /Bảo mật tài khoản/i })

    const passwordInputs = patientPage.locator('input[type="password"]')
    await passwordInputs.nth(0).fill('password')
    await passwordInputs.nth(1).fill('new-password-123')
    await passwordInputs.nth(2).fill('different-password-456')

    await patientPage.getByRole('button', { name: /Cập nhật mật khẩu/i }).click()
    await expect(patientPage.getByText(/Mật khẩu không khớp/i).first()).toBeVisible()
  })

  test('patient notification settings page can submit save action', async ({ patientPage }) => {
    const observer = createNetworkObserver(patientPage)
    await patientPage.goto('/profile/notifications')
    await assertOnRoute(patientPage, '/profile/notifications')
    await assertRenderablePage(patientPage, { requiredText: /Cài đặt thông báo/i })

    await patientPage.getByRole('button', { name: /Lưu cài đặt/i }).click()
    await expect(patientPage.getByRole('heading', { name: /Cài đặt thông báo/i })).toBeVisible()

    await observer.expectNoBlockingEvents()
    observer.stop()
  })
})
