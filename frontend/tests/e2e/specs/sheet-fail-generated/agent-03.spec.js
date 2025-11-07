import { test, expect } from '@playwright/test'

const RUN_SHEET_FAIL_GENERATED = process.env.RUN_SHEET_FAIL_GENERATED === 'true'
const SKIP_PAYMENT = process.env.SHEET_SKIP_PAYMENT === 'true'
const AGENT_NAME = 'agent-03'
const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PATIENT_ACCOUNT = {
  email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com',
  password: process.env.E2E_PASSWORD || 'password',
}

let uniqueCounter = 0
let patientAuthCache = null

const nextUnique = () => {
  uniqueCounter += 1
  return `${Date.now()}-${process.pid || 0}-${uniqueCounter}`
}

const parseJsonSafe = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

const loginPatient = async (request) => {
  if (patientAuthCache?.token) {
    return patientAuthCache
  }

  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: PATIENT_ACCOUNT,
  })

  const payload = await parseJsonSafe(response)
  const token = payload?.token
  expect(token, `Patient login failed: ${response.status()} ${JSON.stringify(payload)}`).toBeTruthy()

  patientAuthCache = {
    token,
    userId: payload?.userId,
  }
  return patientAuthCache
}

const apiUrl = (path) => new URL(path, API_BASE_URL).toString()

const createHealthMetric = async (request, auth) => {
  const response = await request.post(apiUrl('/api/health-metrics'), {
    headers: authHeaders(auth.token),
    data: {
      patientId: auth.userId,
      metricType: 'HEART_RATE',
      value: String(70 + uniqueCounter),
      unit: 'bpm',
      measuredAt: new Date().toISOString(),
      notes: `sheet-fail-${nextUnique()}`,
    },
  })

  const body = await parseJsonSafe(response)
  return {
    status: response.status(),
    id: body?.id,
    debug: `[create-health-metric] status=${response.status()} body=${JSON.stringify(body).slice(0, 240)}`,
  }
}

const cleanupHealthMetric = async (request, auth, metricId) => {
  if (!metricId) {
    return
  }

  await request.delete(apiUrl(`/api/health-metrics/${metricId}`), {
    headers: authHeaders(auth.token),
  })
}

const resolvePrescriptionId = async (request, auth) => {
  const response = await request.get(apiUrl('/api/prescriptions/medical-record/1?page=0&size=1'), {
    headers: authHeaders(auth.token),
  })
  const body = await parseJsonSafe(response)
  const list = Array.isArray(body) ? body : body?.content
  return list?.[0]?.id || null
}

const CASES = [
  {
    "rowNumber": 20,
    "id": "TC-078",
    "name": "Xem đơn thuốc",
    "module": "Prescription",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/prescriptions/{id}",
    "method": "GET",
    "path": "/api/prescriptions/{id}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-078",
      "Xem đơn thuốc",
      "HTTP 200",
      "",
      "Fail",
      "Prescription",
      "",
      ""
    ]
  },
  {
    "rowNumber": 21,
    "id": "TC-080",
    "name": "HTTP 200",
    "module": "Prescription",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/prescriptions/medical-record/{recordId}?page=0&size=5",
    "method": "GET",
    "path": "/api/prescriptions/medical-record/{recordId}?page=0&size=5",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-080",
      "HTTP 200",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Medication",
      "Prescription",
      "",
      ""
    ]
  },
  {
    "rowNumber": 22,
    "id": "TC-082",
    "name": "HTTP 200",
    "module": "Medication",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "PUT /api/medications/{id}",
    "method": "PUT",
    "path": "/api/medications/{id}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-082",
      "HTTP 200",
      "HTTP 400 - Thuốc với tên 'Med Updated' đã tồn tại",
      "Fail",
      "Medication",
      "",
      "",
      ""
    ]
  },
  {
    "rowNumber": 23,
    "id": "TC-084",
    "name": "Cập nhật thuốc",
    "module": "TC-084",
    "expectedResult": "",
    "expectedStatus": null,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-084",
      "Cập nhật thuốc",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "rowNumber": 24,
    "id": "TC-086",
    "name": "Thêm chỉ số",
    "module": "HealthMetric",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "testStep": "POST /api/health-metrics",
    "method": "POST",
    "path": "/api/health-metrics",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-086",
      "Thêm chỉ số",
      "HTTP 201",
      "HTTP 0 - no uid",
      "Fail",
      "HealthMetric",
      "",
      ""
    ]
  },
  {
    "rowNumber": 25,
    "id": "TC-087",
    "name": "Xem chỉ số theo BN",
    "module": "HealthMetric",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/health-metrics/patient/{patientId}",
    "method": "GET",
    "path": "/api/health-metrics/patient/{patientId}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-087",
      "Xem chỉ số theo BN",
      "HTTP 200",
      "HTTP 0 - no uid",
      "Fail",
      "HealthMetric",
      "",
      ""
    ]
  },
  {
    "rowNumber": 26,
    "id": "TC-088",
    "name": "Xem chỉ số theo ID",
    "module": "HealthMetric",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/health-metrics/{id}",
    "method": "GET",
    "path": "/api/health-metrics/{id}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-088",
      "Xem chỉ số theo ID",
      "HTTP 200",
      "HTTP 0 - no hm",
      "Fail",
      "HealthMetric",
      "",
      ""
    ]
  },
  {
    "rowNumber": 27,
    "id": "TC-089",
    "name": "Cập nhật chỉ số",
    "module": "HealthMetric",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "PUT /api/health-metrics/{id}",
    "method": "PUT",
    "path": "/api/health-metrics/{id}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-089",
      "Cập nhật chỉ số",
      "HTTP 200",
      "HTTP 0 - no hm",
      "Fail",
      "HealthMetric",
      "",
      ""
    ]
  },
  {
    "rowNumber": 28,
    "id": "TC-090",
    "name": "Xóa chỉ số",
    "module": "HealthMetric",
    "expectedResult": "HTTP 204",
    "expectedStatus": 204,
    "testStep": "DELETE /api/health-metrics/{id}",
    "method": "DELETE",
    "path": "/api/health-metrics/{id}",
    "qualifier": "",
    "source": "manual-map",
    "rawCells": [
      "TC-090",
      "Xóa chỉ số",
      "HTTP 204",
      "HTTP 0 - no hm",
      "Fail",
      "HealthMetric",
      "",
      ""
    ]
  }
]

test.describe(`Sheet fail verification | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_FAIL_GENERATED, 'Set RUN_SHEET_FAIL_GENERATED=true to execute fail verification tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | verify expected status | ${testCase.name}`, async ({ request }) => {
      const moduleName = String(testCase.module || '').toLowerCase()
      const pathName = String(testCase.path || '').toLowerCase()

      test.skip(SKIP_PAYMENT && (moduleName.includes('payment') || pathName.includes('/payment')), 'Payment cases disabled by SHEET_SKIP_PAYMENT=true')
      test.skip(!testCase.expectedStatus, 'Sheet row has no expected HTTP status')
      test.skip(testCase.id === 'TC-082', 'Medication update mapping depends on admin-only write flow and duplicate-name setup not reliably available in this suite')
      test.skip(testCase.id === 'TC-084', 'Sheet row is incomplete (no expected status and no reliable endpoint mapping)')

      const auth = await loginPatient(request)

      if (testCase.id === 'TC-078') {
        const prescriptionId = await resolvePrescriptionId(request, auth)
        test.skip(!prescriptionId, 'No seeded prescription found to verify GET /api/prescriptions/{id}')

        const response = await request.get(apiUrl(`/api/prescriptions/${prescriptionId}`), {
          headers: authHeaders(auth.token),
        })
        const body = await response.text()
        const debug = `[${testCase.id}] GET /api/prescriptions/${prescriptionId} status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        return
      }

      if (testCase.id === 'TC-080') {
        const response = await request.get(apiUrl('/api/prescriptions/medical-record/1?page=0&size=5'), {
          headers: authHeaders(auth.token),
        })
        const body = await response.text()
        const debug = `[${testCase.id}] GET /api/prescriptions/medical-record/1?page=0&size=5 status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        return
      }

      if (testCase.id === 'TC-086') {
        const created = await createHealthMetric(request, auth)
        expect(created.status, created.debug).toBe(testCase.expectedStatus)
        await cleanupHealthMetric(request, auth, created.id)
        return
      }

      if (testCase.id === 'TC-087') {
        const response = await request.get(apiUrl(`/api/health-metrics/patient/${auth.userId}?page=0&size=5`), {
          headers: authHeaders(auth.token),
        })
        const body = await response.text()
        const debug = `[${testCase.id}] GET /api/health-metrics/patient/${auth.userId}?page=0&size=5 status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        return
      }

      if (testCase.id === 'TC-088') {
        const created = await createHealthMetric(request, auth)
        expect(created.id, created.debug).toBeTruthy()

        const response = await request.get(apiUrl(`/api/health-metrics/${created.id}`), {
          headers: authHeaders(auth.token),
        })
        const body = await response.text()
        const debug = `[${testCase.id}] GET /api/health-metrics/${created.id} status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        await cleanupHealthMetric(request, auth, created.id)
        return
      }

      if (testCase.id === 'TC-089') {
        const created = await createHealthMetric(request, auth)
        expect(created.id, created.debug).toBeTruthy()

        const response = await request.put(apiUrl(`/api/health-metrics/${created.id}`), {
          headers: authHeaders(auth.token),
          data: {
            metricType: 'HEART_RATE',
            value: '88',
            unit: 'bpm',
            measuredAt: new Date().toISOString(),
            notes: `updated-${nextUnique()}`,
          },
        })
        const body = await response.text()
        const debug = `[${testCase.id}] PUT /api/health-metrics/${created.id} status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        await cleanupHealthMetric(request, auth, created.id)
        return
      }

      if (testCase.id === 'TC-090') {
        const created = await createHealthMetric(request, auth)
        expect(created.id, created.debug).toBeTruthy()

        const response = await request.delete(apiUrl(`/api/health-metrics/${created.id}`), {
          headers: authHeaders(auth.token),
        })
        const body = await response.text()
        const debug = `[${testCase.id}] DELETE /api/health-metrics/${created.id} status=${response.status()} body=${body.slice(0, 240)}`
        expect(response.status(), debug).toBe(testCase.expectedStatus)
        return
      }

      test.skip(`No runnable mapping implemented for ${testCase.id}`)
    })
  }
})
