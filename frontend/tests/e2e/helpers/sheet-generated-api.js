const API_BASE_URL = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ACCOUNTS = {
  PATIENT: {
    email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
  DOCTOR: {
    email: process.env.E2E_DOCTOR_EMAIL || 'dr.sarah@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
  ADMIN: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@clinic.com',
    password: process.env.E2E_PASSWORD || 'password',
  },
}

const DEFAULT_IDS = {
  userId: Number(process.env.SHEET_USER_ID || 1),
  familyMemberId: Number(process.env.SHEET_FAMILY_MEMBER_ID || 1),
  appointmentId: Number(process.env.SHEET_APPOINTMENT_ID || 1),
  clinicId: Number(process.env.SHEET_CLINIC_ID || 1),
  roomId: Number(process.env.SHEET_ROOM_ID || 1),
  serviceId: Number(process.env.SHEET_SERVICE_ID || 1),
  doctorId: Number(process.env.SHEET_DOCTOR_ID || 801),
}

const tokenCache = new Map()
const loginPayloadCache = new Map()
const REGISTER_PHONE_MOD = 100000000
const REGISTER_PHONE_PREFIX = '09'
const UNIQUE_RUN_SEED = Date.now() + (process.pid || 0)
const APPOINTMENT_TIME_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']
let uniqueCounter = 0
let lastAppointmentSlot = null

const nowIsoDate = (offsetDays = 0) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + offsetDays)
  return dt.toISOString().slice(0, 10)
}

const nextUniqueCounter = () => {
  uniqueCounter += 1
  return uniqueCounter
}

const uniqueSuffix = () => `${UNIQUE_RUN_SEED}${nextUniqueCounter()}`

const uniqueEmail = (prefix) => `${prefix}.${uniqueSuffix()}@clinic.test`

const uniqueRegisterPhone = () => {
  const sequence = nextUniqueCounter()
  const numericBody = (UNIQUE_RUN_SEED + sequence) % REGISTER_PHONE_MOD
  return `${REGISTER_PHONE_PREFIX}${String(numericBody).padStart(8, '0')}`
}

const nextAppointmentSlot = (qualifier) => {
  const normalized = String(qualifier || '').toLowerCase()
  if (normalized.includes('dup') && lastAppointmentSlot) {
    return lastAppointmentSlot
  }

  const sequence = nextUniqueCounter()
  const slotIndex = (UNIQUE_RUN_SEED + sequence) % APPOINTMENT_TIME_SLOTS.length
  const dayOffset = 4 + (Math.floor((UNIQUE_RUN_SEED + sequence) / APPOINTMENT_TIME_SLOTS.length) % 21)
  const appointmentDate = new Date()
  appointmentDate.setDate(appointmentDate.getDate() + dayOffset)
  const slot = {
    appointmentDate: appointmentDate.toISOString().slice(0, 10),
    appointmentTime: APPOINTMENT_TIME_SLOTS[slotIndex],
  }

  if (!normalized.includes('no date')) {
    lastAppointmentSlot = slot
  }

  return slot
}

const parseJsonSafe = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const parseStep = (testStep) => {
  const match = String(testStep || '').match(/^\s*(GET|POST|PUT|PATCH|DELETE)\s+(\S+)(?:\s+(.*))?$/i)
  if (!match) {
    throw new Error(`Cannot parse test step: ${testStep}`)
  }
  return {
    method: match[1].toUpperCase(),
    path: match[2],
    qualifier: (match[3] || '').trim().toLowerCase(),
  }
}

const remapSheetPathToApiPath = (rawPath) => {
  if (rawPath === '/api/auth/change-password') {
    return '/api/profile/password'
  }
  return rawPath
}

const normalizePath = (rawPath, context) => {
  if (!rawPath.includes('None')) {
    return rawPath
  }

  if (rawPath.includes('/api/family-members/user/')) {
    return rawPath.replaceAll('None', String(context.patientUserId || DEFAULT_IDS.userId))
  }
  if (rawPath.includes('/api/users/')) {
    return rawPath.replaceAll('None', String(context.adminUserId || context.patientUserId || DEFAULT_IDS.userId))
  }
  if (rawPath.includes('/api/family-members/')) {
    return rawPath.replaceAll('None', String(DEFAULT_IDS.familyMemberId))
  }
  if (rawPath.includes('/api/appointments/')) {
    return rawPath.replaceAll('None', String(DEFAULT_IDS.appointmentId))
  }
  if (rawPath.includes('/api/clinics/')) {
    return rawPath.replaceAll('None', String(DEFAULT_IDS.clinicId))
  }
  if (rawPath.includes('/api/rooms/')) {
    return rawPath.replaceAll('None', String(DEFAULT_IDS.roomId))
  }
  if (rawPath.includes('/api/services/')) {
    return rawPath.replaceAll('None', String(DEFAULT_IDS.serviceId))
  }

  return rawPath.replaceAll('None', '1')
}

const inferRole = (testCase, parsedStep) => {
  const path = parsedStep.path
  const name = String(testCase.name || '').toLowerCase()

  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register') || path.startsWith('/api/auth/forgot-password')) {
    return null
  }
  if (path.startsWith('/api/auth/refresh')) {
    return null
  }
  if (path.startsWith('/api/auth/change-password')) {
    return 'PATIENT'
  }
  if (path.startsWith('/api/profile')) {
    return 'PATIENT'
  }
  if (path.startsWith('/api/family-members')) {
    return 'PATIENT'
  }
  if (path.startsWith('/api/users')) {
    if (name.includes('patient không đủ quyền')) {
      return 'PATIENT'
    }
    return 'ADMIN'
  }
  if (path.startsWith('/api/appointments')) {
    if (path.includes('/doctor/')) {
      return 'DOCTOR'
    }
    return 'PATIENT'
  }
  if (path.startsWith('/api/clinics') || path.startsWith('/api/rooms') || path.startsWith('/api/services')) {
    return 'ADMIN'
  }
  return null
}

const ensureLoggedIn = async (request, role) => {
  if (!role) {
    return null
  }
  if (tokenCache.has(role)) {
    return loginPayloadCache.get(role)
  }

  const account = ACCOUNTS[role]
  if (!account) {
    throw new Error(`Unknown role for login: ${role}`)
  }

  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: account.email,
      password: account.password,
    },
  })

  if (!response.ok()) {
    const bodyText = await response.text().catch(() => '')
    throw new Error(`Login failed for ${role}: ${response.status()} ${bodyText.slice(0, 240)}`)
  }

  const payload = await parseJsonSafe(response)
  const token = payload?.token
  if (!token) {
    throw new Error(`Login payload for ${role} does not include token`)
  }

  tokenCache.set(role, token)
  loginPayloadCache.set(role, payload)
  return payload
}

const parseQueryFromPath = (rawPath) => {
  const url = new URL(rawPath, API_BASE_URL)
  return {
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
  }
}

const buildAuthHeaders = (role, authPayload) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (role && authPayload?.token) {
    headers.Authorization = `Bearer ${authPayload.token}`
  }

  return headers
}

const maybeDropField = (objectValue, fieldName, shouldDrop) => {
  if (!shouldDrop) {
    return objectValue
  }

  const cloned = { ...objectValue }
  delete cloned[fieldName]
  return cloned
}

const buildRequestData = ({ testCase, parsedStep, context }) => {
  const path = parsedStep.path
  const qualifier = parsedStep.qualifier
  const method = parsedStep.method

  if (path === '/api/auth/register') {
    const registerEmail = uniqueEmail('register')
    const registerPhone = uniqueRegisterPhone()
    let payload = {
      email: registerEmail,
      password: ACCOUNTS.PATIENT.password,
      fullName: 'Sheet Register User',
      phone: registerPhone,
      role: 'PATIENT',
    }

    if (qualifier.includes('dup')) payload.email = ACCOUNTS.PATIENT.email
    if (qualifier.includes('bad email')) payload.email = 'not-an-email'
    if (qualifier.includes('bad phone')) payload.phone = 'abc'
    if (qualifier.includes('no pass')) payload = maybeDropField(payload, 'password', true)
    if (qualifier.includes('no name')) payload = maybeDropField(payload, 'fullName', true)

    return { data: payload }
  }

  if (path === '/api/auth/login') {
    const payload = {
      email: qualifier.includes('no user') ? uniqueEmail('nouser') : ACCOUNTS.PATIENT.email,
      password: qualifier.includes('wrong pass') ? 'wrong-password' : ACCOUNTS.PATIENT.password,
    }
    return { data: payload }
  }

  if (path === '/api/auth/refresh') {
    const refreshToken = qualifier.includes('bad')
      ? 'invalid-refresh-token'
      : (context.patientLogin?.refreshToken || 'invalid-refresh-token')

    return {
      params: { refreshToken },
    }
  }

  if (path === '/api/auth/forgot-password') {
    return { data: { email: ACCOUNTS.PATIENT.email } }
  }

  if (path === '/api/profile/password') {
    return {
      data: {
        currentPassword: qualifier.includes('sai old') ? 'wrong-password' : ACCOUNTS.PATIENT.password,
        newPassword: ACCOUNTS.PATIENT.password,
      },
    }
  }

  if (path === '/api/users' && method === 'POST') {
    return {
      data: {
        email: uniqueEmail('sheet-user'),
        password: ACCOUNTS.PATIENT.password,
        fullName: 'Sheet Generated User',
        phone: '0911111111',
        role: 'PATIENT',
      },
    }
  }

  if (path.startsWith('/api/users/') && method === 'PUT') {
    return {
      data: {
        fullName: `Sheet Updated User ${uniqueSuffix()}`,
        phone: '0912222222',
      },
    }
  }

  if (path === '/api/family-members' && method === 'POST') {
    return {
      data: {
        userId: context.patientUserId || DEFAULT_IDS.userId,
        fullName: qualifier.includes('no name') ? '' : 'Sheet Family Member',
        relationship: 'SPOUSE',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        email: uniqueEmail('family'),
        phoneNumber: '0913333333',
      },
    }
  }

  if (path.startsWith('/api/family-members/') && method === 'PUT') {
    return {
      data: {
        fullName: `Sheet Family Updated ${uniqueSuffix()}`,
        relationship: 'PARENT',
      },
    }
  }

  if (path === '/api/appointments' && method === 'POST') {
    const slot = nextAppointmentSlot(qualifier)
    return {
      data: {
        patientId: context.patientUserId || DEFAULT_IDS.userId,
        doctorId: DEFAULT_IDS.doctorId,
        familyMemberId: null,
        clinicId: DEFAULT_IDS.clinicId,
        serviceId: DEFAULT_IDS.serviceId,
        roomId: DEFAULT_IDS.roomId,
        serviceFee: 150000,
        appointmentDate: qualifier.includes('no date') ? null : slot.appointmentDate,
        appointmentTime: slot.appointmentTime,
        durationMinutes: 30,
        type: 'IN_PERSON',
        symptoms: 'Generated by sheet automation',
        notes: 'Sheet auto test',
        priority: 'NORMAL',
      },
    }
  }

  if (path.startsWith('/api/appointments/') && path.endsWith('/feedback') && method === 'PUT') {
    return {
      data: {
        rating: 4,
        review: 'Automated feedback check',
      },
    }
  }

  if (path.startsWith('/api/appointments/') && path.endsWith('/cancel') && method === 'PUT') {
    return {
      params: {
        reason: 'Automation cancel test',
      },
    }
  }

  if (path.startsWith('/api/appointments/') && method === 'PUT') {
    return {
      data: {
        notes: 'Automated update',
      },
    }
  }

  if (path === '/api/appointments/search' && method === 'GET') {
    return {
      params: {
        page: 0,
        size: 5,
      },
    }
  }

  if (path === '/api/clinics' && method === 'POST') {
    return {
      data: {
        name: qualifier.includes('no name') ? '' : `Sheet Clinic ${uniqueSuffix()}`,
        address: '123 Automation Street',
        phone: '0281234567',
      },
    }
  }

  if (path.startsWith('/api/clinics/') && method === 'PUT') {
    return {
      data: {
        name: `Sheet Clinic Updated ${uniqueSuffix()}`,
        address: '456 Automation Avenue',
        phone: '0287654321',
      },
    }
  }

  if (path === '/api/rooms' && method === 'POST') {
    return {
      data: {
        clinicId: DEFAULT_IDS.clinicId,
        name: qualifier.includes('no name') ? '' : `Sheet Room ${uniqueSuffix()}`,
        type: 'CONSULTATION',
        capacity: 1,
      },
    }
  }

  if (path.startsWith('/api/rooms/') && method === 'PUT') {
    return {
      data: {
        name: `Sheet Room Updated ${uniqueSuffix()}`,
      },
    }
  }

  if (path === '/api/services' && method === 'POST') {
    return {
      data: {
        clinicId: DEFAULT_IDS.clinicId,
        name: qualifier.includes('no name') ? '' : `Sheet Service ${uniqueSuffix()}`,
        description: 'Generated service',
        price: 100000,
      },
    }
  }

  if (path.startsWith('/api/services/') && method === 'PUT') {
    return {
      data: {
        name: `Sheet Service Updated ${uniqueSuffix()}`,
      },
    }
  }

  return {}
}

export async function executeSheetCase(request, testCase) {
  const parsedStep = parseStep(testCase.testStep)
  const effectiveStep = {
    ...parsedStep,
    path: remapSheetPathToApiPath(parsedStep.path),
  }

  const patientLogin = await ensureLoggedIn(request, 'PATIENT')
  const adminLogin = await ensureLoggedIn(request, 'ADMIN')

  const role = inferRole(testCase, effectiveStep)
  const authPayload = role ? await ensureLoggedIn(request, role) : null

  const normalizedPath = normalizePath(effectiveStep.path, {
    patientUserId: patientLogin?.userId,
    adminUserId: adminLogin?.userId,
  })

  const parsedPath = parseQueryFromPath(normalizedPath)
  const requestData = buildRequestData({
    testCase,
    parsedStep: {
      ...parsedStep,
      path: parsedPath.pathname,
    },
    context: {
      patientUserId: patientLogin?.userId,
      patientLogin,
    },
  })

  const url = new URL(parsedPath.pathname, API_BASE_URL)
  const params = {
    ...parsedPath.query,
    ...(requestData.params || {}),
  }

  const start = Date.now()
  const response = await request.fetch(url.toString(), {
    method: effectiveStep.method,
    headers: buildAuthHeaders(role, authPayload),
    params,
    data: requestData.data,
  })
  const durationMs = Date.now() - start

  const responseText = await response.text().catch(() => '')
  const debug = [
    `[${testCase.id}] ${effectiveStep.method} ${url.pathname}${url.search}`,
    `status=${response.status()}`,
    `durationMs=${durationMs}`,
    `body=${responseText.slice(0, 240)}`,
  ].join(' | ')

  return {
    status: response.status(),
    durationMs,
    debug,
  }
}
