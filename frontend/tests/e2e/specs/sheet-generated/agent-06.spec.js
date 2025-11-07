import { test, expect } from '@playwright/test'

const RUN_SHEET_GENERATED = process.env.RUN_SHEET_GENERATED === 'true'
const AGENT_NAME = 'agent-06'
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

const createFamilyMember = async (request, auth, testCase) => {
  const response = await request.fetch(`${API_BASE_URL}/api/family-members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    data: {
      userId: auth.userId,
      fullName: `Sheet Family Member ${uniqueSuffix()}`,
      relationship: 'SPOUSE',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      email: uniqueEmail('family'),
      phoneNumber: '0913333333',
    },
  })

  const bodyText = await response.text().catch(() => '')
  let payload = null
  try {
    payload = bodyText ? JSON.parse(bodyText) : null
  } catch {
    payload = null
  }

  if (!response.ok() || !payload?.id) {
    throw new Error(
      `[${testCase.id}] seed family member failed (${response.status()}): ${bodyText.slice(0, 240)}`,
    )
  }

  return payload.id
}

const executeAgentCase = async (request, testCase) => {
  const auth = await getPatientAuth(request)

  if (testCase.id === 'TC-026') {
    const familyMemberId = await createFamilyMember(request, auth, testCase)
    return executeTimedRequest(request, {
      testCase,
      method: 'GET',
      path: `/api/family-members/${familyMemberId}`,
      token: auth.token,
    })
  }

  if (testCase.id === 'TC-027') {
    const familyMemberId = await createFamilyMember(request, auth, testCase)
    return executeTimedRequest(request, {
      testCase,
      method: 'PUT',
      path: `/api/family-members/${familyMemberId}`,
      token: auth.token,
      data: {
        fullName: `Sheet Family Updated ${uniqueSuffix()}`,
        relationship: 'PARENT',
      },
    })
  }

  if (testCase.id === 'TC-028') {
    const familyMemberId = await createFamilyMember(request, auth, testCase)
    return executeTimedRequest(request, {
      testCase,
      method: 'DELETE',
      path: `/api/family-members/${familyMemberId}`,
      token: auth.token,
    })
  }

  if (testCase.id === 'TC-029') {
    return executeTimedRequest(request, {
      testCase,
      method: 'DELETE',
      path: '/api/family-members/999999',
      token: auth.token,
    })
  }

  if (testCase.id === 'TC-030') {
    return executeTimedRequest(request, {
      testCase,
      method: 'POST',
      path: '/api/auth/forgot-password',
      data: { email: PATIENT_EMAIL },
    })
  }

  throw new Error(`Unsupported case in ${AGENT_NAME}: ${testCase.id}`)
}

const CASES = [
  {
    "id": "TC-026",
    "name": "Xem GĐ theo ID",
    "module": "Family",
    "testStep": "GET /api/family-members/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "GET",
    "path": "/api/family-members/None",
    "qualifier": ""
  },
  {
    "id": "TC-027",
    "name": "Cập nhật GĐ",
    "module": "Family",
    "testStep": "PUT /api/family-members/None",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "PUT",
    "path": "/api/family-members/None",
    "qualifier": ""
  },
  {
    "id": "TC-028",
    "name": "Xóa GĐ",
    "module": "Family",
    "testStep": "DELETE /api/family-members/None",
    "expectedResult": "HTTP 204",
    "expectedStatus": 204,
    "method": "DELETE",
    "path": "/api/family-members/None",
    "qualifier": ""
  },
  {
    "id": "TC-029",
    "name": "Xóa GĐ không tồn tại",
    "module": "Family",
    "testStep": "DELETE /api/family-members/999999",
    "expectedResult": "HTTP 404",
    "expectedStatus": 404,
    "method": "DELETE",
    "path": "/api/family-members/999999",
    "qualifier": ""
  },
  {
    "id": "TC-030",
    "name": "Quên mật khẩu",
    "module": "Password",
    "testStep": "POST /api/auth/forgot-password",
    "expectedResult": "HTTP 200",
    "expectedStatus": 200,
    "method": "POST",
    "path": "/api/auth/forgot-password",
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
      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)
    })
  }
})
