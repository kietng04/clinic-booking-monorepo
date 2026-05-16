import {
  BarChart3,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  MessageSquare,
  UserSquare2,
  Users,
} from 'lucide-react'

export const doctorWorkspaceSections = [
  {
    items: [
      {
        name: 'Tổng quan',
        path: '/dashboard',
        icon: LayoutDashboard,
        matchers: ['/dashboard', '/doctor/dashboard'],
      },
      {
        name: 'Lịch hẹn',
        path: '/doctor/bookings',
        icon: CalendarDays,
        matchers: ['/doctor/bookings', '/doctor/appointments'],
      },
      {
        name: 'Tin nhắn',
        path: '/doctor/messages',
        icon: MessageSquare,
        matchers: ['/doctor/messages', '/doctor/calls', '/consultations', '/doctor/consultations/'],
      },
      {
        name: 'Lịch làm việc',
        path: '/schedule',
        icon: Clock3,
        matchers: ['/schedule'],
      },
      {
        name: 'Hồ sơ bệnh nhân',
        path: '/patients',
        icon: Users,
        matchers: ['/patients'],
      },
      {
        name: 'Hồ sơ bác sĩ',
        path: '/profile',
        icon: UserSquare2,
        matchers: ['/profile', '/profile/security', '/profile/notifications'],
      },
      {
        name: 'Thống kê',
        path: '/doctor/analytics',
        icon: BarChart3,
        matchers: ['/doctor/analytics'],
      },
    ],
  },
]

const doctorWorkspaceItems = doctorWorkspaceSections.flatMap((section) => section.items)

export function getDoctorWorkspaceItem(pathname) {
  return (
    doctorWorkspaceItems.find((item) =>
      item.matchers.some((matcher) =>
        matcher.endsWith('/') ? pathname.startsWith(matcher) : pathname === matcher
      )
    ) || null
  )
}
