import { test, expect } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

test.describe.serial('Doctor Exhaustive Flows (Real Backend)', () => {
  test('doctor core dashboards and workflows render', async ({ doctorPage }) => {
    const observer = createNetworkObserver(doctorPage)

    await doctorPage.goto('/dashboard')
    await assertOnRoute(doctorPage, '/dashboard')
    await assertRenderablePage(doctorPage, { requiredText: /Tổng quan|Hôm nay|Lịch hẹn/i })

    await doctorPage.goto('/doctor/appointments')
    await assertOnRoute(doctorPage, '/doctor/appointments')
    await assertRenderablePage(doctorPage, { requiredText: /Lịch hẹn/i })

    for (const tabName of ['Hôm nay', 'Sắp tới', 'Đã hoàn thành']) {
      const tab = doctorPage.getByRole('button', { name: tabName }).first()
      if (await tab.isVisible().catch(() => false)) {
        await tab.click()
      }
    }

    await doctorPage.goto('/patients')
    await assertOnRoute(doctorPage, '/patients')
    await assertRenderablePage(doctorPage, { requiredText: /Bệnh nhân/i })

    const searchBox = doctorPage.getByPlaceholder('Tìm theo tên hoặc số điện thoại...')
    if (await searchBox.isVisible().catch(() => false)) {
      await searchBox.fill('zzz_non_existing_patient')
      await doctorPage.waitForTimeout(250)
    }

    await doctorPage.goto('/consultations')
    await assertOnRoute(doctorPage, '/consultations')
    await assertRenderablePage(doctorPage, { requiredText: /Tư vấn/i })

    await doctorPage.goto('/doctor/analytics')
    await assertOnRoute(doctorPage, '/doctor/analytics')
    await assertRenderablePage(doctorPage, { requiredText: /Thống kê|Analytics/i })

    const hasChart = await doctorPage.locator('svg.recharts-surface').count()
    const hasNoData = await doctorPage.getByText(/No data available|Chưa có dữ liệu|Không có dữ liệu/i).count()
    expect(hasChart > 0 || hasNoData > 0).toBeTruthy()

    await doctorPage.goto('/profile')
    await assertOnRoute(doctorPage, '/profile')
    await assertRenderablePage(doctorPage, { requiredText: /Cài đặt tài khoản/i })

    await observer.expectNoBlockingEvents()
    observer.stop()
  })
})
