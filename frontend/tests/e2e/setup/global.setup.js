import { request } from '@playwright/test'
import { API_BASE_URL, E2E_ACCOUNTS } from '../helpers/auth-accounts.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const assertOk = async (response, label) => {
  if (!response.ok()) {
    const body = await response.text().catch(() => '')
    throw new Error(`${label} failed (${response.status()}): ${body.slice(0, 240)}`)
  }
}

const requestWithRetry = async (factory, label, retries = 8, waitMs = 1500) => {
  let lastResponse = null

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await factory()
    lastResponse = response

    if (response.ok()) {
      return response
    }

    if (attempt < retries) {
      await sleep(waitMs)
    }
  }

  await assertOk(lastResponse, label)
  return lastResponse
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
    const health = await requestWithRetry(
      () => context.get('/actuator/health'),
      'Gateway health check',
    )
    await assertOk(health, 'Gateway health check')

    for (const [role, account] of Object.entries(E2E_ACCOUNTS)) {
      const loginRes = await requestWithRetry(
        () =>
          context.post('/api/auth/login', {
            data: { email: account.email, password: account.password },
          }),
        `${role} login preflight`,
      )

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
