import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-04'
const CASES = [
  {
    "id": "TC-016",
    "name": "Lọc theo role DOCTOR",
    "module": "User",
    "testStep": "GET /api/users/role/DOCTOR",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/users/role/DOCTOR",
    "qualifier": ""
  },
  {
    "id": "TC-017",
    "name": "Cập nhật user",
    "module": "User",
    "testStep": "PUT /api/users/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "PUT",
    "path": "/api/users/None",
    "qualifier": ""
  },
  {
    "id": "TC-018",
    "name": "Cập nhật user 404",
    "module": "User",
    "testStep": "PUT /api/users/999999",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "method": "PUT",
    "path": "/api/users/999999",
    "qualifier": ""
  },
  {
    "id": "TC-019",
    "name": "Xóa user 404",
    "module": "User",
    "testStep": "DELETE /api/users/999999",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "method": "DELETE",
    "path": "/api/users/999999",
    "qualifier": ""
  },
  {
    "id": "TC-020",
    "name": "Tìm bác sĩ",
    "module": "User",
    "testStep": "GET /api/users/doctors/search",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/users/doctors/search",
    "qualifier": ""
  }
]

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | status contract | ${testCase.name}`, async ({ request }) => {
      const result = await executeSheetCase(request, testCase)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })

    test(`${testCase.id} | latency budget | ${testCase.name}`, async ({ request }) => {
      const result = await executeSheetCase(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
