import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const rootDir = '/home/ubuntu/clinic-projects'
const frontendDir = path.join(rootDir, 'clinic-booking-monorepo/frontend')
const authDir = path.join(frontendDir, 'tests/e2e/.auth')
const clipDir = path.join(rootDir, 'tmp-proof-fix-all')
const outputDir = path.join(rootDir, 'mcp_videos')
const timestamp = Date.now()
const finalVideoPath = path.join(outputDir, `fix-all-proof-${timestamp}.webm`)
const baseUrl = 'http://127.0.0.1:3000'
const consultationId = 5214
const realtimeMessage = `Realtime proof ${timestamp}`

const ensureDir = async (dirPath) => {
  await fs.rm(dirPath, { recursive: true, force: true })
  await fs.mkdir(dirPath, { recursive: true })
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const readAccessToken = async (fileName) => {
  const raw = await fs.readFile(path.join(authDir, fileName), 'utf8')
  const storage = JSON.parse(raw)
  return storage.origins[0].localStorage.find((item) => item.name === 'accessToken').value
}

const waitForHttpOk = async ({ url, token, label, attempts = 30 }) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (response.ok) {
        return
      }
    } catch {
      // Retry below.
    }

    if (attempt === attempts) {
      throw new Error(`Timed out waiting for ${label}: ${url}`)
    }
    await wait(1000)
  }
}

await ensureDir(clipDir)
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

let adminVideoPath
let doctorVideoPath

try {
  const adminToken = await readAccessToken('admin.json')
  const doctorToken = await readAccessToken('doctor.json')
  const patientToken = await readAccessToken('patient.json')

  await waitForHttpOk({
    url: 'http://localhost:8080/actuator/health',
    label: 'api gateway health',
  })
  await waitForHttpOk({
    url: 'http://localhost:8080/api/statistics/aggregate/analytics/admin/dashboard',
    token: adminToken,
    label: 'admin analytics dashboard',
  })
  await waitForHttpOk({
    url: 'http://localhost:8080/api/reports/appointments?dateRange=6months&groupBy=month',
    token: adminToken,
    label: 'appointment report',
  })
  await waitForHttpOk({
    url: 'http://localhost:8080/api/reports/revenue?dateRange=6months&groupBy=month',
    token: adminToken,
    label: 'revenue report',
  })
  await waitForHttpOk({
    url: 'http://localhost:8080/api/reports/patients?dateRange=6months&groupBy=month',
    token: adminToken,
    label: 'patient report',
  })
  await waitForHttpOk({
    url: `http://localhost:8080/api/consultations/${consultationId}`,
    token: doctorToken,
    label: 'doctor consultation detail',
  })
  await waitForHttpOk({
    url: `http://localhost:8080/api/messages/consultation/${consultationId}`,
    token: doctorToken,
    label: 'doctor consultation messages',
  })
  await waitForHttpOk({
    url: `http://localhost:8080/api/consultations/${consultationId}`,
    token: patientToken,
    label: 'patient consultation detail',
  })

  const warmupAdminContext = await browser.newContext({
    storageState: path.join(authDir, 'admin.json'),
    viewport: { width: 1280, height: 720 },
  })
  const warmupAdminPage = await warmupAdminContext.newPage()
  await warmupAdminPage.goto(`${baseUrl}/admin/reports`, { waitUntil: 'domcontentloaded' })
  await warmupAdminPage.getByRole('heading', { name: 'Báo cáo' }).waitFor({ timeout: 20_000 })
  await warmupAdminPage.getByText('Tổng lịch hẹn').waitFor({ timeout: 20_000 })
  await warmupAdminPage.waitForTimeout(1500)
  await warmupAdminContext.close()

  const adminRecordDir = path.join(clipDir, 'admin')
  await fs.mkdir(adminRecordDir, { recursive: true })
  const adminContext = await browser.newContext({
    storageState: path.join(authDir, 'admin.json'),
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: adminRecordDir, size: { width: 1280, height: 720 } },
  })
  const adminPage = await adminContext.newPage()
  await adminPage.goto(`${baseUrl}/admin/reports`, { waitUntil: 'domcontentloaded' })
  await adminPage.getByRole('heading', { name: 'Báo cáo' }).waitFor({ timeout: 20_000 })
  await adminPage.getByText('Tổng lịch hẹn').waitFor({ timeout: 20_000 })
  await adminPage.waitForTimeout(2200)
  await adminPage.getByRole('button', { name: 'Doanh thu' }).click()
  await adminPage.waitForTimeout(1200)
  await adminPage.getByRole('button', { name: 'Bệnh nhân' }).click()
  await adminPage.waitForTimeout(1200)
  await adminContext.close()
  adminVideoPath = await adminPage.video().path()

  const doctorRecordDir = path.join(clipDir, 'doctor')
  await fs.mkdir(doctorRecordDir, { recursive: true })
  const doctorContext = await browser.newContext({
    storageState: path.join(authDir, 'doctor.json'),
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: doctorRecordDir, size: { width: 1280, height: 720 } },
  })
  const patientContext = await browser.newContext({
    storageState: path.join(authDir, 'patient.json'),
    viewport: { width: 1280, height: 720 },
  })

  const doctorPage = await doctorContext.newPage()
  const patientPage = await patientContext.newPage()

  await doctorPage.goto(`${baseUrl}/doctor/consultations/${consultationId}`, { waitUntil: 'domcontentloaded' })
  await doctorPage.getByPlaceholder('Nhập tin nhắn...').waitFor({ timeout: 20_000 })
  await doctorPage.getByText(/Đang tư vấn|Đã chấp nhận/).waitFor({ timeout: 20_000 })
  await doctorPage.waitForTimeout(1500)

  await patientPage.goto(`${baseUrl}/patient/consultations/${consultationId}`, { waitUntil: 'domcontentloaded' })
  const patientInput = patientPage.getByPlaceholder('Nhập tin nhắn...')
  await patientInput.waitFor({ timeout: 20_000 })
  await patientInput.fill(realtimeMessage)
  await wait(600)
  await patientInput.press('Enter')

  await doctorPage.getByText(realtimeMessage, { exact: false }).waitFor({ timeout: 20_000 })
  await doctorPage.waitForTimeout(2500)

  await patientContext.close()
  await doctorContext.close()
  doctorVideoPath = await doctorPage.video().path()
} finally {
  await browser.close()
}

execFileSync('ffmpeg', [
  '-y',
  '-i', adminVideoPath,
  '-i', doctorVideoPath,
  '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]',
  '-map', '[v]',
  '-c:v', 'libvpx-vp9',
  '-b:v', '0',
  '-crf', '32',
  finalVideoPath,
], { stdio: 'ignore' })

console.log(JSON.stringify({
  finalVideoPath,
  adminVideoPath,
  doctorVideoPath,
  consultationId,
  realtimeMessage,
}, null, 2))
