import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AGENT_NAME = 'agent-01'
const CASES = [
  {
    "id": "TC-001",
    "name": "Đăng ký thành công",
    "module": "Auth",
    "testStep": "POST /api/auth/register",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": ""
  },
  {
    "id": "TC-002",
    "name": "Đăng ký trùng email",
    "module": "Auth",
    "testStep": "POST /api/auth/register dup",
    "expectedResult": "HTTP 409",
    "expectedStatus": 409,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": "dup"
  },
  {
    "id": "TC-003",
    "name": "Email sai format",
    "module": "Auth",
    "testStep": "POST /api/auth/register bad email",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": "bad email"
  },
  {
    "id": "TC-004",
    "name": "Thiếu mật khẩu",
    "module": "Auth",
    "testStep": "POST /api/auth/register no pass",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": "no pass"
  },
  {
    "id": "TC-005",
    "name": "Thiếu họ tên",
    "module": "Auth",
    "testStep": "POST /api/auth/register no name",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": "no name"
  }
]

const uniqueDigits = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`.replace(/\D/g, '')
const uniquePhone = () => `09${uniqueDigits().slice(-8)}`
const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const executeAgent01Case = async (request, testCase) => {
  if (testCase.id !== 'TC-001') {
    return executeSheetCase(request, testCase)
  }

  const payload = {
    email: `register.${uniqueDigits()}@clinic.test`,
    password: process.env.E2E_PASSWORD || 'password',
    fullName: 'Sheet Register User',
    phone: uniquePhone(),
    role: 'PATIENT',
  }

  let lastResult = null
  for (let attempt = 0; attempt <= 2; attempt += 1) {
    const start = Date.now()
    const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    })
    const durationMs = Date.now() - start
    const bodyText = await response.text().catch(() => '')
    const status = response.status()

    lastResult = {
      status,
      durationMs,
      debug: [
        `[${testCase.id}] POST /api/auth/register`,
        `attempt=${attempt + 1}`,
        `status=${status}`,
        `durationMs=${durationMs}`,
        `body=${bodyText.slice(0, 240)}`,
      ].join(' | '),
    }

    if (status !== 503 || attempt === 2) {
      return lastResult
    }

    await waitFor(500)
  }

  return lastResult
}

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | status contract | ${testCase.name}`, async ({ request }) => {
      const result = await executeAgent01Case(request, testCase)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })

    test(`${testCase.id} | latency budget | ${testCase.name}`, async ({ request }) => {
      const result = await executeAgent01Case(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
