import crypto from 'node:crypto'

const DEFAULT_JWT_SECRET =
  'dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0dG9rZW5nZW5lcmF0aW9uYW5kdmFsaWRhdGlvbjEyMzQ1Njc4OTA='

const toBase64Url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')

export const createChatbotJwt = ({
  email = 'patient1@clinic.com',
  role = 'PATIENT',
  userId = 1001,
  secret = process.env.JWT_SECRET || process.env.E2E_JWT_SECRET || DEFAULT_JWT_SECRET,
} = {}) => {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: email,
    userId,
    role,
    iat: now,
    exp: now + 60 * 60,
  }

  const input = `${toBase64Url(header)}.${toBase64Url(payload)}`
  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(input)
    .digest('base64url')

  return `${input}.${signature}`
}

export const seedAuthenticatedSession = async (
  page,
  {
    token,
    user = {
      id: 1001,
      email: 'patient1@clinic.com',
      name: 'Patient Demo',
      role: 'PATIENT',
      avatar: '',
      emailVerified: true,
      phoneVerified: true,
    },
  } = {}
) => {
  await page.addInitScript(
    ({ seededToken, seededUser }) => {
      localStorage.setItem('accessToken', seededToken)
      localStorage.setItem('refreshToken', 'chatbot-e2e-refresh-token')
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: seededUser,
            token: seededToken,
            refreshToken: 'chatbot-e2e-refresh-token',
            isAuthenticated: true,
          },
          version: 0,
        })
      )
    },
    { seededToken: token, seededUser: user }
  )
}

export const stubNonChatbotApis = async (page) => {
  await page.route(/https?:\/\/(localhost|127\.0\.0\.1):8080\/api\/.*/, async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    if (path.startsWith('/api/chatbot/')) {
      await route.continue()
      return
    }

    if (path.startsWith('/api/auth/refresh')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: createChatbotJwt(),
          refreshToken: 'chatbot-e2e-refresh-token',
        }),
      })
      return
    }

    if (path.includes('/api/stats')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          upcomingAppointments: 1,
          completedAppointments: 2,
          activePrescriptions: 0,
          healthMetricsLogged: 0,
        }),
      })
      return
    }

    if (
      path.includes('/api/appointments') ||
      path.includes('/api/medical-records') ||
      path.includes('/api/health-metrics') ||
      path.includes('/api/notifications')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
      return
    }

    if (path.includes('/api/users') || path.includes('/api/profile')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 1001,
          email: 'patient1@clinic.com',
          fullName: 'Patient Demo',
          role: 'PATIENT',
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })
}
