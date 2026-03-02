import { test, expect } from '../fixtures/test-fixtures.js'
import { createNetworkObserver } from '../helpers/network-observer.js'
import { assertRenderablePage, assertOnRoute } from '../helpers/ui-assertions.js'
const SKIP_PAYMENT_CASES = process.env.E2E_SKIP_PAYMENT_CASES === 'true'

const rawPatientCases = [
  {
    name: 'dashboard overview renders with live integrations',
    path: '/dashboard',
    marker: /Tổng quan|Chào mừng/i,
  },
  {
    name: 'doctor search supports keyword query and filter panel',
    path: '/find-doctors',
    marker: /Tìm Bác sĩ|Tìm kiếm/i,
    action: async (page) => {
      await page.getByPlaceholder('Tìm theo tên bác sĩ hoặc chuyên khoa...').fill('nguyen')
      await page.getByRole('button', { name: /Tìm kiếm/i }).click()

      const filterToggle = page.locator('form button[type="button"]').first()
      if (await filterToggle.count()) {
        await filterToggle.click()
      }

      const feeInput = page.getByPlaceholder('VD: 500000')
      if (await feeInput.count()) {
        await feeInput.fill('500000')
      }

      const applyFilterButton = page.getByRole('button', { name: /Áp dụng bộ lọc/i })
      if (await applyFilterButton.count()) {
        await applyFilterButton.click()
      }

      await expect(page.getByText(/Tìm thấy|Không tìm thấy/i).first()).toBeVisible()
    },
  },
  {
    name: 'appointment list supports tab and search interactions',
    path: '/appointments',
    marker: /Lịch hẹn/i,
    action: async (page) => {
      const tabs = [/Sắp tới/i, /Đã hoàn thành/i, /Đã hủy/i]
      for (const tabName of tabs) {
        const tab = page.getByRole('button', { name: tabName }).first()
        if (await tab.count()) {
          await tab.click()
        }
      }

      const searchInput = page.getByPlaceholder(/Tìm/i).first()
      if (await searchInput.count()) {
        await searchInput.fill('zzz-e2e')
        await searchInput.clear()
      }
    },
  },
  {
    name: 'appointment detail route opens from list when available',
    path: '/appointments',
    marker: /Lịch hẹn/i,
    action: async (page) => {
      const appointmentLinks = page.locator('a[href^="/appointments/"]')
      const linkCount = await appointmentLinks.count()

      let detailLink = null
      for (let i = 0; i < linkCount; i += 1) {
        const link = appointmentLinks.nth(i)
        const href = await link.getAttribute('href')
        if (href && /\/appointments\/\d+/.test(href)) {
          detailLink = link
          break
        }
      }

      if (detailLink) {
        await detailLink.click()
        await expect(page).toHaveURL(/\/appointments\/\d+/)
        await expect(page.getByText(/Chi tiết lịch hẹn/i)).toBeVisible()
      }
    },
  },
  {
    name: 'medical records page supports search flow',
    path: '/medical-records',
    marker: /Hồ sơ bệnh án/i,
    action: async (page) => {
      const searchInput = page.getByPlaceholder('Tìm theo chẩn đoán hoặc bác sĩ...')
      if (await searchInput.count()) {
        await searchInput.fill('khong-ton-tai-e2e')
      }
    },
  },
  {
    name: 'health metrics modal supports save interaction',
    path: '/health-metrics',
    marker: /Chỉ số sức khỏe/i,
    action: async (page) => {
      const openModalButton = page.getByRole('button', { name: /Ghi|Thêm/i }).first()
      await openModalButton.click()

      const systolicInput = page.getByPlaceholder('120')
      const diastolicInput = page.getByPlaceholder('80')
      if (await systolicInput.count() && await diastolicInput.count()) {
        await systolicInput.fill('121')
        await diastolicInput.fill('79')
      }

      await page.getByRole('button', { name: /^Lưu$/i }).click()
      await expect(page.getByText(/Chỉ số sức khỏe|Ngày ghi nhận|Lưu/i).first()).toBeVisible()
    },
  },
  {
    name: 'family member modal opens and validates date field flow',
    path: '/family',
    marker: /Gia đình/i,
    action: async (page) => {
      const openModalButton = page.getByRole('button', { name: /Thêm thành viên/i }).first()
      await openModalButton.click()
      await expect(page.getByRole('heading', { name: /Thêm thành viên/i }).last()).toBeVisible()

      const memberName = `E2E Family ${Date.now()}`
      const nameInput = page.locator('label:has-text("Họ và tên") + div input').last()
      const dateInput = page.locator('label:has-text("Ngày sinh") + div input').last()
      await nameInput.fill(memberName)
      await dateInput.fill('1990-01-01')
      await expect(nameInput).toHaveValue(memberName)

      await page.getByRole('button', { name: /^Lưu$/i }).last().click()
      await expect(page.getByText(/Đã thêm thành viên/i)).toBeVisible()
      await expect(page.getByRole('heading', { name: /Thêm thành viên/i })).not.toBeVisible()
      await expect(page.getByText(memberName).first()).toBeVisible()
    },
  },
  {
    name: 'payment history supports status, method and text filters',
    path: '/payments',
    marker: /Lịch sử thanh toán/i,
    action: async (page) => {
      const selects = page.locator('select')
      const selectCount = await selects.count()
      if (selectCount >= 1) await selects.nth(0).selectOption({ index: 1 })
      if (selectCount >= 2) await selects.nth(1).selectOption({ index: 1 })

      const searchInput = page.getByPlaceholder('Tìm theo mã hóa đơn hoặc mô tả...')
      if (await searchInput.count()) {
        await searchInput.fill('E2E-PAYMENT-NOT-FOUND')
      }
    },
  },
  {
    name: 'notification center supports read and filter interactions',
    path: '/notifications',
    marker: /Thông báo|Trung tâm Thông báo/i,
    action: async (page) => {
      const readAllButton = page.getByRole('button', { name: /Đọc tất cả/i })
      if (await readAllButton.count()) {
        await readAllButton.click()
      }

      const filterButton = page.getByRole('button', { name: /Lọc/i })
      if (await filterButton.count()) {
        await filterButton.click()
      }
    },
  },
  {
    name: 'patient consultation list and create page render correctly',
    path: '/patient/consultations',
    marker: /Tư vấn trực tuyến/i,
    action: async (page) => {
      const createButton = page.getByRole('button', { name: /Tạo yêu cầu tư vấn/i }).first()
      if (await createButton.count()) {
        await createButton.click()
        await expect(page).toHaveURL(/\/patient\/consultations\/new/)
        await expect(page.getByText(/Tạo yêu cầu tư vấn/i)).toBeVisible()
      }
    },
  },
  {
    name: 'shared messages page is reachable for patient',
    path: '/messages',
    marker: /Tin nhắn|chat|messages/i,
  },
]

const patientCases = rawPatientCases.filter((featureCase) => {
  if (!SKIP_PAYMENT_CASES) return true
  return featureCase.path !== '/payments'
})

test.describe.serial('Patient Feature Contract (Deep Integration)', () => {
  for (const featureCase of patientCases) {
    test(`patient: ${featureCase.name}`, async ({ patientPage }) => {
      const observer = createNetworkObserver(patientPage)

      await patientPage.goto(featureCase.path)
      await assertOnRoute(patientPage, featureCase.path)
      await assertRenderablePage(patientPage, { requiredText: featureCase.marker })

      if (featureCase.action) {
        await featureCase.action(patientPage)
      }

      await observer.expectNoBlockingEvents()
      observer.stop()
    })
  }
})
