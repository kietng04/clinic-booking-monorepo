import { describe, it, expect } from 'vitest'
import { extractApiErrorMessage } from './extractApiErrorMessage'

describe('extractApiErrorMessage', () => {
  it('extracts message from standardized backend envelope', () => {
    const error = {
      response: {
        status: 400,
        data: {
          status: 400,
          message: 'Bác sĩ không làm việc vào ngày này',
          errorCode: 'VALIDATION_ERROR',
        },
      },
    }

    expect(extractApiErrorMessage(error)).toBe('Bác sĩ không làm việc vào ngày này')
  })

  it('extracts validation detail message when envelope message is missing', () => {
    const error = {
      response: {
        status: 400,
        data: {
          details: {
            appointmentDate: ['Ngày khám không hợp lệ'],
            appointmentTime: 'Giờ khám không hợp lệ',
          },
        },
      },
    }

    expect(extractApiErrorMessage(error)).toBe(
      'appointmentDate: Ngày khám không hợp lệ | appointmentTime: Giờ khám không hợp lệ'
    )
  })

  it('falls back to status-based default message for gateway errors', () => {
    const error = {
      response: {
        status: 503,
        data: {
          timestamp: '2026-02-08T10:00:00',
        },
      },
    }

    expect(extractApiErrorMessage(error)).toBe('Dịch vụ tạm thời gián đoạn. Vui lòng thử lại sau.')
  })
})
