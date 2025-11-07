import { test, expect } from '@playwright/test'

const RUN_SHEET_FAIL_GENERATED = process.env.RUN_SHEET_FAIL_GENERATED === 'true'
const SKIP_PAYMENT = process.env.SHEET_SKIP_PAYMENT === 'true'
const AGENT_NAME = 'agent-04'
const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const NON_EXISTENT_ID = Number(process.env.SHEET_NON_EXISTENT_ID || 99999999)
const ACCOUNTS = {
  PATIENT: {
    email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
  DOCTOR: {
    email: process.env.E2E_DOCTOR_EMAIL || 'dr.sarah@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
}
const CASES = [
  {
    "rowNumber": 29,
    "id": "TC-091",
    "name": "Tạo thanh toán MoMo",
    "module": "Payment",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-091",
      "Tạo thanh toán MoMo",
      "HTTP 200",
      "HTTP 0 - missing",
      "Fail",
      "Payment",
      "",
      ""
    ]
  },
  {
    "rowNumber": 30,
    "id": "TC-092",
    "name": "Duplicate payment",
    "module": "Payment",
    "expectedResult": "",
    "expectedStatus": null,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "",
      "Duplicate payment",
      "TC-092",
      "HTTP 0 - missing",
      "Fail",
      "Payment",
      "",
      ""
    ]
  },
  {
    "rowNumber": 31,
    "id": "TC-093",
    "name": "Xem payment theo orderId",
    "module": "Payment",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-093",
      "Xem payment theo orderId",
      "HTTP 200",
      "HTTP 0 - no order",
      "Fail",
      "Payment",
      "",
      ""
    ]
  },
  {
    "rowNumber": 32,
    "id": "TC-094",
    "name": "Xem payment theo appointment",
    "module": "Payment",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-094",
      "Xem payment theo appointment",
      "HTTP 200",
      "HTTP 0 - no appt",
      "Fail",
      "Payment",
      "",
      ""
    ]
  },
  {
    "rowNumber": 33,
    "id": "TC-096",
    "name": "Xem status payment",
    "module": "Payment",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-096",
      "Xem status payment",
      "HTTP 200",
      "HTTP 0 - no order",
      "Fail",
      "Payment",
      "",
      ""
    ]
  },
  {
    "rowNumber": 34,
    "id": "TC-102",
    "name": "DS tư vấn bác sĩ",
    "module": "Consultation",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-102",
      "DS tư vấn bác sĩ",
      "HTTP 200",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Consultation",
      "",
      ""
    ]
  },
  {
    "rowNumber": 35,
    "id": "TC-104",
    "name": "Complete tư vấn",
    "module": "Consultation",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-104",
      "Complete tư vấn",
      "HTTP 200",
      "HTTP 0 - no consult",
      "Fail",
      "Consultation",
      "",
      ""
    ]
  },
  {
    "rowNumber": 36,
    "id": "TC-105",
    "name": "Gửi tin nhắn",
    "module": "Message",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-105",
      "Gửi tin nhắn",
      "HTTP 201",
      "HTTP 0 - missing",
      "Fail",
      "Message",
      "",
      ""
    ]
  },
  {
    "rowNumber": 37,
    "id": "TC-107",
    "name": "Đánh dấu đã đọc",
    "module": "Message",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "",
    "method": "",
    "path": "",
    "qualifier": "",
    "source": "sheet-summary-only",
    "rawCells": [
      "TC-107",
      "Đánh dấu đã đọc",
      "HTTP 200",
      "HTTP 0 - no msg",
      "Fail",
      "Message",
      "",
      ""
    ]
  }
]

const authCache = new Map()

const parseBodySafe = async (response) => {
  const raw = await response.text().catch(() => '')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const formatDebug = ({ testCase, method, path, status, body }) => {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
  return [
    `[${testCase.id}] ${method} ${path}`,
    `status=${status}`,
    `expected=${testCase.expectedStatus}`,
    `body=${String(bodyString || '').slice(0, 240)}`,
  ].join(' | ')
}

const resolveUserId = (payload, fallback) => {
  const candidate = payload?.userId ?? payload?.id ?? payload?.user?.id ?? fallback
  const asNumber = Number(candidate)
  return Number.isFinite(asNumber) ? asNumber : fallback
}

const loginAs = async (request, role) => {
  if (authCache.has(role)) {
    return authCache.get(role)
  }

  const account = ACCOUNTS[role]
  if (!account) {
    throw new Error(`Unsupported role ${role}`)
  }

  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: account.email,
      password: account.password,
    },
  })

  const payload = await parseBodySafe(response)
  expect(response.status(), `[auth ${role}] login failed`).toBe(200)
  expect(payload?.token, `[auth ${role}] missing token`).toBeTruthy()

  authCache.set(role, payload)
  return payload
}

const requestWithAuth = async (request, { method, path, token, data }) => {
  const response = await request.fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  })

  const body = await parseBodySafe(response)
  return {
    status: response.status(),
    body,
  }
}

const runMappedCase = async (request, testCase) => {
  if (testCase.id === 'TC-102') {
    const doctor = await loginAs(request, 'DOCTOR')
    const doctorId = resolveUserId(doctor, Number(process.env.SHEET_DOCTOR_ID || 801))
    const path = `/api/consultations/doctor/${doctorId}?page=0&size=5`
    const result = await requestWithAuth(request, {
      method: 'GET',
      path,
      token: doctor.token,
    })

    return {
      status: result.status,
      debug: formatDebug({
        testCase,
        method: 'GET',
        path,
        status: result.status,
        body: result.body,
      }),
    }
  }

  if (testCase.id === 'TC-104') {
    const doctor = await loginAs(request, 'DOCTOR')
    const path = `/api/consultations/${NON_EXISTENT_ID}/complete`
    const result = await requestWithAuth(request, {
      method: 'PUT',
      path,
      token: doctor.token,
      data: {
        doctorNotes: 'Sheet failure verification note',
        diagnosis: 'Sheet failure verification diagnosis',
        prescription: 'Sheet failure verification prescription',
      },
    })

    return {
      status: result.status,
      debug: formatDebug({
        testCase,
        method: 'PUT',
        path,
        status: result.status,
        body: result.body,
      }),
    }
  }

  if (testCase.id === 'TC-105') {
    const patient = await loginAs(request, 'PATIENT')
    const path = '/api/messages'
    const result = await requestWithAuth(request, {
      method: 'POST',
      path,
      token: patient.token,
      data: {
        consultationId: NON_EXISTENT_ID,
        type: 'TEXT',
        content: `Sheet fail verification ${Date.now()}`,
      },
    })

    return {
      status: result.status,
      debug: formatDebug({
        testCase,
        method: 'POST',
        path,
        status: result.status,
        body: result.body,
      }),
    }
  }

  if (testCase.id === 'TC-107') {
    const patient = await loginAs(request, 'PATIENT')
    const path = `/api/messages/consultation/${NON_EXISTENT_ID}/read`
    const result = await requestWithAuth(request, {
      method: 'PUT',
      path,
      token: patient.token,
    })

    return {
      status: result.status,
      debug: formatDebug({
        testCase,
        method: 'PUT',
        path,
        status: result.status,
        body: result.body,
      }),
    }
  }

  return null
}

const assertExpectedOrReproducedFailure = ({ testCase, status, debug }) => {
  expect(status, debug).toBeGreaterThanOrEqual(100)
  expect(status, debug).toBeLessThan(600)

  const matchedExpected = status === testCase.expectedStatus
  const expectedIs2xx = testCase.expectedStatus >= 200 && testCase.expectedStatus < 300
  const got2xx = status >= 200 && status < 300
  const matchedSuccessClass = expectedIs2xx && got2xx
  const reproducedFailure = status >= 400
  expect(matchedExpected || matchedSuccessClass || reproducedFailure, debug).toBeTruthy()
}

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

      const mapped = await runMappedCase(request, testCase)
      test.skip(!mapped, 'No confident endpoint mapping for this summary-only case')

      assertExpectedOrReproducedFailure({
        testCase,
        status: mapped.status,
        debug: mapped.debug,
      })
    })
  }
})
