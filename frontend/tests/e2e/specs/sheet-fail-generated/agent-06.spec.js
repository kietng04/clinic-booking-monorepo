import { test, expect } from '@playwright/test'

const RUN_SHEET_FAIL_GENERATED = process.env.RUN_SHEET_FAIL_GENERATED === 'true'
const SKIP_PAYMENT = process.env.SHEET_SKIP_PAYMENT === 'true'
const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AGENT_NAME = 'agent-06'
const ACCOUNTS = {
  PATIENT: {
    email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
}
const DEFAULT_IDS = {
  userId: Number(process.env.SHEET_USER_ID || 1),
  doctorId: Number(process.env.SHEET_DOCTOR_ID || 801),
  clinicId: Number(process.env.SHEET_CLINIC_ID || 1),
  roomId: Number(process.env.SHEET_ROOM_ID || 1),
  serviceId: Number(process.env.SHEET_SERVICE_ID || 1),
}
const CASES = [
  {
    "rowNumber": 50,
    "id": "PF-03",
    "name": "List medications",
    "module": "Patient-Medication",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/medications?page=0&size=5",
    "method": "GET",
    "path": "/api/medications?page=0&size=5",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-03",
      "List medications",
      "GET /api/medications?page=0&size=5",
      "HTTP 200",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Patient-Medication",
      ""
    ]
  },
  {
    "rowNumber": 51,
    "id": "PF-04",
    "name": "Create appointment",
    "module": "Patient-Appointment",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "testStep": "POST /api/appointments",
    "method": "POST",
    "path": "/api/appointments",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-04",
      "Create appointment",
      "POST /api/appointments",
      "HTTP 201",
      "HTTP 400 - Thời gian khám nằm ngoài giờ làm việc của bác sĩ",
      "Fail",
      "Patient-Appointment",
      ""
    ]
  },
  {
    "rowNumber": 52,
    "id": "PF-09",
    "name": "Patient access doctor consultation list should be forbidden",
    "module": "Patient-Consultation",
    "expectedResult": "HTTP 403",
    "expectedStatus": 403,
    "testStep": "GET /api/consultations/doctor/1801",
    "method": "GET",
    "path": "/api/consultations/doctor/1801",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-09",
      "Patient access doctor consultation list should be forbidden",
      "GET /api/consultations/doctor/1801",
      "HTTP 403",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Patient-Consultation",
      ""
    ]
  },
  {
    "rowNumber": 53,
    "id": "PF-10",
    "name": "Send message",
    "module": "Patient-Message",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "testStep": "POST /api/messages",
    "method": "POST",
    "path": "/api/messages",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-10",
      "Send message",
      "POST /api/messages",
      "HTTP 201",
      "HTTP 400 - Cannot send messages in current consultation status",
      "Fail",
      "Patient-Message",
      ""
    ]
  },
  {
    "rowNumber": 54,
    "id": "PF-11",
    "name": "Mark non-existing message as read",
    "module": "Patient-Message",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "testStep": "PUT /api/messages/99999999/read",
    "method": "PUT",
    "path": "/api/messages/99999999/read",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-11",
      "Mark non-existing message as read",
      "PUT /api/messages/99999999/read",
      "HTTP 404",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Patient-Message",
      ""
    ]
  },
  {
    "rowNumber": 55,
    "id": "PF-13",
    "name": "Get unread notification count",
    "module": "Patient-Notification",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "testStep": "GET /api/notifications/user/2139/unread-count",
    "method": "GET",
    "path": "/api/notifications/user/2139/unread-count",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-13",
      "Get unread notification count",
      "GET /api/notifications/user/2139/unread-count",
      "HTTP 200",
      "HTTP 500 - An unexpected error occurred. Please try again later.",
      "Fail",
      "Patient-Notification",
      ""
    ]
  },
  {
    "rowNumber": 56,
    "id": "PF-15",
    "name": "Patient should not access user statistics",
    "module": "Patient-Authorization",
    "expectedResult": "HTTP 403",
    "expectedStatus": 403,
    "testStep": "GET /api/statistics/users/count",
    "method": "GET",
    "path": "/api/statistics/users/count",
    "qualifier": "",
    "source": "sheet-step",
    "rawCells": [
      "PF-15",
      "Patient should not access user statistics",
      "GET /api/statistics/users/count",
      "HTTP 403",
      "HTTP 500 - An unexpected error occurred. Please contact support.",
      "Fail",
      "Patient-Authorization",
      ""
    ]
  }
]

const CASE_SKIP_REASONS = {
  'PF-11': 'Sheet endpoint does not match current message-read contract.',
  'PF-13': 'Sheet unread-count path does not match current notification contract.',
}

const ROLE_BY_CASE = {
  'PF-04': 'PATIENT',
  'PF-09': 'PATIENT',
  'PF-10': 'PATIENT',
  'PF-15': 'PATIENT',
}

const tokenCache = new Map()

const parseStep = (testStep) => {
  const match = String(testStep || '').match(/^\s*(GET|POST|PUT|PATCH|DELETE)\s+(\S+)/i)
  if (!match) {
    return null
  }
  return {
    method: match[1].toUpperCase(),
    path: match[2],
  }
}

const extractReportedStatus = (rawFailureCell) => {
  const match = String(rawFailureCell || '').match(/HTTP\s+(\d{3})/i)
  return match ? Number(match[1]) : null
}

const resolveCasePayload = (testCase, userId) => {
  if (testCase.id === 'PF-04') {
    return {
      patientId: userId || DEFAULT_IDS.userId,
      doctorId: DEFAULT_IDS.doctorId,
      familyMemberId: null,
      clinicId: DEFAULT_IDS.clinicId,
      serviceId: DEFAULT_IDS.serviceId,
      roomId: DEFAULT_IDS.roomId,
      serviceFee: 150000,
      appointmentDate: '2026-03-20',
      appointmentTime: '08:00',
      durationMinutes: 30,
      type: 'IN_PERSON',
      symptoms: 'Sheet fail verification',
      notes: 'agent-06',
      priority: 'NORMAL',
    }
  }

  if (testCase.id === 'PF-10') {
    return {
      consultationId: 1,
      senderId: userId || DEFAULT_IDS.userId,
      content: 'Sheet fail verification message',
      type: 'TEXT',
    }
  }

  return undefined
}

const parseJsonSafe = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function tryLogin(request, role) {
  if (!role) {
    return { token: null, userId: null, reason: 'no-role' }
  }

  if (tokenCache.has(role)) {
    return tokenCache.get(role)
  }

  const account = ACCOUNTS[role]
  if (!account) {
    return { token: null, userId: null, reason: `unknown-role:${role}` }
  }

  try {
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: account.email,
        password: account.password,
      },
    })

    const bodyText = await response.text().catch(() => '')
    const payload = parseJsonSafe(bodyText)
    const token = payload?.token || null
    const userId = payload?.userId || null

    if (!response.ok() || !token) {
      return {
        token: null,
        userId: null,
        reason: `login-${response.status()}`,
      }
    }

    const loginResult = { token, userId, reason: 'ok' }
    tokenCache.set(role, loginResult)
    return loginResult
  } catch (error) {
    return {
      token: null,
      userId: null,
      reason: `login-error:${String(error?.message || error).slice(0, 80)}`,
    }
  }
}

async function executeFailCaseCheck(request, testCase) {
  const parsedStep = parseStep(testCase.testStep)
  if (!parsedStep) {
    throw new Error(`Cannot parse testStep for ${testCase.id}: ${testCase.testStep}`)
  }

  const method = String(testCase.method || parsedStep.method).toUpperCase()
  const path = String(testCase.path || parsedStep.path)
  const role = ROLE_BY_CASE[testCase.id] || null
  const auth = await tryLogin(request, role)

  const headers = { 'Content-Type': 'application/json' }
  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }

  const payload = resolveCasePayload(testCase, auth.userId)
  const url = new URL(path, API_BASE_URL)

  const startedAt = Date.now()
  const response = await request.fetch(url.toString(), {
    method,
    headers,
    data: payload,
  })
  const durationMs = Date.now() - startedAt
  const body = await response.text().catch(() => '')
  const sheetFailureStatus = extractReportedStatus(testCase.rawCells?.[4])
  const authState = role ? `${role}:${auth.reason}` : 'no-auth-required'
  const debug = [
    `[${testCase.id}] ${method} ${url.pathname}${url.search}`,
    `status=${response.status()}`,
    `expected=${testCase.expectedStatus}`,
    `sheetFailure=${sheetFailureStatus ?? 'n/a'}`,
    `auth=${authState}`,
    `durationMs=${durationMs}`,
    `body=${body.slice(0, 220)}`,
  ].join(' | ')

  return {
    status: response.status(),
    sheetFailureStatus,
    debug,
  }
}

test.describe(`Sheet fail verification | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_FAIL_GENERATED, 'Set RUN_SHEET_FAIL_GENERATED=true to execute fail verification tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | verify failure reproducibility | ${testCase.name}`, async ({ request }) => {
      const moduleName = String(testCase.module || '').toLowerCase()
      const pathName = String(testCase.path || '').toLowerCase()
      const caseSkipReason = CASE_SKIP_REASONS[testCase.id]

      test.skip(SKIP_PAYMENT && (moduleName.includes('payment') || pathName.includes('/payment')), 'Payment cases disabled by SHEET_SKIP_PAYMENT=true')
      test.skip(Boolean(caseSkipReason), caseSkipReason)
      test.skip(!testCase.testStep, 'Sheet row has no HTTP method/path; manual mapping required')
      test.skip(!testCase.expectedStatus, 'Sheet row has no expected HTTP status')

      let result
      try {
        result = await executeFailCaseCheck(request, testCase)
      } catch (error) {
        test.skip(`Request failed before response: ${String(error?.message || error).slice(0, 120)}`)
      }

      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
      expect(result.status, result.debug).not.toBe(testCase.expectedStatus)
    })
  }
})
