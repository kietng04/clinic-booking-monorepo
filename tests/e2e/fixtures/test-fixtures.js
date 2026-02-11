import fs from 'node:fs'
import { test as base, expect } from '@playwright/test'
import { AUTH_STATE } from '../helpers/auth-accounts.js'

const ensureStateFile = (statePath) => {
  if (!fs.existsSync(statePath)) {
    throw new Error(`Missing storage state file: ${statePath}. Did setup project run?`)
  }
}

const createRolePage = async (browser, storageStatePath) => {
  ensureStateFile(storageStatePath)
  const context = await browser.newContext({ storageState: storageStatePath })
  const page = await context.newPage()
  return { context, page }
}

export const test = base.extend({
  patientPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, AUTH_STATE.PATIENT)
    await use(page)
    await context.close()
  },

  doctorPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, AUTH_STATE.DOCTOR)
    await use(page)
    await context.close()
  },

  adminPage: async ({ browser }, use) => {
    const { context, page } = await createRolePage(browser, AUTH_STATE.ADMIN)
    await use(page)
    await context.close()
  },
})

export { expect }
