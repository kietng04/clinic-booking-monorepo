import { test, expect } from '@playwright/test'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-05'
const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PATIENT_EMAIL = process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com'
const PATIENT_PASSWORD = process.env.E2E_PASSWORD || 'password'

let patientAuthPromise

const uniqueSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`
const uniqueEmail = (prefix) => `${prefix}.${uniqueSuffix()}@clinic.test`

const getPatientAuth = async (request) => {
  if (patientAuthPromise) {
    return patientAuthPromise
  }

  patientAuthPromise = (async () => {
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: PATIENT_EMAIL,
        password: PATIENT_PASSWORD,
      },
    })

    if (!response.ok()) {
      const body = await response.text().catch(() => '')
      throw new Error(`PATIENT login failed (${response.status()}): ${body.slice(0, 240)}`)
    }

    const payload = await response.json().catch(() => null)
    if (!payload?.token) {
      throw new Error('PATIENT login payload does not include token')
    }

    return {
      token: payload.token,
      userId: payload.userId || 1,
    }
  })()

  return patientAuthPromise
}

const executeFamilyMemberPostCase = async (request, testCase) => {
  const auth = await getPatientAuth(request)
  const isMissingNameCase = testCase.qualifier === 'no name'
  const body = {
    userId: auth.userId,
    fullName: isMissingNameCase ? '' : 'Sheet Family Member',
    relationship: 'SPOUSE',
    dateOfBirth: '1990-01-01',
    gender: 'FEMALE',
    email: uniqueEmail('family'),
    phoneNumber: '0913333333',
  }

  const start = Date.now()
  const response = await request.fetch(`${API_BASE_URL}${testCase.path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    data: body,
  })
  const durationMs = Date.now() - start
  const responseText = await response.text().catch(() => '')

  return {
    status: response.status(),
    durationMs,
    debug: [
      `[${testCase.id}] POST ${testCase.path}`,
      `status=${response.status()}`,
      `durationMs=${durationMs}`,
      `body=${responseText.slice(0, 240)}`,
    ].join(' | '),
  }
}

const executeTimedRequest = async (request, { testCase, method, path, token, data }) => {
  const start = Date.now()
  const response = await request.fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    data,
  })
  const durationMs = Date.now() - start
  const responseText = await response.text().catch(() => '')

  return {
    status: response.status(),
    durationMs,
    debug: [
      `[${testCase.id}] ${method} ${path}`,
      `status=${response.status()}`,
      `durationMs=${durationMs}`,
      `body=${responseText.slice(0, 240)}`,
    ].join(' | '),
  }
}

const executeAgentCase = async (request, testCase) => {
  const auth = await getPatientAuth(request)

  if (testCase.id === 'TC-021') {
    return executeTimedRequest(request, {
      testCase,
      method: 'GET',
      path: '/api/profile',
      token: auth.token,
    })
  }

  if (testCase.id === 'TC-022') {
    return executeTimedRequest(request, {
      testCase,
      method: 'GET',
      path: '/api/users/doctors/specializations',
      token: auth.token,
    })
  }

  if (testCase.id === 'TC-023' || testCase.id === 'TC-024') {
    return executeFamilyMemberPostCase(request, testCase)
  }

  if (testCase.id === 'TC-025') {
    return executeTimedRequest(request, {
      testCase,
      method: 'GET',
      path: `/api/family-members/user/${auth.userId}`,
      token: auth.token,
    })
  }

  throw new Error(`Unsupported case in ${AGENT_NAME}: ${testCase.id}`)
}

const CASES = [
  {
    "id": "TC-021",
    "name": "Xem profile",
    "module": "User",
    "testStep": "GET /api/profile",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/profile",
    "qualifier": ""
  },
  {
    "id": "TC-022",
    "name": "Danh sách specializations",
    "module": "User",
    "testStep": "GET /api/users/specializations",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/users/specializations",
    "qualifier": ""
  },
  {
    "id": "TC-023",
    "name": "Thêm thành viên GĐ",
    "module": "Family",
    "testStep": "POST /api/family-members",
    "expectedResult": "HTTP 201",
    "expectedStatus": 201,
    "method": "POST",
    "path": "/api/family-members",
    "qualifier": ""
  },
  {
    "id": "TC-024",
    "name": "Thêm GĐ thiếu tên",
    "module": "Family",
    "testStep": "POST /api/family-members no name",
    "expectedResult": "HTTP 400",
    "expectedStatus": 400,
    "method": "POST",
    "path": "/api/family-members",
    "qualifier": "no name"
  },
  {
    "id": "TC-025",
    "name": "Xem GĐ theo user",
    "module": "Family",
    "testStep": "GET /api/family-members/user/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/family-members/user/None",
    "qualifier": ""
  }
]

test.describe(`Sheet generated API suite | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_GENERATED, 'Set RUN_SHEET_GENERATED=true to execute generated sheet tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | status contract | ${testCase.name}`, async ({ request }) => {
      const result = await executeAgentCase(request, testCase)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })

    test(`${testCase.id} | latency budget | ${testCase.name}`, async ({ request }) => {
      const result = await executeAgentCase(request, testCase)
      expect(result.durationMs, result.debug).toBeLessThanOrEqual(15_000)
      expect(result.status, result.debug).toBe(testCase.expectedStatus)
    })
  }
})
