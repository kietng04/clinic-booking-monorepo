import { test, expect } from '../fixtures/test-fixtures.js'
import { assertRenderablePage } from '../helpers/ui-assertions.js'

test.describe('Negative and Resilience Scenarios', () => {
  test('unauthenticated user is redirected to login for protected routes', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/appointments/book', '/doctor/appointments', '/users']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
      await expect(page.getByRole('heading', { name: /Chào mừng trở lại/i })).toBeVisible()
    }
  })

  test('invalid patient consultation id renders graceful state', async ({ patientPage }) => {
    await patientPage.goto('/patient/consultations/999999')
    await expect.poll(() => {
      const pathname = new URL(patientPage.url()).pathname
      return pathname === '/patient/consultations/999999' || pathname === '/patient/consultations'
    }).toBeTruthy()
    await expect(patientPage.getByRole('link', { name: /Tư vấn trực tuyến/i })).toBeVisible()
    await expect(patientPage.locator('main')).toBeVisible()
  })

  test('unknown route is redirected to landing page', async ({ page }) => {
    await page.goto('/unknown-route-e2e')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText(/HealthFlow|Sức khỏe/i).first()).toBeVisible()
  })
})
