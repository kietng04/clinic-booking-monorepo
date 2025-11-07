import { test, expect } from '../fixtures/test-fixtures.js'
import { E2E_ACCOUNTS } from '../helpers/auth-accounts.js'
import {
  assertAppointmentNotPersisted,
  assertAppointmentPersisted,
  assertConsultationPersisted,
  closeDbPools,
} from '../helpers/db-assertions.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { uniqueLabel } from '../helpers/data-factory.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

const SKIP_PAYMENT_CASES = process.env.E2E_SKIP_PAYMENT_CASES === 'true'

test.describe.serial('Patient Exhaustive Flows (Real Backend)', () => {
  test.afterAll(async () => {
    await closeDbPools()
  })

  test('patient books appointment end-to-end', async ({ patientPage }) => {
    const observer = createNetworkObserver(patientPage)
    const bookingReason = uniqueLabel('E2E Booking')

    await patientPage.goto('/appointments/book')
    await assertOnRoute(patientPage, '/appointments/book')
    await assertRenderablePage(patientPage, { requiredText: /Chọn Bác sĩ|Chọn Bác sĩ của bạn/i })

    const searchInput = patientPage.getByTestId('booking-doctor-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('')

    const doctorCard = patientPage.locator('[data-testid^="booking-doctor-card-"]').first()
    if (await doctorCard.isVisible().catch(() => false)) {
      await doctorCard.getByRole('button', { name: 'Chọn' }).click()
    } else {
      await patientPage.getByRole('button', { name: /^Chọn$/ }).first().click()
    }

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
      await notesInput.fill('Automated E2E booking flow')
    }

    await patientPage.getByTestId('booking-continue-button').click()
    await expect(patientPage.getByText(/Xác nhận/i).first()).toBeVisible()

    if (SKIP_PAYMENT_CASES) {
      await assertAppointmentNotPersisted({
        patientEmail: E2E_ACCOUNTS.PATIENT.email,
        symptoms: bookingReason,
      })
      await observer.expectNoBlockingEvents()
      observer.stop()
      return
    }

    await patientPage.getByTestId('booking-confirm-button').click()
    await patientPage.waitForURL('**/appointments')
    await expect(patientPage.getByText(bookingReason, { exact: false })).toBeVisible()
    await assertAppointmentPersisted({
      patientEmail: E2E_ACCOUNTS.PATIENT.email,
      symptoms: bookingReason,
      notesContains: 'Automated E2E booking flow',
    })

    await observer.expectNoBlockingEvents()
    observer.stop()
  })

  test('patient creates consultation request and opens consultation chat', async ({ patientPage }) => {
    const observer = createNetworkObserver(patientPage)
    const topic = uniqueLabel('E2E Consultation Topic')

    await patientPage.goto('/patient/consultations/new')
    await assertOnRoute(patientPage, '/patient/consultations/new')
    await assertRenderablePage(patientPage, { requiredText: /Tạo yêu cầu tư vấn/i })

    const doctorSelect = patientPage.getByTestId('consultation-doctor-select')
    await expect(doctorSelect).toBeVisible()
    await doctorSelect.selectOption({ index: 1 })

    await patientPage.getByTestId('consultation-topic-input').fill(topic)
    await patientPage.getByTestId('consultation-description-input').fill('Chi tiet trieu chung cho test e2e.')

    await patientPage.getByTestId('consultation-submit-button').click()

    let routedToDetail = false
    try {
      await patientPage.waitForURL(/\/patient\/consultations\/\d+$/, { timeout: 15_000 })
      routedToDetail = true
      await assertRenderablePage(patientPage)
    } catch {
      await assertOnRoute(patientPage, '/patient/consultations/new')
      await assertRenderablePage(patientPage, { requiredText: /Tạo yêu cầu tư vấn|Tư vấn/i })
    }

    await patientPage.goto('/patient/consultations')
    await assertOnRoute(patientPage, '/patient/consultations')
    if (routedToDetail) {
      await expect(patientPage.getByText(topic, { exact: false })).toBeVisible()
    } else {
      await assertRenderablePage(patientPage, { requiredText: /Tư vấn trực tuyến|Tư vấn/i })
    }
    await assertConsultationPersisted({
      patientEmail: E2E_ACCOUNTS.PATIENT.email,
      topic,
      descriptionContains: 'Chi tiet trieu chung cho test e2e.',
    })

    await observer.expectNoBlockingEvents()
    observer.stop()
  })

  test('patient profile and settings pages render', async ({ patientPage }) => {
    const pages = [
      { path: '/profile', marker: /Cài đặt tài khoản/i },
      { path: '/profile/security', marker: /Bảo mật tài khoản/i },
      { path: '/profile/notifications', marker: /Cài đặt thông báo/i },
    ]

    for (const item of pages) {
      await patientPage.goto(item.path)
      await assertOnRoute(patientPage, item.path)
      await assertRenderablePage(patientPage, { requiredText: item.marker })
    }
  })
})
