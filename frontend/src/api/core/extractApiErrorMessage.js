const STATUS_MESSAGES = {
  400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu bị xung đột. Vui lòng tải lại và thử lại.',
  422: 'Dữ liệu chưa đúng định dạng yêu cầu.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
  500: 'Hệ thống đang gặp lỗi nội bộ. Vui lòng thử lại sau.',
  502: 'Gateway không nhận được phản hồi hợp lệ từ dịch vụ.',
  503: 'Dịch vụ tạm thời gián đoạn. Vui lòng thử lại sau.',
}

const pickFirstNonEmpty = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const picked = pickFirstNonEmpty(item)
      if (picked) return picked
    }
    return null
  }
  if (typeof value === 'object') {
    if (typeof value.message === 'string' && value.message.trim()) {
      return value.message.trim()
    }
  }
  return null
}

const extractValidationDetails = (details) => {
  if (!details || typeof details !== 'object') return null
  const messages = []
  Object.entries(details).forEach(([field, value]) => {
    const extracted = pickFirstNonEmpty(value)
    if (extracted) {
      messages.push(`${field}: ${extracted}`)
    }
  })
  return messages.length > 0 ? messages.join(' | ') : null
}

export const extractApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data.trim()
  }

  const messageFromEnvelope = pickFirstNonEmpty(data?.message)
  if (messageFromEnvelope) {
    return messageFromEnvelope
  }

  const messageFromDetails = extractValidationDetails(data?.details)
  if (messageFromDetails) {
    return messageFromDetails
  }

  const status = error?.response?.status
  if (fallbackMessage && typeof fallbackMessage === 'string' && fallbackMessage.trim()) {
    return fallbackMessage.trim()
  }

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status]
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    if (error.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.'
    }
    return error.message.trim()
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
}

export default extractApiErrorMessage
