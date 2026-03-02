import fs from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { test as setup } from '@playwright/test'
import { AUTH_DIR, AUTH_STATE, E2E_ACCOUNTS } from '../helpers/auth-accounts.js'
import { clearBrowserSession, loginWithCredentials } from '../helpers/session.js'

setup.setTimeout(120_000)

setup.beforeAll(async () => {
  await fs.mkdir(AUTH_DIR, { recursive: true })
})

const seedStorageState = async (page, account, statePath) => {
  let lastError = null

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await clearBrowserSession(page)
      await loginWithCredentials(page, account)
      await page.context().storageState({ path: statePath })
      return
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await delay(1000)
      }
    }
  }

  throw lastError
}

setup('authenticate patient and save storage state', async ({ page }) => {
  await seedStorageState(page, E2E_ACCOUNTS.PATIENT, AUTH_STATE.PATIENT)
})

setup('authenticate doctor and save storage state', async ({ page }) => {
  await seedStorageState(page, E2E_ACCOUNTS.DOCTOR, AUTH_STATE.DOCTOR)
})

setup('authenticate admin and save storage state', async ({ page }) => {
  await seedStorageState(page, E2E_ACCOUNTS.ADMIN, AUTH_STATE.ADMIN)
})
