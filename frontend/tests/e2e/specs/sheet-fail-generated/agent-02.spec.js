import { test, expect } from '@playwright/test'
import { API_BASE_URL, E2E_ACCOUNTS } from '../../helpers/auth-accounts.js'

const RUN_SHEET_FAIL_GENERATED = process.env.RUN_SHEET_FAIL_GENERATED === 'true'
const SKIP_PAYMENT = process.env.SHEET_SKIP_PAYMENT === 'true'
const AGENT_NAME = 'agent-02'
const DEFAULT_DOCTOR_ID = Number(process.env.SHEET_DOCTOR_ID || 801)

const CASES = [
  {
    rowNumber: 11,
    id: 'TC-067',
    name: 'Xóa lịch BS',
    module: 'Schedule',
    expectedResult: 'HTTP 204',
    expectedStatus: 204,
    testStep: 'DELETE /api/schedules/{id}',
    method: 'DELETE',
    path: '/api/schedules/{id}',
    qualifier: '',
    reproducibleStatuses: [404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-067', 'Xóa lịch BS', 'HTTP 204', '', 'Fail', 'Schedule', '', ''],
  },
  {
    rowNumber: 12,
    id: 'TC-068',
    name: 'Xem thông báo',
    module: 'Notification',
    expectedResult: 'HTTP 200',
    expectedStatus: 200,
    testStep: 'GET /api/notifications/user/{userId}',
    method: 'GET',
    path: '/api/notifications/user/{userId}',
    qualifier: '',
    reproducibleStatuses: [400, 401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-068', 'Xem thông báo', 'HTTP 200', 'HTTP 0 - no uid', 'Fail', 'Notification', '', ''],
  },
  {
    rowNumber: 13,
    id: 'TC-069',
    name: 'Đếm chưa đọc',
    module: 'Notification',
    expectedResult: 'HTTP 200',
    expectedStatus: 200,
    testStep: 'GET /api/notifications/user/{userId}/unread/count',
    method: 'GET',
    path: '/api/notifications/user/{userId}/unread/count',
    qualifier: '',
    reproducibleStatuses: [400, 401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-069', 'Đếm chưa đọc', 'HTTP 200', 'HTTP 0 - no uid', 'Fail', 'Notification', '', ''],
  },
  {
    rowNumber: 14,
    id: 'TC-070',
    name: 'Tạo hồ sơ bệnh án',
    module: 'MedicalRecord',
    expectedResult: 'HTTP 201',
    expectedStatus: 201,
    testStep: 'POST /api/medical-records',
    method: 'POST',
    path: '/api/medical-records',
    qualifier: '',
    reproducibleStatuses: [400, 401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-070', 'Tạo hồ sơ bệnh án', 'HTTP 201', 'HTTP 0 - appt=None, uid=None, doc=1801', 'Fail', 'MedicalRecord', '', ''],
  },
  {
    rowNumber: 15,
    id: 'TC-072',
    name: 'Xem hồ sơ theo ID',
    module: 'MedicalRecord',
    expectedResult: 'HTTP 200',
    expectedStatus: 200,
    testStep: 'GET /api/medical-records/{id}',
    method: 'GET',
    path: '/api/medical-records/{id}',
    qualifier: '',
    reproducibleStatuses: [401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-072', 'Xem hồ sơ theo ID', 'HTTP 200', 'HTTP 0 - no mr', 'Fail', 'MedicalRecord', '', ''],
  },
  {
    rowNumber: 16,
    id: 'TC-073',
    name: 'Xem hồ sơ theo bệnh nhân',
    module: 'MedicalRecord',
    expectedResult: 'HTTP 200',
    expectedStatus: 200,
    testStep: 'GET /api/medical-records/patient/{patientId}',
    method: 'GET',
    path: '/api/medical-records/patient/{patientId}',
    qualifier: '',
    reproducibleStatuses: [401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-073', 'Xem hồ sơ theo bệnh nhân', 'HTTP 200', 'HTTP 0 - no uid', 'Fail', 'MedicalRecord', '', ''],
  },
  {
    rowNumber: 17,
    id: 'TC-074',
    name: 'Xem hồ sơ theo BS',
    module: 'MedicalRecord',
    expectedResult: 'HTTP 200',
    expectedStatus: 200,
    testStep: 'GET /api/medical-records/doctor/{doctorId}',
    method: 'GET',
    path: '/api/medical-records/doctor/{doctorId}',
    qualifier: '',
    reproducibleStatuses: [401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-074', 'Xem hồ sơ theo BS', 'HTTP 200', 'HTTP 403 - Bệnh nhân không có quyền truy cập endpoint này', 'Fail', 'MedicalRecord', '', ''],
  },
  {
    rowNumber: 18,
    id: 'TC-076',
    name: 'Xóa hồ sơ',
    module: 'MedicalRecord',
    expectedResult: 'HTTP 204',
    expectedStatus: 204,
    testStep: 'DELETE /api/medical-records/{id}',
    method: 'DELETE',
    path: '/api/medical-records/{id}',
    qualifier: '',
    reproducibleStatuses: [401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-076', 'Xóa hồ sơ', 'HTTP 204', 'HTTP 0 - no mr', 'Fail', 'MedicalRecord', '', ''],
  },
  {
    rowNumber: 19,
    id: 'TC-077',
    name: 'Thêm đơn thuốc',
    module: 'Prescription',
    expectedResult: 'HTTP 201',
    expectedStatus: 201,
    testStep: 'POST /api/prescriptions/medical-record/{id}',
    method: 'POST',
    path: '/api/prescriptions/medical-record/{id}',
    qualifier: '',
    reproducibleStatuses: [400, 401, 403, 404, 500],
    source: 'mapped-from-sheet-summary',
    rawCells: ['TC-077', 'Thêm đơn thuốc', 'HTTP 201', 'HTTP 0 - no rx', 'Fail', 'Prescription', '???', ''],
  },
]

const authCache = new Map()
let uniqueCounter = 0

const parseJsonSafe = (value) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const normalizeRole = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized.startsWith('ROLE_')) {
    return normalized.slice(5)
  }
  return normalized
}

const nextUniqueSuffix = () => {
  uniqueCounter += 1
  return `${Date.now()}-${process.pid || 0}-${uniqueCounter}`
}

const toPositiveId = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

const fallbackUserIdForRole = (role) => {
  if (role === 'DOCTOR') return DEFAULT_DOCTOR_ID
  if (role === 'PATIENT') return Number(process.env.SHEET_USER_ID || 1)
  return Number(process.env.SHEET_ADMIN_USER_ID || 1)
}

const extractId = (payload) =>
  toPositiveId(payload?.id) ||
  toPositiveId(payload?.data?.id) ||
  toPositiveId(payload?.medicalRecordId) ||
  toPositiveId(payload?.scheduleId) ||
  toPositiveId(payload?.prescriptionId)

const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const buildHeaders = (auth) => {
  const headers = { 'Content-Type': 'application/json' }
  if (!auth?.token) {
    return headers
  }

  headers.Authorization = `Bearer ${auth.token}`
  headers['X-User-Id'] = String(auth.userId)
  headers['X-User-Role'] = String(auth.role)
  return headers
}

const loginAs = async (request, roleKey) => {
  if (authCache.has(roleKey)) {
    return authCache.get(roleKey)
  }

  const account = E2E_ACCOUNTS[roleKey]
  if (!account) {
    throw new Error(`Unknown account role: ${roleKey}`)
  }

  let lastError = `[${roleKey}] login failed: unknown error`

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: account.email,
        password: account.password,
      },
    })

    const responseText = await response.text().catch(() => '')
    const payload = parseJsonSafe(responseText)

    if (response.ok() && payload?.token) {
      const role = normalizeRole(payload?.role || account.role || roleKey)
      const userId =
        toPositiveId(payload?.userId) ||
        toPositiveId(payload?.id) ||
        toPositiveId(payload?.data?.userId) ||
        fallbackUserIdForRole(role)

      const auth = {
        token: payload.token,
        userId,
        role,
      }

      authCache.set(roleKey, auth)
      return auth
    }

    lastError = `[${roleKey}] login failed: ${response.status()} ${responseText.slice(0, 240)}`
    const shouldRetry = [502, 503, 504].includes(response.status())
    if (!shouldRetry || attempt === 3) {
      break
    }

    await waitFor(attempt * 300)
  }

  throw new Error(lastError)
}

const apiRequest = async (request, { testCase, method, path, auth, data, params }) => {
  const start = Date.now()
  const response = await request.fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(auth),
    data,
    params,
  })
  const durationMs = Date.now() - start

  const bodyText = await response.text().catch(() => '')
  const bodyJson = parseJsonSafe(bodyText)

  return {
    status: response.status(),
    durationMs,
    bodyText,
    bodyJson,
    debug: [
      `[${testCase.id}] ${method} ${path}`,
      `status=${response.status()}`,
      `durationMs=${durationMs}`,
      `body=${bodyText.slice(0, 240)}`,
    ].join(' | '),
  }
}

const createMedicalRecordFixture = async (request, testCase) => {
  const doctorAuth = await loginAs(request, 'DOCTOR')
  const patientAuth = await loginAs(request, 'PATIENT')

  const createResult = await apiRequest(request, {
    testCase,
    method: 'POST',
    path: '/api/medical-records',
    auth: doctorAuth,
    data: {
      appointmentId: null,
      patientId: patientAuth.userId,
      doctorId: doctorAuth.userId,
      diagnosis: `Sheet fail repro diagnosis ${nextUniqueSuffix()}`,
      symptoms: 'Headache',
      treatmentPlan: 'Rest and hydration',
      notes: 'Generated by sheet fail verification',
    },
  })

  return {
    doctorAuth,
    patientAuth,
    createResult,
    recordId: extractId(createResult.bodyJson),
  }
}

const createScheduleFixture = async (request, testCase) => {
  const doctorAuth = await loginAs(request, 'DOCTOR')

  const listResult = await apiRequest(request, {
    testCase,
    method: 'GET',
    path: `/api/schedules/doctor/${doctorAuth.userId}`,
    auth: doctorAuth,
  })

  if (listResult.status !== 200) {
    return {
      skipReason: `Cannot list schedules for setup (status ${listResult.status})`,
    }
  }

  const existingSchedules = Array.isArray(listResult.bodyJson) ? listResult.bodyJson : []
  const usedDays = new Set(existingSchedules.map((item) => Number(item?.dayOfWeek)).filter((day) => Number.isInteger(day)))
  const candidateDay = [0, 1, 2, 3, 4, 5, 6].find((day) => !usedDays.has(day))

  if (candidateDay == null) {
    return {
      skipReason: 'No available day to create an isolated schedule fixture for deletion',
    }
  }

  const createResult = await apiRequest(request, {
    testCase,
    method: 'POST',
    path: '/api/schedules',
    auth: doctorAuth,
    data: {
      doctorId: doctorAuth.userId,
      dayOfWeek: candidateDay,
      startTime: '08:00:00',
      endTime: '10:00:00',
      isAvailable: true,
    },
  })

  const scheduleId = extractId(createResult.bodyJson)

  if (createResult.status !== 201 || !scheduleId) {
    return {
      skipReason: `Cannot create schedule fixture for delete case (status ${createResult.status})`,
    }
  }

  return {
    doctorAuth,
    scheduleId,
  }
}

const executeAgentCase = async (request, testCase) => {
  switch (testCase.id) {
    case 'TC-067': {
      const scheduleFixture = await createScheduleFixture(request, testCase)
      if (scheduleFixture.skipReason) {
        return { skipReason: scheduleFixture.skipReason }
      }

      return apiRequest(request, {
        testCase,
        method: 'DELETE',
        path: `/api/schedules/${scheduleFixture.scheduleId}`,
        auth: scheduleFixture.doctorAuth,
      })
    }

    case 'TC-068': {
      const patientAuth = await loginAs(request, 'PATIENT')
      return apiRequest(request, {
        testCase,
        method: 'GET',
        path: `/api/notifications/user/${patientAuth.userId}`,
        auth: patientAuth,
        params: { page: 0, size: 5 },
      })
    }

    case 'TC-069': {
      const patientAuth = await loginAs(request, 'PATIENT')
      return apiRequest(request, {
        testCase,
        method: 'GET',
        path: `/api/notifications/user/${patientAuth.userId}/unread/count`,
        auth: patientAuth,
      })
    }

    case 'TC-070': {
      const fixture = await createMedicalRecordFixture(request, testCase)
      return fixture.createResult
    }

    case 'TC-072': {
      const fixture = await createMedicalRecordFixture(request, testCase)
      if (fixture.createResult.status !== 201 || !fixture.recordId) {
        return {
          skipReason: `Cannot prepare medical-record fixture for ${testCase.id} (status ${fixture.createResult.status})`,
        }
      }

      return apiRequest(request, {
        testCase,
        method: 'GET',
        path: `/api/medical-records/${fixture.recordId}`,
        auth: fixture.doctorAuth,
      })
    }

    case 'TC-073': {
      const patientAuth = await loginAs(request, 'PATIENT')
      return apiRequest(request, {
        testCase,
        method: 'GET',
        path: `/api/medical-records/patient/${patientAuth.userId}`,
        auth: patientAuth,
        params: { page: 0, size: 5 },
      })
    }

    case 'TC-074': {
      const patientAuth = await loginAs(request, 'PATIENT')
      const doctorAuth = await loginAs(request, 'DOCTOR')

      return apiRequest(request, {
        testCase,
        method: 'GET',
        path: `/api/medical-records/doctor/${doctorAuth.userId}`,
        auth: patientAuth,
        params: { page: 0, size: 5 },
      })
    }

    case 'TC-076': {
      const fixture = await createMedicalRecordFixture(request, testCase)
      if (fixture.createResult.status !== 201 || !fixture.recordId) {
        return {
          skipReason: `Cannot prepare medical-record fixture for ${testCase.id} (status ${fixture.createResult.status})`,
        }
      }

      const adminAuth = await loginAs(request, 'ADMIN')
      return apiRequest(request, {
        testCase,
        method: 'DELETE',
        path: `/api/medical-records/${fixture.recordId}`,
        auth: adminAuth,
      })
    }

    case 'TC-077': {
      const fixture = await createMedicalRecordFixture(request, testCase)
      if (fixture.createResult.status !== 201 || !fixture.recordId) {
        return {
          skipReason: `Cannot prepare medical-record fixture for ${testCase.id} (status ${fixture.createResult.status})`,
        }
      }

      return apiRequest(request, {
        testCase,
        method: 'POST',
        path: `/api/prescriptions/medical-record/${fixture.recordId}`,
        auth: fixture.doctorAuth,
        data: {
          doctorId: fixture.doctorAuth.userId,
          medicationName: `Sheet RX ${nextUniqueSuffix()}`,
          dosage: '1 tablet',
          frequency: '2 times/day',
          duration: '5 days',
          instructions: 'After meals',
          notes: 'Created by sheet fail verification',
        },
      })
    }

    default:
      return { skipReason: `No mapped API execution for ${testCase.id}` }
  }
}

test.describe(`Sheet fail verification | ${AGENT_NAME}`, () => {
  test.beforeEach(() => {
    test.skip(!RUN_SHEET_FAIL_GENERATED, 'Set RUN_SHEET_FAIL_GENERATED=true to execute fail verification tests')
  })

  for (const testCase of CASES) {
    test(`${testCase.id} | mapped API reproducibility check | ${testCase.name}`, async ({ request }) => {
      const moduleName = String(testCase.module || '').toLowerCase()
      const pathName = String(testCase.path || '').toLowerCase()

      test.skip(
        SKIP_PAYMENT && (moduleName.includes('payment') || pathName.includes('/payment')),
        'Payment cases disabled by SHEET_SKIP_PAYMENT=true'
      )
      test.skip(!testCase.expectedStatus, 'Sheet row has no expected HTTP status')

      const result = await executeAgentCase(request, testCase)
      test.skip(Boolean(result?.skipReason), result.skipReason)

      expect(result.status, result.debug).toBeGreaterThanOrEqual(100)
      expect(result.status, result.debug).toBeLessThan(600)

      const reproduced = result.status !== testCase.expectedStatus
      test.info().annotations.push({
        type: 'sheet-failure-reproduced',
        description: reproduced ? `yes (status ${result.status})` : `no (status ${result.status})`,
      })

      if (reproduced) {
        expect(testCase.reproducibleStatuses, result.debug).toContain(result.status)
      } else {
        expect(result.status, result.debug).toBe(testCase.expectedStatus)
      }
    })
  }
})
