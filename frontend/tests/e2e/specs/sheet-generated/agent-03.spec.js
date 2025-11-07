import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-03'
const CASES = [
  {
    "id": "TC-011",
    "name": "Refresh token sai",
    "module": "Auth",
    "testStep": "POST /api/auth/refresh bad",
    "expectedResult": "HTTP 401",
    "expectedStatus": 401,
    "method": "POST",
    "path": "/api/auth/refresh",
    "qualifier": "bad"
  },
  {
    "id": "TC-012",
    "name": "Tạo user (Patient không đủ quyền)",
    "module": "User",
    "testStep": "POST /api/users",
    "expectedResult": "HTTP 403",
    "expectedStatus": 403,
    "method": "POST",
    "path": "/api/users",
    "qualifier": ""
  },
  {
    "id": "TC-013",
    "name": "Xem user theo ID",
    "module": "User",
    "testStep": "GET /api/users/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/users/None",
    "qualifier": ""
  },
  {
    "id": "TC-014",
    "name": "Xem user không tồn tại",
    "module": "User",
    "testStep": "GET /api/users/999999",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "method": "GET",
    "path": "/api/users/999999",
    "qualifier": ""
  },
  {
    "id": "TC-015",
    "name": "Danh sách users phân trang",
    "module": "User",
    "testStep": "GET /api/users?page=0&size=5",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/users?page=0&size=5",
    "qualifier": ""
  }
]

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | status contract | ${testCase.name}`, async ({ request }) => {
      const result = await executeSheetCase(request, testCase)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })

    test(`${testCase.id} | latency budget <=15s | ${testCase.name}`, async ({ request }) => {
      const result = await executeSheetCase(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
