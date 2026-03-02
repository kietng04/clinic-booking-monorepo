import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-07'
const RETRYABLE_SERVICE_ERROR = 'Login failed for'
const RETRYABLE_HTTP_STATUS = 503
const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableServiceError = (error) => {
  const message = String(error?.message || '')
  return message.includes(RETRYABLE_SERVICE_ERROR) && message.includes('503')
}

const executeWithRetry = async (request, testCase, retries = 2) => {
  let attempt = 0
  while (attempt <= retries) {
    try {
      const result = await executeSheetCase(request, testCase)
      if (result.status === RETRYABLE_HTTP_STATUS && attempt < retries) {
        attempt += 1
        await waitFor(500)
        continue
      }
      return result
    } catch (error) {
      if (!isRetryableServiceError(error) || attempt === retries) {
        throw error
      }
      attempt += 1
      await waitFor(500)
    }
  }
}

const CASES = [
  {
    "id": "TC-031",
    "name": "Đổi mật khẩu sai old",
    "module": "Password",
    "testStep": "PUT /api/auth/change-password sai old",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "PUT",
    "path": "/api/auth/change-password",
    "qualifier": "sai old"
  },
  {
    "id": "TC-032",
    "name": "Đặt lịch hẹn thành công",
    "module": "Appointment",
    "testStep": "POST /api/appointments",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "method": "POST",
    "path": "/api/appointments",
    "qualifier": ""
  },
  {
    "id": "TC-033",
    "name": "Đặt lịch trùng slot",
    "module": "Appointment",
    "testStep": "POST /api/appointments dup",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/appointments",
    "qualifier": "dup"
  },
  {
    "id": "TC-034",
    "name": "Đặt lịch thiếu ngày",
    "module": "Appointment",
    "testStep": "POST /api/appointments no date",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/appointments",
    "qualifier": "no date"
  },
  {
    "id": "TC-035",
    "name": "Xem lịch theo ID",
    "module": "Appointment",
    "testStep": "GET /api/appointments/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/appointments/None",
    "qualifier": ""
  }
]

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | status contract | ${testCase.name}`, async ({ request }) => {
      const result = await executeWithRetry(request, testCase)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })

    test(`${testCase.id} | latency budget | ${testCase.name}`, async ({ request }) => {
      const result = await executeWithRetry(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
