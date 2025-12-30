import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, format = 'PP') {
  // Simple date formatter - can be enhanced with date-fns
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(date) {
  const d = new Date(date)
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
