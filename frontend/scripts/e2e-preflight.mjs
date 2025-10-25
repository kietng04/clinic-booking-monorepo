const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080'

const ACCOUNTS = [
  { role: 'PATIENT', email: process.env.E2E_PATIENT_EMAIL || 'patient1@clinic.com', password: process.env.E2E_PASSWORD || 'password' },
  { role: 'DOCTOR', email: process.env.E2E_DOCTOR_EMAIL || 'dr.sarah@clinic.com', password: process.env.E2E_PASSWORD || 'password' },
  { role: 'ADMIN', email: process.env.E2E_ADMIN_EMAIL || 'admin@clinic.com', password: process.env.E2E_PASSWORD || 'password' },
]

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15_000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

const checkGatewayHealth = async () => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/actuator/health`)
  if (!res.ok) {
    throw new Error(`Gateway health check failed: ${res.status}`)
  }
}

const assertLogin = async ({ role, email, password }) => {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`[${role}] login failed (${res.status}): ${body.slice(0, 240)}`)
  }

  const payload = await res.json()
  const hasToken = Boolean(payload?.token)
  const hasRefreshToken = Boolean(payload?.refreshToken)
  const hasUserId = payload?.userId !== undefined && payload?.userId !== null

  if (!hasToken || !hasRefreshToken || !hasUserId) {
    throw new Error(`[${role}] invalid login payload`)
  }

  return { role, userId: payload.userId }
}

const main = async () => {
  await checkGatewayHealth()

  const results = []
  for (const account of ACCOUNTS) {
    results.push(await assertLogin(account))
  }

  const summary = results.map((r) => `${r.role}:${r.userId}`).join(', ')
  console.log(`Preflight passed (${summary})`)
}

main().catch((error) => {
  console.error(`Preflight failed: ${error.message}`)
  process.exit(1)
})
