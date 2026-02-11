import { test, expect } from '../fixtures/test-fixtures.js'
import { PUBLIC_ROUTES, ROLE_ROUTES } from '../contracts/routeCoverage.contract.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

test.describe('Public Route Coverage', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`public route renders: ${route.path}`, async ({ page }) => {
      await page.goto(route.path)
      await assertRenderablePage(page, { requiredText: route.marker })
    })
  }
})

test.describe('Role Route Smoke Coverage', () => {
  test('patient routes render without redirect', async ({ patientPage }) => {
    for (const route of ROLE_ROUTES.PATIENT) {
      await patientPage.goto(route.path)
      await assertOnRoute(patientPage, route.path)
      await assertRenderablePage(patientPage, { requiredText: route.marker })
    }
  })

  test('doctor routes render without redirect', async ({ doctorPage }) => {
    for (const route of ROLE_ROUTES.DOCTOR) {
      await doctorPage.goto(route.path)
      await assertOnRoute(doctorPage, route.path)
      await assertRenderablePage(doctorPage, { requiredText: route.marker })
    }
  })

  test('admin routes render without redirect', async ({ adminPage }) => {
    for (const route of ROLE_ROUTES.ADMIN) {
      await adminPage.goto(route.path)
      await assertOnRoute(adminPage, route.path)
      await assertRenderablePage(adminPage, { requiredText: route.marker })
    }
  })

  test('dynamic route without auth redirects to login', async ({ page }) => {
    await page.goto('/appointments/1')
    await expect(page).toHaveURL(/\/login/)
  })
})
