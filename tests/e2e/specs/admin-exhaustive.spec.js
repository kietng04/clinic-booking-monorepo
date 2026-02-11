import { test } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

const ADMIN_PAGES = [
  { path: '/dashboard', marker: /Quản trị|Tổng quan/i },
  { path: '/users', marker: /Quản lý người dùng|người dùng/i },
  { path: '/doctors', marker: /Quản lý bác sĩ|bác sĩ/i },
  { path: '/admin/clinics', marker: /Phòng khám/i },
  { path: '/admin/services', marker: /Dịch vụ/i },
  { path: '/admin/rooms', marker: /Phòng/i },
  { path: '/admin/reports', marker: /Báo cáo/i },
  { path: '/profile', marker: /Cài đặt tài khoản/i },
]

test.describe.serial('Admin Exhaustive Flows (Real Backend)', () => {
  test('admin management pages render and remain stable', async ({ adminPage }) => {
    const observer = createNetworkObserver(adminPage)

    for (const pageConfig of ADMIN_PAGES) {
      await adminPage.goto(pageConfig.path)
      await assertOnRoute(adminPage, pageConfig.path)
      await assertRenderablePage(adminPage, { requiredText: pageConfig.marker })
    }

    await observer.expectNoBlockingEvents()
    observer.stop()
  })
})
