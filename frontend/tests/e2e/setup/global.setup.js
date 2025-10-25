import { request } from '@playwright/test'
import { API_BASE_URL, E2E_ACCOUNTS } from '../helpers/auth-accounts.js'

const assertOk = async (response, label) => {
  if (!response.ok()) {
    const body = await response.text().catch(() => '')
    throw new Error(`${label} failed (${response.status()}): ${body.slice(0, 240)}`)
  }
}

export default async function globalSetup() {
  const context = await request.newContext({
    baseURL: API_BASE_URL,
    timeout: 20_000,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  })

  try {
    const health = await context.get('/actuator/health')
    await assertOk(health, 'Gateway health check')

    for (const [role, account] of Object.entries(E2E_ACCOUNTS)) {
      const loginRes = await context.post('/api/auth/login', {
        data: { email: account.email, password: account.password },
      })

      await assertOk(loginRes, `${role} login preflight`)

      const data = await loginRes.json()
      if (!data?.token || !data?.refreshToken || data?.userId == null) {
        throw new Error(`${role} login preflight returned invalid payload`)
      }
    }
  } finally {
    await context.dispose()
  }
}
