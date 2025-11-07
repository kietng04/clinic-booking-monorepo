import { test, expect } from '../fixtures/test-fixtures.js'
import { uniqueLabel } from '../helpers/data-factory.js'
import { assertOnRoute, assertRenderablePage } from '../helpers/ui-assertions.js'

test.describe.serial('Patient MoMo Redirect Flow', () => {
  test('redirects patient to MoMo payment page after confirm booking', async ({ patientPage }) => {
    const bookingReason = uniqueLabel('E2E MoMo Redirect')
    const orderId = `ORDER_E2E_${Date.now()}`
    const momoPayUrl = `https://test-payment.momo.vn/e2e-pay?orderId=${orderId}`

    await patientPage.route('**/api/payments', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue()
      }

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId,
          payUrl: momoPayUrl,
          redirectUrl: momoPayUrl,
          paymentMethod: 'MOMO_WALLET',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      })
    })

    await patientPage.route('**/api/appointments/*/payment-link', async (route) => {
      if (route.request().method() !== 'PATCH') {
        return route.continue()
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
        }),
      })
    })

    await patientPage.goto('/appointments/book')
    await assertOnRoute(patientPage, '/appointments/book')
    await assertRenderablePage(patientPage, { requiredText: /Chọn Bác sĩ|Chọn Bác sĩ của bạn/i })

    const searchInput = patientPage.getByTestId('booking-doctor-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('')

    const doctorCard = patientPage.locator('[data-testid^="booking-doctor-card-"]').first()
    await expect(doctorCard).toBeVisible()
    await doctorCard.getByRole('button', { name: 'Chọn' }).click()

    const dayButtons = patientPage.locator('[data-testid^="booking-day-"]')
    await expect(dayButtons.first()).toBeVisible()

    const dayCount = await dayButtons.count()
    let foundSlot = false
    for (let i = 0; i < dayCount; i += 1) {
      await dayButtons.nth(i).click()
      await patientPage.waitForTimeout(250)
      const slotCount = await patientPage.locator('[data-testid^="booking-slot-"]').count()
      if (slotCount > 0) {
        foundSlot = true
        break
      }
    }
    expect(foundSlot).toBeTruthy()

    const slotButton = patientPage.locator('[data-testid^="booking-slot-"]').first()
    await expect(slotButton).toBeVisible()
    await slotButton.click()

    const clinicSelect = patientPage.getByTestId('booking-clinic-select')
    const serviceSelect = patientPage.getByTestId('booking-service-select')
    const roomSelect = patientPage.getByTestId('booking-room-select')

    await expect(clinicSelect).toBeVisible()
    await clinicSelect.selectOption({ index: 1 })
    await expect(serviceSelect).toBeVisible()
    await serviceSelect.selectOption({ index: 1 })
    if (await roomSelect.count()) {
      await roomSelect.selectOption({ index: 1 })
    }

    await patientPage.getByTestId('booking-reason-input').fill(bookingReason)
    const notesInput = patientPage.getByTestId('booking-notes-textarea')
    if (await notesInput.count()) {
      await notesInput.fill('MoMo redirect smoke e2e')
    }

    await patientPage.getByTestId('booking-continue-button').click()
    await expect(patientPage.getByText(/Xác nhận/i).first()).toBeVisible()

    const redirectPromise = patientPage.waitForURL((url) => url.toString().startsWith('https://test-payment.momo.vn'), {
      timeout: 30_000,
    })
    await patientPage.getByTestId('booking-confirm-button').click()
    await redirectPromise

    await expect(patientPage).toHaveURL(/^https:\/\/test-payment\.momo\.vn\/e2e-pay\?orderId=ORDER_E2E_/)
  })
})
