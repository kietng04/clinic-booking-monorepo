import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-02'
const CASES = [
  {
    "id": "TC-006",
    "name": "SĐT sai",
    "module": "Auth",
    "testStep": "POST /api/auth/register bad phone",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/auth/register",
    "qualifier": "bad phone"
  },
  {
    "id": "TC-007",
    "name": "Đăng nhập thành công",
    "module": "Auth",
    "testStep": "POST /api/auth/login",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "POST",
    "path": "/api/auth/login",
    "qualifier": ""
  },
  {
    "id": "TC-008",
    "name": "Sai mật khẩu",
    "module": "Auth",
    "testStep": "POST /api/auth/login wrong pass",
    "expectedResult": "HTTP 401",
    "expectedStatus": 401,
    "method": "POST",
    "path": "/api/auth/login",
    "qualifier": "wrong pass"
  },
  {
    "id": "TC-009",
    "name": "Email không tồn tại",
    "module": "Auth",
    "testStep": "POST /api/auth/login no user",
    "expectedResult": "HTTP 401",
    "expectedStatus": 401,
    "method": "POST",
    "path": "/api/auth/login",
    "qualifier": "no user"
  },
  {
    "id": "TC-010",
    "name": "Refresh token OK",
    "module": "Auth",
    "testStep": "POST /api/auth/refresh",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "POST",
    "path": "/api/auth/refresh",
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

    test(`${testCase.id} | latency budget | ${testCase.name}`, async ({ request }) => {
      const result = await executeSheetCase(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
