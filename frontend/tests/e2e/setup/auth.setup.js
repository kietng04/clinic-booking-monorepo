import fs from 'node:fs/promises'
import { test as setup } from '@playwright/test'
import { AUTH_DIR, AUTH_STATE, E2E_ACCOUNTS } from '../helpers/auth-accounts.js'
import { clearBrowserSession, loginWithCredentials } from '../helpers/session.js'

setup.beforeAll(async () => {
  await fs.mkdir(AUTH_DIR, { recursive: true })
})

const seedStorageState = async (page, account, statePath) => {
  await clearBrowserSession(page)
  await loginWithCredentials(page, account)
  await page.context().storageState({ path: statePath })
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
