import { expect } from '@playwright/test'
import { Pool } from 'pg'

const SHARED_DB_CONFIG = {
  host: process.env.E2E_DB_HOST || '127.0.0.1',
  user: process.env.E2E_DB_USER || 'postgres',
  password: process.env.E2E_DB_PASSWORD || 'postgres',
}

const DB_CONFIGS = {
  user: {
    ...SHARED_DB_CONFIG,
    port: Number(process.env.E2E_USER_DB_PORT || 5433),
    database: process.env.E2E_USER_DB_NAME || 'user_service_db',
  },
  appointment: {
    ...SHARED_DB_CONFIG,
    port: Number(process.env.E2E_APPOINTMENT_DB_PORT || 5434),
    database: process.env.E2E_APPOINTMENT_DB_NAME || 'appointment_service_db',
  },
  consultation: {
    ...SHARED_DB_CONFIG,
    port: Number(process.env.E2E_CONSULTATION_DB_PORT || 5436),
    database: process.env.E2E_CONSULTATION_DB_NAME || 'consultation_service_db',
  },
}

const pools = new Map()

export const isDbVerificationEnabled = () => process.env.E2E_VERIFY_DB !== 'false'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getPool = (dbName) => {
  if (!DB_CONFIGS[dbName]) {
    throw new Error(`Unknown DB config: ${dbName}`)
  }
  if (!pools.has(dbName)) {
    pools.set(
      dbName,
      new Pool({
        ...DB_CONFIGS[dbName],
        max: 2,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      }),
    )
  }
  return pools.get(dbName)
}

const queryOne = async (dbName, queryText, params = []) => {
  const pool = getPool(dbName)
  const result = await pool.query(queryText, params)
  return result.rows[0] || null
}

const waitForValue = async (callback, { timeoutMs = 20_000, intervalMs = 500, label = 'db value' } = {}) => {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const value = await callback()
      if (value) {
        return value
      }
    } catch (error) {
      lastError = error
    }
    await sleep(intervalMs)
  }

  if (lastError) {
    throw new Error(`DB wait timeout for ${label}: ${lastError.message}`)
  }
  throw new Error(`DB wait timeout for ${label}`)
}

export const findUserByEmail = async (email) => {
  return queryOne(
    'user',
    `
      SELECT id, email, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1)
      ORDER BY id DESC
      LIMIT 1
    `,
    [email],
  )
}

const findAppointmentBySymptoms = async ({ patientId, symptoms }) => {
  return queryOne(
    'appointment',
    `
      SELECT id, patient_id, doctor_id, status, symptoms, notes, created_at
      FROM appointments
      WHERE patient_id = $1 AND symptoms = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [patientId, symptoms],
  )
}

export async function findLatestConsultationForParticipants({
  patientEmail,
  doctorEmail,
  statuses = ['ACCEPTED', 'IN_PROGRESS'],
}) {
  if (!isDbVerificationEnabled()) return null

  const [patient, doctor] = await Promise.all([
    waitForValue(() => findUserByEmail(patientEmail), {
      label: `patient user by email ${patientEmail}`,
    }),
    waitForValue(() => findUserByEmail(doctorEmail), {
      label: `doctor user by email ${doctorEmail}`,
    }),
  ])

  return waitForValue(
    () =>
      queryOne(
        'consultation',
        `
          SELECT id, patient_id, doctor_id, status, topic, created_at
          FROM consultations
          WHERE patient_id = $1
            AND doctor_id = $2
            AND status = ANY($3)
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [patient.id, doctor.id, statuses],
      ),
    {
      label: `latest consultation for ${patientEmail} and ${doctorEmail}`,
    },
  )
}

export async function assertConsultationMessagePersisted({
  consultationId,
  senderEmail,
  content,
}) {
  if (!isDbVerificationEnabled()) return

  const sender = await waitForValue(() => findUserByEmail(senderEmail), {
    label: `sender user by email ${senderEmail}`,
  })

  const message = await waitForValue(
    () =>
      queryOne(
        'consultation',
        `
          SELECT id, consultation_id, sender_id, content, sent_at
          FROM messages
          WHERE consultation_id = $1
            AND sender_id = $2
            AND content = $3
          ORDER BY sent_at DESC
          LIMIT 1
        `,
        [consultationId, sender.id, content],
      ),
    {
      label: `consultation message consultation=${consultationId} content=${content}`,
    },
  )

  expect(Number(message.consultation_id)).toBe(Number(consultationId))
  expect(Number(message.sender_id)).toBe(Number(sender.id))
  expect(message.content).toBe(content)
}

export async function assertAppointmentPersisted({ patientEmail, symptoms, notesContains }) {
  if (!isDbVerificationEnabled()) return

  const user = await waitForValue(() => findUserByEmail(patientEmail), {
    label: `user by email ${patientEmail}`,
  })
  expect(user?.is_active).toBe(true)

  const appointment = await waitForValue(
    () => findAppointmentBySymptoms({ patientId: user.id, symptoms }),
    { label: `appointment symptoms=${symptoms}` },
  )

  expect(Number(appointment.patient_id)).toBe(Number(user.id))
  expect(appointment.symptoms).toBe(symptoms)
  if (notesContains) {
    expect(appointment.notes || '').toContain(notesContains)
  }
}

export async function assertAppointmentNotPersisted({ patientEmail, symptoms }) {
  if (!isDbVerificationEnabled()) return

  const user = await waitForValue(() => findUserByEmail(patientEmail), {
    label: `user by email ${patientEmail}`,
  })

  await sleep(500)
  const appointment = await findAppointmentBySymptoms({ patientId: user.id, symptoms })
  expect(appointment).toBeNull()
}

export async function assertConsultationPersisted({ patientEmail, topic, descriptionContains }) {
  if (!isDbVerificationEnabled()) return

  const user = await waitForValue(() => findUserByEmail(patientEmail), {
    label: `user by email ${patientEmail}`,
  })
  expect(user?.is_active).toBe(true)

  const consultation = await waitForValue(
    () =>
      queryOne(
        'consultation',
        `
          SELECT id, patient_id, doctor_id, status, topic, description, is_paid, created_at
          FROM consultations
          WHERE patient_id = $1 AND topic = $2
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [user.id, topic],
      ),
    { label: `consultation topic=${topic}` },
  )

  expect(Number(consultation.patient_id)).toBe(Number(user.id))
  expect(consultation.topic).toBe(topic)
  if (descriptionContains) {
    expect(consultation.description || '').toContain(descriptionContains)
  }
  expect(consultation.status).toBeTruthy()
}

export async function closeDbPools() {
  const allPools = [...pools.values()]
  pools.clear()
  await Promise.all(allPools.map((pool) => pool.end().catch(() => {})))
}
