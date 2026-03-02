import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, format = 'PP') {
  if (!date) return '—'
  // Simple date formatter - can be enhanced with date-fns
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    return String(date)
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(date) {
  if (!date) return '—'
  if (typeof date === 'string') {
    if (/^\d{2}:\d{2}:\d{2}/.test(date)) {
      return date.slice(0, 5)
    }
    if (/^\d{2}:\d{2}/.test(date)) {
      return date
    }
  }
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    return String(date)
  }
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTime(date) {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status) {
  const colors = {
    PENDING: 'bg-terra-100 text-terra-700',
    CONFIRMED: 'bg-sage-100 text-sage-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function translateStatus(status) {
  const translations = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    IN_PROGRESS: 'Đang thực hiện',
    SCHEDULED: 'Đã lên lịch',
  }
  return translations[status] || status
}

export function translateAppointmentType(type) {
  return type === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'
}

export function getPriorityColor(priority) {
  const colors = {
    NORMAL: 'bg-sage-100 text-sage-700',
    URGENT: 'bg-red-100 text-red-700',
  }
  return colors[priority] || 'bg-gray-100 text-gray-700'
}

export function formatPhone(phone) {
  if (phone === null || phone === undefined) return ''

  const raw = String(phone).trim()
  if (!raw) return ''

  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw

  // Convert +84/84-prefixed values back to local VN format.
  if (digits.startsWith('84')) {
    const local = `0${digits.slice(2)}`
    if (local.length === 10 || local.length === 11) return local
  }

  // Some sources may drop the leading zero.
  if (digits.length === 9) {
    return `0${digits}`
  }

  if (digits.length === 10 || digits.length === 11) {
    return digits
  }

  return raw
}
