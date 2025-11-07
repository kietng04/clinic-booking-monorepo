import { test, expect } from '@playwright/test'
import { executeSheetCase } from '../../helpers/sheet-generated-api.js'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-10'
const CASES = [
  {
    "id": "TC-046",
    "name": "Tạo phòng khám",
    "module": "Clinic",
    "testStep": "POST /api/clinics",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "method": "POST",
    "path": "/api/clinics",
    "qualifier": ""
  },
  {
    "id": "TC-047",
    "name": "Tạo PK thiếu tên",
    "module": "Clinic",
    "testStep": "POST /api/clinics no name",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/clinics",
    "qualifier": "no name"
  },
  {
    "id": "TC-048",
    "name": "Xem tất cả PK",
    "module": "Clinic",
    "testStep": "GET /api/clinics",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/clinics",
    "qualifier": ""
  },
  {
    "id": "TC-049",
    "name": "Xem PK theo ID",
    "module": "Clinic",
    "testStep": "GET /api/clinics/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/clinics/None",
    "qualifier": ""
  },
  {
    "id": "TC-050",
    "name": "Cập nhật PK",
    "module": "Clinic",
    "testStep": "PUT /api/clinics/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "PUT",
    "path": "/api/clinics/None",
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
