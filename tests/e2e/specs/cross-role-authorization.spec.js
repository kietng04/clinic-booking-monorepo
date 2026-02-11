import { test, expect } from '../fixtures/test-fixtures.js'

test.describe('Cross-Role Authorization', () => {
  test('patient cannot access doctor/admin routes', async ({ patientPage }) => {
    const forbiddenRoutes = ['/doctor/appointments', '/schedule', '/users', '/admin/reports']

    for (const route of forbiddenRoutes) {
      await patientPage.goto(route)
      await expect(patientPage).toHaveURL(/\/dashboard/)
    }
  })

  test('doctor cannot access patient/admin-only routes', async ({ doctorPage }) => {
    const forbiddenRoutes = ['/appointments/book', '/family', '/users', '/admin/services']

    for (const route of forbiddenRoutes) {
      await doctorPage.goto(route)
      await expect(doctorPage).toHaveURL(/\/dashboard/)
    }
  })

  test('admin cannot access patient/doctor-only routes', async ({ adminPage }) => {
    const forbiddenRoutes = ['/appointments/book', '/doctor/appointments', '/consultations']

    for (const route of forbiddenRoutes) {
      await adminPage.goto(route)
      await expect(adminPage).toHaveURL(/\/dashboard/)
    }
  })
})
