import { test, expect } from '../fixtures/test-fixtures.js'
import { E2E_ACCOUNTS } from '../helpers/auth-accounts.js'
import {
  assertConsultationMessagePersisted,
  closeDbPools,
  findLatestConsultationForParticipants,
} from '../helpers/db-assertions.js'
import { uniqueLabel } from '../helpers/data-factory.js'
import { assertOnRoute } from '../helpers/ui-assertions.js'

test.describe.serial('Consultation Real-time (Real Backend)', () => {
  test.afterAll(async () => {
    await closeDbPools()
  })

  test('patient message is delivered to doctor in real time and persisted', async ({ patientPage, doctorPage }) => {
    const consultation = await findLatestConsultationForParticipants({
      patientEmail: E2E_ACCOUNTS.PATIENT.email,
      doctorEmail: E2E_ACCOUNTS.DOCTOR.email,
    })

    expect(consultation).toBeTruthy()

    const consultationId = Number(consultation.id)
    const messageContent = uniqueLabel('Realtime consult message')

    await doctorPage.goto(`/doctor/consultations/${consultationId}`)
    await assertOnRoute(doctorPage, `/doctor/consultations/${consultationId}`)
    await doctorPage.waitForResponse(
      (response) =>
        response.url().includes(`/api/consultations/${consultationId}`) && response.ok(),
      { timeout: 20_000 },
    )
    await doctorPage.waitForResponse(
      (response) =>
        response.url().includes(`/api/messages/consultation/${consultationId}`) && response.ok(),
      { timeout: 20_000 },
    )
    await expect(doctorPage.getByPlaceholder(/Nhập tin nhắn|type your message/i).first()).toBeVisible({ timeout: 20_000 })

    await patientPage.goto(`/patient/consultations/${consultationId}`)
    await assertOnRoute(patientPage, `/patient/consultations/${consultationId}`)
    await patientPage.waitForResponse(
      (response) =>
        response.url().includes(`/api/consultations/${consultationId}`) && response.ok(),
      { timeout: 20_000 },
    )
    await patientPage.waitForResponse(
      (response) =>
        response.url().includes(`/api/messages/consultation/${consultationId}`) && response.ok(),
      { timeout: 20_000 },
    )
    await expect(patientPage.getByPlaceholder(/Nhập tin nhắn|type your message/i).first()).toBeVisible({ timeout: 20_000 })

    const patientMessageBox = patientPage.getByPlaceholder(/nhập tin nhắn|type your message/i).first()
    await patientMessageBox.fill(messageContent)
    await patientMessageBox.press('Enter')

    await expect(patientPage.getByText(messageContent, { exact: false }).first()).toBeVisible({ timeout: 10_000 })
    await expect(doctorPage.getByText(messageContent, { exact: false }).first()).toBeVisible({ timeout: 20_000 })

    await assertConsultationMessagePersisted({
      consultationId,
      senderEmail: E2E_ACCOUNTS.PATIENT.email,
      content: messageContent,
    })
  })
})
