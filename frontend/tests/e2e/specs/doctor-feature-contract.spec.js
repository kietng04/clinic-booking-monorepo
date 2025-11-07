import { test, expect } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

const doctorCases = [
  {
    name: 'dashboard overview renders with doctor metrics',
    path: '/dashboard',
    marker: /Tổng quan|Lịch hẹn hôm nay|Chào buổi/i,
  },
  {
    name: 'doctor appointments supports tab switching and detail actions',
    path: '/doctor/appointments',
    marker: /Lịch hẹn/i,
    action: async (page) => {
      const tabs = [/Hôm nay/i, /Sắp tới/i, /Đã hoàn thành/i]
      for (const tabName of tabs) {
        const tab = page.getByRole('button', { name: tabName }).first()
        if (await tab.count()) {
          await tab.click()
        }
      }
    },
  },
  {
    name: 'doctor schedule supports time update and save flow',
    path: '/schedule',
    marker: /Lịch làm việc/i,
    action: async (page) => {
      const timeInputs = page.locator('input[type="time"]')
      if (await timeInputs.count()) {
        await timeInputs.first().fill('08:30')
      }

      const saveButton = page.getByRole('button', { name: /Lưu lịch làm việc|Đang lưu/i })
      await saveButton.click()
      await expect(page.getByText(/Lưu ý|Lịch làm việc/i).first()).toBeVisible()
    },
  },
  {
    name: 'doctor patient list supports search and profile modal',
    path: '/patients',
    marker: /Bệnh nhân/i,
    action: async (page) => {
      const searchInput = page.getByPlaceholder('Tìm theo tên hoặc số điện thoại...')
      if (await searchInput.count()) {
        await searchInput.fill('zzz-e2e-no-result')
        await searchInput.clear()
      }

      const viewProfileButton = page.getByRole('button', { name: /Xem hồ sơ/i }).first()
      if (await viewProfileButton.count()) {
        await viewProfileButton.click()
        const closeButton = page.locator('div.fixed.inset-0.z-50 button').first()
        if (await closeButton.count()) {
          await closeButton.click()
        }
      }
    },
  },
  {
    name: 'doctor consultation board supports tab and search interactions',
    path: '/consultations',
    marker: /Tư vấn trực tuyến|Tư vấn/i,
    action: async (page) => {
      const tabs = [/Chờ duyệt/i, /Đang tư vấn/i, /Đã hoàn thành/i, /Tất cả/i]
      for (const tabName of tabs) {
        const tab = page.getByRole('button', { name: tabName }).first()
        if (await tab.count()) {
          await tab.click()
        }
      }

      const searchInput = page.getByPlaceholder('Tìm kiếm theo bệnh nhân hoặc chủ đề...')
      if (await searchInput.count()) {
        await searchInput.fill('khong-co-du-lieu-e2e')
      }
    },
  },
  {
    name: 'doctor analytics page renders chart surfaces',
    path: '/doctor/analytics',
    marker: /Thống kê|Phân tích/i,
    action: async (page) => {
      const chartCount = await page.locator('svg.recharts-surface').count()
      const noDataCount = await page.getByText(/No data available|Chưa có dữ liệu/i).count()
      expect(chartCount > 0 || noDataCount > 0).toBeTruthy()
    },
  },
  {
    name: 'create medical record page is reachable',
    path: '/doctor/create-medical-record',
    allowedRoutePrefixes: ['/doctor/create-medical-record', '/doctor/appointments'],
    marker: /Tạo hồ sơ bệnh án|Lịch hẹn|Không tìm thấy thông tin lịch hẹn/i,
  },
  {
    name: 'shared messages page is reachable for doctor',
    path: '/messages',
    marker: /Tin nhắn|chat|messages/i,
  },
]

test.describe.serial('Doctor Feature Contract (Deep Integration)', () => {
  for (const featureCase of doctorCases) {
    test(`doctor: ${featureCase.name}`, async ({ doctorPage }) => {
      const observer = createNetworkObserver(doctorPage)

      await doctorPage.goto(featureCase.path)
      if (featureCase.allowedRoutePrefixes?.length) {
        await expect
          .poll(() => {
            const pathname = new URL(doctorPage.url()).pathname
            return featureCase.allowedRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
          })
          .toBeTruthy()
      } else {
        await assertOnRoute(doctorPage, featureCase.path)
      }
      await assertRenderablePage(doctorPage, { requiredText: featureCase.marker })

      if (featureCase.action) {
        await featureCase.action(doctorPage)
      }

      await observer.expectNoBlockingEvents()
      observer.stop()
    })
  }
})
