import { test, expect } from '@playwright/test'

test.describe('Patient Booking Smoke', () => {
  test('patient books appointment end-to-end in mock mode', async ({ page }) => {
    const uniqueReason = `E2E booking ${Date.now()}`

    await page.goto('/login')

    await page.getByRole('button', { name: 'Bệnh nhân' }).click()
    await page.waitForURL(/\/dashboard/)

    await page.screenshot({ path: 'tests-output/patient-booking-login.png', fullPage: true })

    await page.goto('/appointments/book')
    await page.getByText('Chọn Bác sĩ', { exact: false }).first().waitFor()

    const searchInput = page.locator('input[placeholder*="Tìm theo tên hoặc chuyên khoa"]')
    await searchInput.fill('Sarah')

    const doctorCard = page.locator('div.cursor-pointer:has(button:has-text("Chọn"))').first()
    await doctorCard.waitFor()
    const doctorName = ((await doctorCard.locator('h3').first().textContent()) || '').trim()
    await doctorCard.click()

    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('button')).some((btn) =>
        /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*\d{1,2}/.test((btn.textContent || '').trim())
      )
    )

    await page.screenshot({ path: 'tests-output/patient-booking-doctor-selected.png', fullPage: true })

    const dayButtons = page.locator('button').filter({ hasText: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*\d{1,2}/ })
    const dayCount = await dayButtons.count()
    expect(dayCount).toBeGreaterThan(0)

    let foundSlot = false
    for (let i = 0; i < dayCount; i += 1) {
      await dayButtons.nth(i).click()
      await page.waitForTimeout(400)
      const slotCount = await page.locator('button').filter({ hasText: /^\d{1,2}:\d{2}/ }).count()
      if (slotCount > 0) {
        foundSlot = true
        break
      }
    }

    expect(foundSlot).toBeTruthy()

    const slotButton = page.locator('button').filter({ hasText: /^\d{1,2}:\d{2}/ }).first()
    await slotButton.click()

    await page.getByText('Thông tin Chi tiết', { exact: false }).first().waitFor()
    await page.screenshot({ path: 'tests-output/patient-booking-time-selected.png', fullPage: true })

    const clinicSelect = page.locator('label:has-text("Phòng khám *")').locator('..').locator('select')
    const serviceSelect = page.locator('label:has-text("Dịch vụ *")').locator('..').locator('select')
    const roomSelect = page.locator('label:has-text("Phòng khám cụ thể *")').locator('..').locator('select')

    await clinicSelect.selectOption({ index: 1 })
    await serviceSelect.selectOption({ index: 1 })
    if (await roomSelect.count()) {
      await roomSelect.selectOption({ index: 1 })
    }

    await page.locator('label:has-text("Lý do khám bệnh")').locator('..').locator('input').fill(uniqueReason)
    await page.locator('label:has-text("Ghi chú thêm")').locator('..').locator('textarea').fill('Smoke test booking flow')

    await page.getByRole('button', { name: 'Tiếp tục' }).click()
    await page.getByText('Xác nhận', { exact: false }).first().waitFor()

    await page.screenshot({ path: 'tests-output/patient-booking-confirm.png', fullPage: true })

    await page.getByRole('button', { name: /Xác nhận Booking/i }).click()
    await page.waitForURL(/\/appointments/)

    await expect(page.getByRole('heading', { name: /Lịch hẹn của tôi/i })).toBeVisible()
    await expect(page.getByText(doctorName, { exact: false }).first()).toBeVisible()
    await expect(page.getByText(uniqueReason, { exact: false })).toBeVisible()

    await page.screenshot({ path: 'tests-output/patient-booking-appointments-list.png', fullPage: true })
  })
})
