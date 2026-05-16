import { describe, expect, it } from 'vitest'
import { buildMedicalRecordPdfFilename, sanitizePdfText } from './medicalRecordPdf'

describe('medicalRecordPdf', () => {
  it('builds a stable filename from record id and created date', () => {
    expect(
      buildMedicalRecordPdfFilename({
        id: 177,
        createdAt: '2026-03-12T09:30:00Z',
      })
    ).toBe('medical-record-177-2026-03-12.pdf')
  })

  it('normalizes Vietnamese text into PDF-safe ASCII', () => {
    expect(sanitizePdfText('T\u00e1i kh\u00e1m \u1edf b\u1ec7nh vi\u1ec7n s\u1ed1 1')).toBe('Tai kham o benh vien so 1')
  })

  it('returns fallback text for empty values', () => {
    expect(sanitizePdfText('', 'No data')).toBe('No data')
  })
})
