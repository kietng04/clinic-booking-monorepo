import { test } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'

const adminCases = [
  {
    name: 'dashboard renders aggregate statistics and activities',
    path: '/dashboard',
    marker: /Quản trị|Tổng quan hệ thống|Tổng người dùng/i,
  },
  {
    name: 'user management supports search, role filter and modal open',
    path: '/users',
    marker: /người dùng|Quản lý người dùng/i,
    action: async (page) => {
      const searchInput = page.getByPlaceholder('Tìm theo tên hoặc email...')
      await searchInput.fill('admin')

      const roleSelect = page.locator('select').first()
      await roleSelect.selectOption('DOCTOR')
      await roleSelect.selectOption('all')

      await page.getByRole('button', { name: /Thêm người dùng/i }).click()
      await page.getByRole('button', { name: /Hủy|cancel/i }).first().click()
    },
  },
  {
    name: 'doctor management supports tabs, search and detail modal',
    path: '/doctors',
    marker: /bác sĩ|Quản lý bác sĩ/i,
    action: async (page) => {
      const tabs = [/Tất cả/i, /Chờ duyệt/i, /Đã duyệt|Đã phê duyệt/i, /Từ chối/i]
      for (const tabName of tabs) {
        const tab = page.getByRole('button', { name: tabName }).first()
        if (await tab.count()) {
          await tab.click()
        }
      }

      await page.getByPlaceholder('Tìm theo tên hoặc chuyên khoa...').fill('nội')
      const detailButton = page.getByRole('button', { name: /chi tiết|doctor details/i }).first()
      if (await detailButton.count()) {
        await detailButton.click()
        const cancelButton = page.getByRole('button', { name: /Hủy|cancel/i }).first()
        if (await cancelButton.count()) {
          await cancelButton.click()
        } else {
          const modalCloseButton = page.locator('div.fixed.inset-0.z-50 button').first()
          if (await modalCloseButton.count()) {
            await modalCloseButton.click()
          }
        }
      }
    },
  },
  {
    name: 'clinic management supports search and open create modal',
    path: '/admin/clinics',
    marker: /Phòng khám|Quản lý Phòng khám/i,
    action: async (page) => {
      await page.getByPlaceholder('Tìm theo tên hoặc địa chỉ...').fill('clinic')
      await page.getByRole('button', { name: /Thêm phòng khám/i }).click()
      await page.getByRole('button', { name: /Hủy|cancel/i }).first().click()
    },
  },
  {
    name: 'service management supports search and filter selectors',
    path: '/admin/services',
    marker: /Dịch vụ|Quản lý Dịch vụ/i,
    action: async (page) => {
      await page.getByPlaceholder('Tìm dịch vụ...').fill('xét nghiệm')

      const selects = page.locator('select')
      const selectCount = await selects.count()
      if (selectCount >= 1) await selects.nth(0).selectOption({ index: 1 })
      if (selectCount >= 2) await selects.nth(1).selectOption({ index: 1 })
    },
  },
  {
    name: 'room management supports search and clinic filter',
    path: '/admin/rooms',
    marker: /Phòng|Quản lý Phòng/i,
    action: async (page) => {
      await page.getByPlaceholder('Tìm theo tên phòng...').fill('phòng')

      const clinicSelect = page.locator('select').first()
      if (await clinicSelect.count()) {
        await clinicSelect.selectOption({ index: 1 })
      }
    },
  },
  {
    name: 'reports page supports tab switching and controls',
    path: '/admin/reports',
    marker: /Báo cáo/i,
    action: async (page) => {
      const tabs = [/Lịch hẹn/i, /Doanh thu/i, /Bệnh nhân/i]
      for (const tabName of tabs) {
        await page.getByRole('button', { name: tabName }).first().click()
      }

      const selects = page.locator('select')
      const selectCount = await selects.count()
      if (selectCount >= 1) await selects.nth(0).selectOption('30days')
      if (selectCount >= 2) await selects.nth(1).selectOption('week')
    },
  },
  {
    name: 'shared profile page is reachable for admin',
    path: '/profile',
    marker: /Cài đặt tài khoản|Quản lý thông tin/i,
  },
]

test.describe.serial('Admin Feature Contract (Deep Integration)', () => {
  for (const featureCase of adminCases) {
    test(`admin: ${featureCase.name}`, async ({ adminPage }) => {
      const observer = createNetworkObserver(adminPage)

      await adminPage.goto(featureCase.path)
      await assertOnRoute(adminPage, featureCase.path)
      await assertRenderablePage(adminPage, { requiredText: featureCase.marker })

      if (featureCase.action) {
        await featureCase.action(adminPage)
      }

      await observer.expectNoBlockingEvents()
      observer.stop()
    })
  }
})
