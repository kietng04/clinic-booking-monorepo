import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const baseUrl = 'http://localhost:4173'
const outDir = '/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/tests-output'
const shotDir = path.join(outDir, 'screenshots-real')
const reportPath = path.join(outDir, 'doctor-dashboard-report.md')

await fs.mkdir(shotDir, { recursive: true })

const steps = []
const selectorIssues = []
const routeIssues = []
const networkIssues = []
const screenshotPaths = {}
const apiCalls = []

const mark = (name, passed, details = '') => steps.push({ name, passed, details })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const isApiRequest = (url) => {
  try {
    const u = new URL(url)
    return u.pathname.startsWith('/api/')
  } catch {
    return false
  }
}

page.on('requestfailed', (req) => {
  if (!isApiRequest(req.url())) return
  const item = {
    type: 'requestfailed',
    method: req.method(),
    url: req.url(),
    status: null,
    error: req.failure()?.errorText || 'unknown',
  }
  apiCalls.push(item)
  networkIssues.push(item)
})

page.on('response', (res) => {
  if (!isApiRequest(res.url())) return
  const item = {
    type: 'http',
    method: res.request().method(),
    url: res.url(),
    status: res.status(),
    error: null,
  }
  apiCalls.push(item)
  if (res.status() >= 400) {
    networkIssues.push(item)
  }
})

const screenshot = async (name) => {
  const file = path.join(shotDir, name)
  await page.screenshot({ path: file, fullPage: true })
  return `tests-output/screenshots-real/${name}`
}

const findApiStatus = (urlPart) =>
  apiCalls.filter((c) => c.url.includes(urlPart)).map((c) => c.status).filter((s) => s != null)

const all2xx = (statuses) => statuses.length > 0 && statuses.every((s) => s >= 200 && s < 300)

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' })

  // Step 1: login with quick demo doctor (real backend)
  try {
    await page.getByRole('button', { name: 'Bác sĩ' }).click({ timeout: 10000 })
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    const loginStatuses = findApiStatus('/api/auth/login')
    const pass = all2xx(loginStatuses)
    if (!pass) {
      networkIssues.push({
        type: 'assertion',
        method: 'POST',
        url: '/api/auth/login',
        status: loginStatuses.join(',') || 'none',
        error: 'Login API did not return 2xx',
      })
    }

    mark('1) Login doctor bằng quick demo (real backend)', pass, `Route: ${page.url()} | /api/auth/login statuses: ${loginStatuses.join(',') || 'none'}`)
  } catch (e) {
    screenshotPaths.loginFailure = await screenshot('doctor-real-login-failure.png')
    routeIssues.push({ step: 1, expected: '/dashboard', actual: page.url(), error: e.message })
    mark('1) Login doctor bằng quick demo (real backend)', false, e.message)
  }

  if (!steps[0].passed) {
    const report = renderReport({ steps, selectorIssues, routeIssues, networkIssues, screenshotPaths, apiCalls, baseUrl })
    await fs.writeFile(reportPath, report, 'utf8')
    console.log(report)
    process.exit(0)
  }

  // Step 2: dashboard load + backend calls
  try {
    await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 10000 })
    screenshotPaths.dashboard = await screenshot('doctor-real-dashboard.png')

    const statsStatuses = findApiStatus('/api/statistics/aggregate/doctor/')
    const aptStatuses = findApiStatus('/api/appointments/search')
    const pass = all2xx(statsStatuses) && all2xx(aptStatuses)

    if (!pass) {
      networkIssues.push({
        type: 'assertion',
        method: 'GET',
        url: '/api/statistics/aggregate/doctor/* + /api/appointments/search',
        status: `stats=[${statsStatuses.join(',') || 'none'}], appointments=[${aptStatuses.join(',') || 'none'}]`,
        error: 'Dashboard backend APIs missing or non-2xx',
      })
    }

    mark(
      '2) Dashboard load + API',
      pass,
      `stats: ${statsStatuses.join(',') || 'none'} | appointments: ${aptStatuses.join(',') || 'none'}`,
    )
  } catch (e) {
    selectorIssues.push({ step: 2, selector: 'dashboard heading', error: e.message })
    mark('2) Dashboard load + API', false, e.message)
  }

  // Step 3: appointments tabs
  try {
    await page.getByRole('link', { name: 'Lịch hẹn' }).first().click({ timeout: 10000 })
    await page.waitForURL('**/doctor/appointments', { timeout: 10000 })

    await page.getByRole('button', { name: 'Hôm nay' }).click({ timeout: 10000 })
    screenshotPaths.appointmentsToday = await screenshot('doctor-real-appointments-today.png')

    await page.getByRole('button', { name: 'Sắp tới' }).click({ timeout: 10000 })
    screenshotPaths.appointmentsUpcoming = await screenshot('doctor-real-appointments-upcoming.png')

    await page.getByRole('button', { name: 'Đã hoàn thành' }).click({ timeout: 10000 })
    screenshotPaths.appointmentsCompleted = await screenshot('doctor-real-appointments-completed.png')

    const aptStatuses = findApiStatus('/api/appointments/search')
    const pass = all2xx(aptStatuses)

    if (!pass) {
      networkIssues.push({
        type: 'assertion',
        method: 'GET',
        url: '/api/appointments/search',
        status: aptStatuses.join(',') || 'none',
        error: 'Appointments API missing or non-2xx',
      })
    }

    mark('3) Lịch hẹn: tab Hôm nay/Sắp tới/Đã hoàn thành', pass, `appointments API statuses: ${aptStatuses.join(',') || 'none'}`)
  } catch (e) {
    selectorIssues.push({ step: 3, selector: 'appointments tab buttons', error: e.message })
    routeIssues.push({ step: 3, expected: '/doctor/appointments', actual: page.url(), error: e.message })
    mark('3) Lịch hẹn: tab Hôm nay/Sắp tới/Đã hoàn thành', false, e.message)
  }

  // Step 4: patients search
  try {
    await page.getByRole('link', { name: 'Bệnh nhân' }).click({ timeout: 10000 })
    await page.waitForURL('**/patients', { timeout: 10000 })

    const input = page.getByPlaceholder('Tìm theo tên hoặc số điện thoại...')
    await input.fill('zzz_non_existing_patient')
    await page.getByText('Không tìm thấy bệnh nhân nào').waitFor({ timeout: 10000 })
    screenshotPaths.patients = await screenshot('doctor-real-patients.png')

    const patientBaseStatuses = findApiStatus('/api/appointments/doctor/')
    const pass = all2xx(patientBaseStatuses)

    if (!pass) {
      networkIssues.push({
        type: 'assertion',
        method: 'GET',
        url: '/api/appointments/doctor/*',
        status: patientBaseStatuses.join(',') || 'none',
        error: 'Patients page backend API missing or non-2xx',
      })
    }

    mark('4) Bệnh nhân: ô tìm kiếm hoạt động + API', pass, `appointments/doctor statuses: ${patientBaseStatuses.join(',') || 'none'}`)
  } catch (e) {
    selectorIssues.push({ step: 4, selector: 'patients search', error: e.message })
    routeIssues.push({ step: 4, expected: '/patients', actual: page.url(), error: e.message })
    mark('4) Bệnh nhân: ô tìm kiếm hoạt động + API', false, e.message)
  }

  // Step 5: analytics
  try {
    await page.getByRole('link', { name: 'Thống kê' }).click({ timeout: 10000 })
    await page.waitForURL('**/doctor/analytics', { timeout: 10000 })
    await page.getByText('Tổng bệnh nhân').first().waitFor({ timeout: 10000 })

    const chartCount = await page.locator('svg.recharts-surface').count()
    screenshotPaths.analytics = await screenshot('doctor-real-analytics.png')

    const statsStatuses = findApiStatus('/api/statistics/aggregate/doctor/')
    const analyticsStatuses = findApiStatus('/api/statistics/aggregate/analytics/doctor/')
    const pass = chartCount > 0 && all2xx(statsStatuses) && all2xx(analyticsStatuses)

    if (!pass) {
      networkIssues.push({
        type: 'assertion',
        method: 'GET',
        url: '/api/statistics/aggregate/doctor/* + /api/statistics/aggregate/analytics/doctor/*',
        status: `stats=[${statsStatuses.join(',') || 'none'}], analytics=[${analyticsStatuses.join(',') || 'none'}], charts=${chartCount}`,
        error: 'Analytics backend APIs missing/non-2xx or charts not rendered',
      })
    }

    mark('5) Thống kê: metric cards + charts render + API', pass, `charts=${chartCount} | stats=${statsStatuses.join(',') || 'none'} | analytics=${analyticsStatuses.join(',') || 'none'}`)
  } catch (e) {
    selectorIssues.push({ step: 5, selector: 'analytics metrics/charts', error: e.message })
    routeIssues.push({ step: 5, expected: '/doctor/analytics', actual: page.url(), error: e.message })
    mark('5) Thống kê: metric cards + charts render + API', false, e.message)
  }

  // Step 6: logout
  try {
    const navButtons = page.locator('nav button')
    const count = await navButtons.count()
    await navButtons.nth(count - 1).click({ timeout: 5000 })
    await page.getByRole('button', { name: 'Đăng xuất' }).click({ timeout: 5000 })
    await page.waitForURL('**/login', { timeout: 10000 })
    mark('6) Logout', true, `Route: ${page.url()}`)
  } catch (e) {
    selectorIssues.push({ step: 6, selector: 'logout button', error: e.message })
    mark('6) Logout', false, e.message)
  }

  const report = renderReport({ steps, selectorIssues, routeIssues, networkIssues, screenshotPaths, apiCalls, baseUrl })
  await fs.writeFile(reportPath, report, 'utf8')
  console.log(report)
} finally {
  await browser.close()
}

function renderReport({ steps, selectorIssues, routeIssues, networkIssues, screenshotPaths, apiCalls, baseUrl }) {
  const uniq = (arr) => arr.filter((item, idx) => arr.findIndex((x) => JSON.stringify(x) === JSON.stringify(item)) === idx)
  const fmt = (title, arr, fn) => {
    if (!arr.length) return `## ${title}\n- Không phát hiện\n`
    return `## ${title}\n${arr.map(fn).join('\n')}\n`
  }

  const summarizeApi = () => {
    const keyToItem = new Map()
    for (const c of apiCalls) {
      const key = `${c.method} ${c.url}`
      if (!keyToItem.has(key)) {
        keyToItem.set(key, { method: c.method, url: c.url, statuses: [] })
      }
      if (c.status != null) {
        keyToItem.get(key).statuses.push(c.status)
      }
    }

    const rows = Array.from(keyToItem.values())
      .filter((r) => r.url.includes('/api/'))
      .map((r) => `- ${r.method} ${r.url} -> statuses: ${r.statuses.length ? r.statuses.join(',') : 'n/a'}`)

    if (!rows.length) return '## Backend Calls Quan Sát\n- Không ghi nhận API call\n'
    return `## Backend Calls Quan Sát\n${rows.join('\n')}\n`
  }

  return `# Doctor Dashboard Flow Report (REAL E2E, No Mock)\n\n- Project: \`/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend\`\n- Executed at: ${new Date().toISOString()}\n- Base URL: ${baseUrl}\n- Backend mode: REAL (VITE_USE_MOCK_BACKEND=false)\n\n## Checklist Pass/Fail\n${steps.map((s) => `- [${s.passed ? 'x' : ' '}] ${s.name} ${s.passed ? 'PASS' : 'FAIL'}${s.details ? ` - ${s.details}` : ''}`).join('\n')}\n\n## Screenshots\n- Dashboard: ${screenshotPaths.dashboard || 'N/A'}\n- Appointments - Hôm nay: ${screenshotPaths.appointmentsToday || 'N/A'}\n- Appointments - Sắp tới: ${screenshotPaths.appointmentsUpcoming || 'N/A'}\n- Appointments - Đã hoàn thành: ${screenshotPaths.appointmentsCompleted || 'N/A'}\n- Patients: ${screenshotPaths.patients || 'N/A'}\n- Analytics: ${screenshotPaths.analytics || 'N/A'}\n\n${summarizeApi()}\n${fmt('Lỗi Selector', uniq(selectorIssues), (i) => `- Step ${i.step}: selector \`${i.selector}\` -> ${i.error}`)}\n${fmt('Lỗi Route', uniq(routeIssues), (i) => `- Step ${i.step}: expected \`${i.expected}\`, actual \`${i.actual}\` -> ${i.error}`)}\n${fmt('Lỗi Network', uniq(networkIssues), (i) => `- ${i.type.toUpperCase()} ${i.method} ${i.url}${i.status ? ` (status ${i.status})` : ''}${i.error ? ` -> ${i.error}` : ''}`)}\n`
}
