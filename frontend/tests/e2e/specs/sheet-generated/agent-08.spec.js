import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-08'
const RETRYABLE_SERVICE_ERROR = 'Login failed for'

const isRetryableServiceError = (error) => {
  const message = String(error?.message || '')
  return message.includes(RETRYABLE_SERVICE_ERROR) && message.includes('503')
}

const executeWithRetry = async (request, testCase, retries = 2) => {
  let attempt = 0
  while (attempt <= retries) {
    try {
      return await executeSheetCase(request, testCase)
    } catch (error) {
      if (!isRetryableServiceError(error) || attempt === retries) {
        throw error
      }
      attempt += 1
    }
  }
}

const CASES = [
  {
    "id": "TC-036",
    "name": "Lịch 404",
    "module": "Appointment",
    "testStep": "GET /api/appointments/999999",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "method": "GET",
    "path": "/api/appointments/999999",
    "qualifier": ""
  },
  {
    "id": "TC-037",
    "name": "Lịch bệnh nhân",
    "module": "Appointment",
    "testStep": "GET /api/appointments/patient/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/appointments/patient/None",
    "qualifier": ""
  },
  {
    "id": "TC-038",
    "name": "Lịch bác sĩ",
    "module": "Appointment",
    "testStep": "GET /api/appointments/doctor/801",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/appointments/doctor/801",
    "qualifier": ""
  },
  {
    "id": "TC-039",
    "name": "Cập nhật lịch hẹn",
    "module": "Appointment",
    "testStep": "PUT /api/appointments/None",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "PUT",
    "path": "/api/appointments/None",
    "qualifier": ""
  },
  {
    "id": "TC-040",
    "name": "Confirm lịch",
    "module": "Appointment",
    "testStep": "PUT /api/appointments/None/confirm",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "PUT",
    "path": "/api/appointments/None/confirm",
    "qualifier": ""
  }
]

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
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
