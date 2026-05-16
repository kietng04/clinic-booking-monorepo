import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  PencilLine,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { SkeletonCard } from '@/components/ui/Loading'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { scheduleApi } from '@/api/scheduleApiWrapper'
import { cn } from '@/lib/utils'
import { doctorPrimaryButtonClass } from './theme'

const DAYS_OF_WEEK = [
  { dayOfWeek: 1, name: 'Thứ 2', shortName: 'T2' },
  { dayOfWeek: 2, name: 'Thứ 3', shortName: 'T3' },
  { dayOfWeek: 3, name: 'Thứ 4', shortName: 'T4' },
  { dayOfWeek: 4, name: 'Thứ 5', shortName: 'T5' },
  { dayOfWeek: 5, name: 'Thứ 6', shortName: 'T6' },
  { dayOfWeek: 6, name: 'Thứ 7', shortName: 'T7' },
  { dayOfWeek: 0, name: 'Chủ nhật', shortName: 'CN' },
]

const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

const SCHEDULE_TABS = [
  { value: 'FIXED', label: 'Lịch cố định' },
  { value: 'FLEXIBLE', label: 'Lịch linh hoạt' },
]

const SCHEDULE_TYPE_OPTIONS = [
  {
    value: 'DIRECT',
    label: 'Lịch khám',
    cardClassName: 'border-[#98b0ff] bg-[#dfe8ff]',
    dotClassName: 'bg-[#3456c4]',
  },
  {
    value: 'ONLINE',
    label: 'Lịch tư vấn',
    cardClassName: 'border-[#7be0aa] bg-[#d8f7e7]',
    dotClassName: 'bg-[#22b666]',
  },
]

const DEFAULT_SCHEDULE_TYPE = 'DIRECT'
const DEFAULT_SLOT_DURATION = '60'
const DEFAULT_FEE = '100000'
const DEFAULT_FLEXIBLE_FEE = '100'
const DEFAULT_APPOINTMENTS_PER_SLOT = '1'
const DEFAULT_MIN_BOOKING_DAYS = '1'
const DEFAULT_MAX_BOOKING_DAYS = '1'
const DEFAULT_DISCOUNT_PERCENT = '1'
const DRAFT_STORAGE_PREFIX = 'doctor-schedule-editor'
const FLEXIBLE_STORAGE_PREFIX = 'doctor-schedule-flexible'

function createLocalId() {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeTimeValue(value, fallback = '07:00') {
  if (typeof value !== 'string' || !value) return fallback
  if (/^\d{2}:\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  return fallback
}

function createEmptySlot(scheduleType = DEFAULT_SCHEDULE_TYPE) {
  return {
    localId: createLocalId(),
    id: null,
    scheduleType,
    startTime: '07:00',
    endTime: '17:00',
    slotDurationMinutes: DEFAULT_SLOT_DURATION,
    fee: DEFAULT_FEE,
    enabled: true,
  }
}

function createFlexibleDraftSlot(scheduleType = DEFAULT_SCHEDULE_TYPE) {
  return {
    localId: createLocalId(),
    scheduleType,
    startTime: '07:00',
    endTime: '17:00',
    slotDurationMinutes: DEFAULT_SLOT_DURATION,
    fee: DEFAULT_FLEXIBLE_FEE,
  }
}

function todayDateInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createFlexibleDraft(date = todayDateInputValue()) {
  return {
    date,
    slots: [createFlexibleDraftSlot()],
  }
}

function createLeaveDraft(date = todayDateInputValue()) {
  return {
    date,
    startTime: '07:00',
    endTime: '17:00',
    enabled: true,
  }
}

function cloneSlot(slot) {
  return {
    ...slot,
    id: null,
    localId: createLocalId(),
  }
}

function sortSlots(slots) {
  return [...slots].sort((left, right) => {
    const leftTime = String(left.startTime || '')
    const rightTime = String(right.startTime || '')
    if (leftTime !== rightTime) return leftTime.localeCompare(rightTime)
    return String(left.endTime || '').localeCompare(String(right.endTime || ''))
  })
}

function sortFlexibleEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftDate = String(left.date || '')
    const rightDate = String(right.date || '')
    if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)
    return String(left.startTime || '').localeCompare(String(right.startTime || ''))
  })
}

function createEmptyWeek() {
  return DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: [],
  }))
}

function buildWeekFromSchedules(schedules = []) {
  const grouped = schedules.reduce((map, schedule) => {
    const key = Number(schedule.dayOfWeek)
    const current = map.get(key) || []
    current.push({
      localId: String(schedule.id || createLocalId()),
      id: schedule.id || null,
      scheduleType: DEFAULT_SCHEDULE_TYPE,
      startTime: normalizeTimeValue(String(schedule.startTime || '07:00')),
      endTime: normalizeTimeValue(String(schedule.endTime || '17:00'), '17:00'),
      slotDurationMinutes: DEFAULT_SLOT_DURATION,
      fee: DEFAULT_FEE,
      enabled: true,
    })
    map.set(key, current)
    return map
  }, new Map())

  return DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: sortSlots(grouped.get(day.dayOfWeek) || []),
  }))
}

function getStorageKey(userId) {
  return `${DRAFT_STORAGE_PREFIX}:${userId}`
}

function loadDraft(userId) {
  if (!userId) return null
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistDraft(userId, payload) {
  if (!userId) return
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(payload))
}

function getFlexibleStorageKey(userId) {
  return `${FLEXIBLE_STORAGE_PREFIX}:${userId}`
}

function loadFlexibleDraft(userId) {
  if (!userId) return null
  try {
    const raw = window.localStorage.getItem(getFlexibleStorageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistFlexibleDraft(userId, payload) {
  if (!userId) return
  window.localStorage.setItem(getFlexibleStorageKey(userId), JSON.stringify(payload))
}

function getScheduleTypeMeta(type) {
  return SCHEDULE_TYPE_OPTIONS.find((option) => option.value === type) || SCHEDULE_TYPE_OPTIONS[0]
}

function getFlexibleEntryMeta(entry) {
  if (entry.kind === 'LEAVE') {
    return {
      label: 'Lịch nghỉ',
      cardClassName: 'border-[#ff9b9b] bg-[#ffd9d9]',
      dotClassName: 'bg-[#ff5252]',
    }
  }

  return getScheduleTypeMeta(entry.scheduleType)
}

function normalizeFlexibleEntry(entry = {}) {
  const kind = entry.kind === 'LEAVE' ? 'LEAVE' : 'FLEXIBLE'

  return {
    localId: entry.localId || createLocalId(),
    kind,
    date: entry.date || todayDateInputValue(),
    scheduleType: entry.scheduleType || DEFAULT_SCHEDULE_TYPE,
    startTime: normalizeTimeValue(entry.startTime),
    endTime: normalizeTimeValue(entry.endTime, '17:00'),
    appointmentsPerSlot: String(entry.appointmentsPerSlot ?? DEFAULT_APPOINTMENTS_PER_SLOT),
    slotDurationMinutes: String(entry.slotDurationMinutes ?? DEFAULT_SLOT_DURATION),
    minBookingDays: String(entry.minBookingDays ?? DEFAULT_MIN_BOOKING_DAYS),
    maxBookingDays: String(entry.maxBookingDays ?? DEFAULT_MAX_BOOKING_DAYS),
    fee: String(entry.fee ?? DEFAULT_FLEXIBLE_FEE),
    discountPercent: String(entry.discountPercent ?? DEFAULT_DISCOUNT_PERCENT),
    enabled: entry.enabled !== false,
  }
}

function toApiTime(value, fallback) {
  const normalized = normalizeTimeValue(value, fallback)
  return normalized.length === 5 ? `${normalized}:00` : normalized
}

function validateDateWindow(date, startTime, endTime, label) {
  if (!date) return `${label}: vui lòng chọn ngày.`
  if (!startTime || !endTime) return `${label}: vui lòng nhập đủ giờ bắt đầu và giờ kết thúc.`
  if (normalizeTimeValue(startTime) >= normalizeTimeValue(endTime)) {
    return `${label}: giờ kết thúc phải sau giờ bắt đầu.`
  }
  return null
}

function validateFlexibleEntryDraft(entry, label) {
  const dateWindowError = validateDateWindow(entry.date, entry.startTime, entry.endTime, label)
  if (dateWindowError) return dateWindowError

  if (!Number.isFinite(Number(entry.slotDurationMinutes)) || Number(entry.slotDurationMinutes) <= 0) {
    return `${label}: thời gian 1 slot phải lớn hơn 0.`
  }

  if (!Number.isFinite(Number(entry.fee)) || Number(entry.fee) < 0) {
    return `${label}: phí khám phải là số hợp lệ.`
  }

  return null
}

function validateFlexibleDraft(draft, label) {
  if (!draft.date) return `${label}: vui lòng chọn ngày khám.`
  if (!Array.isArray(draft.slots) || draft.slots.length === 0) {
    return `${label}: vui lòng thêm ít nhất 1 khung giờ.`
  }

  for (let index = 0; index < draft.slots.length; index += 1) {
    const slot = draft.slots[index]
    const validationMessage = validateFlexibleEntryDraft(
      {
        ...slot,
        date: draft.date,
      },
      `${label} - khung ${index + 1}`
    )

    if (validationMessage) return validationMessage
  }

  const sortedSlots = sortSlots(draft.slots)
  for (let index = 0; index < sortedSlots.length - 1; index += 1) {
    const currentSlot = sortedSlots[index]
    const nextSlot = sortedSlots[index + 1]
    if (normalizeTimeValue(currentSlot.endTime, '17:00') > normalizeTimeValue(nextSlot.startTime)) {
      return `${label}: các khung giờ đang bị chồng lấn.`
    }
  }

  return null
}

function validateFixedSlotDraft(slot, dayName) {
  const startTime = normalizeTimeValue(slot.startTime)
  const endTime = normalizeTimeValue(slot.endTime, '17:00')

  if (startTime >= endTime) {
    return `${dayName}: giờ kết thúc phải sau giờ bắt đầu.`
  }

  if (!Number.isFinite(Number(slot.fee)) || Number(slot.fee) < 0) {
    return `${dayName}: phí khám phải là số hợp lệ.`
  }

  if (!Number.isFinite(Number(slot.slotDurationMinutes)) || Number(slot.slotDurationMinutes) <= 0) {
    return `${dayName}: thời gian 1 slot phải lớn hơn 0.`
  }

  return null
}

function getTimeInMinutes(timeValue, fallback = '07:00') {
  const normalized = normalizeTimeValue(timeValue, fallback)
  const [hours, minutes] = normalized.split(':').map(Number)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

function getSlotCountForScheduleSlot(slot) {
  const startMinutes = getTimeInMinutes(slot.startTime)
  const endMinutes = getTimeInMinutes(slot.endTime, '17:00')
  const slotDuration = Number(slot.slotDurationMinutes)

  if (!Number.isFinite(slotDuration) || slotDuration <= 0 || endMinutes <= startMinutes) {
    return 0
  }

  return Math.floor((endMinutes - startMinutes) / slotDuration)
}

function getDayScheduleTypeSlotCounts(slots = []) {
  return slots.reduce(
    (totals, slot) => {
      if (slot.enabled === false) return totals

      const slotCount = getSlotCountForScheduleSlot(slot)
      if (slot.scheduleType === 'ONLINE') {
        totals.online += slotCount
      } else {
        totals.direct += slotCount
      }

      return totals
    },
    { direct: 0, online: 0 }
  )
}

function getDayScheduleTypeFrameCounts(slots = []) {
  return slots.reduce(
    (totals, slot) => {
      if (slot.enabled === false) return totals

      if (slot.scheduleType === 'ONLINE') {
        totals.online += 1
      } else {
        totals.direct += 1
      }

      return totals
    },
    { direct: 0, online: 0 }
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent transition-colors',
        checked ? 'bg-[#29352B]' : 'bg-slate-300'
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function getMonthDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDate = new Date(year, month, 1)
  const startOffset = (firstDate.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - startOffset)
  const days = []

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(startDate)
    current.setDate(startDate.getDate() + index)
    const dateValue = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(
      current.getDate()
    ).padStart(2, '0')}`

    days.push({
      key: dateValue,
      date: current,
      dateValue,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
    })
  }

  return days
}

function validateWeekSchedule(weekSchedule) {
  for (const day of weekSchedule) {
    const sorted = sortSlots(day.slots.filter((slot) => slot.enabled !== false))
    for (let index = 0; index < sorted.length; index += 1) {
      const slot = sorted[index]
      const startTime = normalizeTimeValue(slot.startTime)
      const endTime = normalizeTimeValue(slot.endTime, '17:00')

      if (startTime >= endTime) {
        return `${day.name}: giờ kết thúc phải sau giờ bắt đầu.`
      }

      if (!Number.isFinite(Number(slot.fee)) || Number(slot.fee) < 0) {
        return `${day.name}: phí khám phải là số hợp lệ.`
      }

      if (!Number.isFinite(Number(slot.slotDurationMinutes)) || Number(slot.slotDurationMinutes) <= 0) {
        return `${day.name}: thời gian 1 slot phải lớn hơn 0.`
      }

      const nextSlot = sorted[index + 1]
      if (nextSlot && endTime > normalizeTimeValue(nextSlot.startTime)) {
        return `${day.name}: có khung giờ đang bị chồng lấn.`
      }
    }
  }

  return null
}

export default function DoctorSchedule() {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [activeTab, setActiveTab] = useState('FIXED')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isFlexibleModalOpen, setIsFlexibleModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [editingFixedSlot, setEditingFixedSlot] = useState(null)
  const [editingFlexibleEntry, setEditingFlexibleEntry] = useState(null)
  const [editingLeaveEntry, setEditingLeaveEntry] = useState(null)
  const [copySourceDayOfWeek, setCopySourceDayOfWeek] = useState(null)
  const [copyTargetDays, setCopyTargetDays] = useState([])
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [weekSchedule, setWeekSchedule] = useState(() => createEmptyWeek())
  const [flexibleEntries, setFlexibleEntries] = useState([])
  const [flexibleDraft, setFlexibleDraft] = useState(() => createFlexibleDraft())
  const [leaveDraft, setLeaveDraft] = useState(() => createLeaveDraft())
  const [persistedSlotIds, setPersistedSlotIds] = useState([])

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        const schedules = await scheduleApi.getDoctorSchedules(user.id)
        const draft = loadDraft(user.id)
        const flexibleDraftStorage = loadFlexibleDraft(user.id)
        const nextWeek =
          Array.isArray(draft?.weekSchedule) && draft.weekSchedule.length === DAYS_OF_WEEK.length
            ? draft.weekSchedule
            : buildWeekFromSchedules(Array.isArray(schedules) ? schedules : [])

        setWeekSchedule(
          DAYS_OF_WEEK.map((day, index) => ({
            ...day,
            slots: sortSlots(
              Array.isArray(nextWeek[index]?.slots)
                ? nextWeek[index].slots.map((slot) => ({
                    ...slot,
                    localId: slot.localId || String(slot.id || createLocalId()),
                    id: slot.id || null,
                    scheduleType: slot.scheduleType || DEFAULT_SCHEDULE_TYPE,
                    startTime: normalizeTimeValue(slot.startTime),
                    endTime: normalizeTimeValue(slot.endTime, '17:00'),
                    slotDurationMinutes: String(slot.slotDurationMinutes || DEFAULT_SLOT_DURATION),
                    fee: String(slot.fee || DEFAULT_FEE),
                    enabled: slot.enabled !== false,
                  }))
                : []
            ),
          }))
        )
        setFlexibleEntries(
          sortFlexibleEntries(
            Array.isArray(flexibleDraftStorage?.entries)
              ? flexibleDraftStorage.entries.map((entry) => normalizeFlexibleEntry(entry))
              : []
          )
        )
        setPersistedSlotIds(
          (Array.isArray(schedules) ? schedules : [])
            .map((schedule) => schedule.id)
            .filter(Boolean)
        )
      } catch (error) {
        console.error('Failed to fetch schedules:', error)
        showToast({ type: 'error', message: 'Không thể tải lịch làm việc' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedules()
  }, [showToast, user?.id])

  useEffect(() => {
    if (!user?.id || isLoading) return
    persistDraft(user.id, { weekSchedule })
  }, [isLoading, user?.id, weekSchedule])

  useEffect(() => {
    if (!user?.id || isLoading) return
    persistFlexibleDraft(user.id, { entries: flexibleEntries })
  }, [flexibleEntries, isLoading, user?.id])

  const updateDay = (dayOfWeek, updater) => {
    setWeekSchedule((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? updater(day) : day))
    )
  }

  const handleToggleDay = (dayOfWeek) => {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      slots: day.slots.length > 0 ? [] : [createEmptySlot()],
    }))
  }

  const handleAddSlot = (dayOfWeek) => {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      slots: sortSlots([...day.slots, createEmptySlot()]),
    }))
  }

  const handleOpenCopyDialog = (dayOfWeek) => {
    const sourceDay = weekSchedule.find((day) => day.dayOfWeek === dayOfWeek)

    if (!sourceDay?.slots.length) {
      showToast({ type: 'info', message: 'Chưa có khung giờ để sao chép.' })
      return
    }

    setCopySourceDayOfWeek(dayOfWeek)
    setCopyTargetDays([])
  }

  const handleCopySlot = (dayOfWeek, localId) => {
    updateDay(dayOfWeek, (day) => {
      const slot = day.slots.find((item) => item.localId === localId)
      if (!slot) return day

      return {
        ...day,
        slots: sortSlots([...day.slots, cloneSlot(slot)]),
      }
    })
  }

  const handleRemoveSlot = (dayOfWeek, localId) => {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      slots: day.slots.filter((slot) => slot.localId !== localId),
    }))
  }

  const handleSlotChange = (dayOfWeek, localId, field, value) => {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      slots: day.slots.map((slot) =>
        slot.localId === localId
          ? {
              ...slot,
              [field]: value,
            }
          : slot
      ),
    }))
  }

  const handleOpenFixedSlotEditor = (dayOfWeek, slot) => {
    setEditingFixedSlot({
      dayOfWeek,
      ...slot,
    })
  }

  const handleUpdateFixedSlot = () => {
    if (!editingFixedSlot) return

    const targetDay = DAYS_OF_WEEK.find((day) => day.dayOfWeek === Number(editingFixedSlot.dayOfWeek))
    const validationMessage = validateFixedSlotDraft(editingFixedSlot, targetDay?.name || 'Lịch cố định')
    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    const nextWeek = weekSchedule.map((day) => {
      const isSourceDay = day.slots.some((slot) => slot.localId === editingFixedSlot.localId)
      const filteredSlots = isSourceDay
        ? day.slots.filter((slot) => slot.localId !== editingFixedSlot.localId)
        : day.slots

      if (day.dayOfWeek === Number(editingFixedSlot.dayOfWeek)) {
        return {
          ...day,
          slots: sortSlots([
            ...filteredSlots,
            {
              localId: editingFixedSlot.localId,
              id: editingFixedSlot.id || null,
              scheduleType: editingFixedSlot.scheduleType,
              startTime: editingFixedSlot.startTime,
              endTime: editingFixedSlot.endTime,
              slotDurationMinutes: editingFixedSlot.slotDurationMinutes,
              fee: editingFixedSlot.fee,
              enabled: editingFixedSlot.enabled !== false,
            },
          ]),
        }
      }

      return {
        ...day,
        slots: filteredSlots,
      }
    })

    const overlapMessage = validateWeekSchedule(nextWeek)
    if (overlapMessage) {
      showToast({ type: 'error', message: overlapMessage })
      return
    }

    setWeekSchedule(nextWeek)
    setEditingFixedSlot(null)
    showToast({ type: 'success', message: 'Đã cập nhật khung giờ cố định' })
  }

  const handleDeleteFixedSlot = () => {
    if (!editingFixedSlot) return

    setWeekSchedule((current) =>
      current.map((day) => ({
        ...day,
        slots: day.slots.filter((slot) => slot.localId !== editingFixedSlot.localId),
      }))
    )
    setEditingFixedSlot(null)
    showToast({ type: 'success', message: 'Đã xóa khung giờ cố định' })
  }

  const handleToggleCopyTargetDay = (dayOfWeek) => {
    setCopyTargetDays((current) =>
      current.includes(dayOfWeek)
        ? current.filter((item) => item !== dayOfWeek)
        : [...current, dayOfWeek]
    )
  }

  const handleToggleAllCopyTargetDays = () => {
    if (copySourceDayOfWeek === null) return

    const nextDays = DAYS_OF_WEEK
      .filter((day) => day.dayOfWeek !== copySourceDayOfWeek)
      .map((day) => day.dayOfWeek)

    setCopyTargetDays((current) => (current.length === nextDays.length ? [] : nextDays))
  }

  const resetCopyDialog = () => {
    setCopySourceDayOfWeek(null)
    setCopyTargetDays([])
  }

  const handleApplyCopy = () => {
    if (copySourceDayOfWeek === null || copyTargetDays.length === 0) return

    const sourceDay = weekSchedule.find((day) => day.dayOfWeek === copySourceDayOfWeek)
    if (!sourceDay) return

    setWeekSchedule((current) =>
      current.map((day) =>
        copyTargetDays.includes(day.dayOfWeek)
          ? {
              ...day,
              slots: sortSlots(sourceDay.slots.map((slot) => cloneSlot(slot))),
            }
          : day
      )
    )

    resetCopyDialog()
  }

  const handleOpenFlexibleModal = (date = todayDateInputValue()) => {
    setFlexibleDraft(createFlexibleDraft(date))
    setIsFlexibleModalOpen(true)
  }

  const handleOpenLeaveModal = (date = todayDateInputValue()) => {
    setLeaveDraft(createLeaveDraft(date))
    setIsLeaveModalOpen(true)
  }

  const handleAddFlexibleDraftSlot = () => {
    setFlexibleDraft((current) => ({
      ...current,
      slots: [...current.slots, createFlexibleDraftSlot()],
    }))
  }

  const handleRemoveFlexibleDraftSlot = (localId) => {
    setFlexibleDraft((current) => ({
      ...current,
      slots:
        current.slots.length > 1 ? current.slots.filter((slot) => slot.localId !== localId) : current.slots,
    }))
  }

  const handleFlexibleDraftSlotChange = (localId, field, value) => {
    setFlexibleDraft((current) => ({
      ...current,
      slots: current.slots.map((slot) =>
        slot.localId === localId
          ? {
              ...slot,
              [field]: value,
            }
          : slot
      ),
    }))
  }

  const handleCreateFlexibleEntry = () => {
    const validationMessage = validateFlexibleDraft(flexibleDraft, 'Lịch linh hoạt')
    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    const nextEntries = flexibleDraft.slots.map((slot) =>
      normalizeFlexibleEntry({
        ...slot,
        date: flexibleDraft.date,
        localId: createLocalId(),
        kind: 'FLEXIBLE',
      })
    )

    setFlexibleEntries((current) => sortFlexibleEntries([...current, ...nextEntries]))
    setIsFlexibleModalOpen(false)
    setFlexibleDraft(createFlexibleDraft())
    showToast({ type: 'success', message: 'Đã thêm lịch linh hoạt' })
  }

  const handleCreateLeaveEntry = () => {
    const validationMessage = validateDateWindow(leaveDraft.date, leaveDraft.startTime, leaveDraft.endTime, 'Lịch nghỉ')

    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    const nextEntry = normalizeFlexibleEntry({
      ...leaveDraft,
      localId: createLocalId(),
      kind: 'LEAVE',
    })

    setFlexibleEntries((current) => sortFlexibleEntries([...current, nextEntry]))
    setIsLeaveModalOpen(false)
    setLeaveDraft(createLeaveDraft())
    showToast({ type: 'success', message: 'Đã thêm lịch nghỉ' })
  }

  const handleOpenFlexibleEntryEditor = (entry) => {
    const normalizedEntry = normalizeFlexibleEntry(entry)

    if (normalizedEntry.kind === 'LEAVE') {
      setEditingLeaveEntry(normalizedEntry)
      return
    }

    setEditingFlexibleEntry(normalizedEntry)
  }

  const handleDeleteFlexibleEntry = (localId, successMessage) => {
    setFlexibleEntries((current) => current.filter((entry) => entry.localId !== localId))
    setEditingFlexibleEntry((current) => (current?.localId === localId ? null : current))
    setEditingLeaveEntry((current) => (current?.localId === localId ? null : current))
    showToast({ type: 'success', message: successMessage })
  }

  const handleUpdateFlexibleEntry = () => {
    if (!editingFlexibleEntry) return

    const validationMessage = validateFlexibleEntryDraft(editingFlexibleEntry, 'Lịch linh hoạt')
    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    const nextEntry = normalizeFlexibleEntry(editingFlexibleEntry)
    setFlexibleEntries((current) =>
      sortFlexibleEntries(current.map((entry) => (entry.localId === nextEntry.localId ? nextEntry : entry)))
    )
    setEditingFlexibleEntry(null)
    showToast({ type: 'success', message: 'Đã cập nhật lịch linh hoạt' })
  }

  const handleUpdateLeaveEntry = () => {
    if (!editingLeaveEntry) return

    const validationMessage = validateDateWindow(
      editingLeaveEntry.date,
      editingLeaveEntry.startTime,
      editingLeaveEntry.endTime,
      'Lịch nghỉ'
    )

    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    const nextEntry = normalizeFlexibleEntry(editingLeaveEntry)
    setFlexibleEntries((current) =>
      sortFlexibleEntries(current.map((entry) => (entry.localId === nextEntry.localId ? nextEntry : entry)))
    )
    setEditingLeaveEntry(null)
    showToast({ type: 'success', message: 'Đã cập nhật lịch nghỉ' })
  }

  const handlePreviousMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  const handleMonthChange = (value) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), Number(value), 1))
  }

  const handleYearChange = (value) => {
    setCalendarMonth((current) => new Date(Number(value), current.getMonth(), 1))
  }

  const handleSave = async () => {
    if (!user?.id) return

    const validationMessage = validateWeekSchedule(weekSchedule)
    if (validationMessage) {
      showToast({ type: 'error', message: validationMessage })
      return
    }

    setIsSaving(true)
    try {
      const currentOperations = weekSchedule.flatMap((day) =>
        day.slots
          .filter((slot) => slot.enabled !== false)
          .map((slot) => ({
            dayOfWeek: day.dayOfWeek,
            slot,
          }))
      )

      const currentPersistedIds = currentOperations
        .map((operation) => operation.slot.id)
        .filter(Boolean)

      const deletedIds = persistedSlotIds.filter((id) => !currentPersistedIds.includes(id))
      await Promise.all(deletedIds.map((id) => scheduleApi.deleteSchedule(id)))

      const savedSlots = await Promise.all(
        currentOperations.map(async ({ dayOfWeek, slot }) => {
          const payload = {
            doctorId: user.id,
            dayOfWeek,
            startTime: toApiTime(slot.startTime, '07:00'),
            endTime: toApiTime(slot.endTime, '17:00'),
            isAvailable: true,
          }

          const response = slot.id
            ? await scheduleApi.updateSchedule(slot.id, payload)
            : await scheduleApi.createSchedule(payload)

          return {
            localId: slot.localId,
            response,
          }
        })
      )

      const responseMap = new Map(savedSlots.map((item) => [item.localId, item.response]))

      const nextWeek = weekSchedule.map((day) => ({
        ...day,
        slots: sortSlots(
          day.slots.map((slot) => {
            const response = responseMap.get(slot.localId)
            if (!response) return slot

            return {
              ...slot,
              id: response.id,
              startTime: normalizeTimeValue(String(response.startTime || slot.startTime)),
              endTime: normalizeTimeValue(String(response.endTime || slot.endTime), slot.endTime),
            }
          })
        ),
      }))

      const normalizedWeek = nextWeek.map((day) => ({
        ...day,
        slots: day.slots.map((slot) =>
          slot.enabled === false
            ? {
                ...slot,
                id: null,
              }
            : slot
        ),
      }))

      setWeekSchedule(normalizedWeek)
      setPersistedSlotIds(
        normalizedWeek
          .flatMap((day) => day.slots.filter((slot) => slot.enabled !== false).map((slot) => slot.id))
          .filter(Boolean)
      )
      showToast({ type: 'success', message: 'Đã cập nhật lịch làm việc' })
      setIsEditorOpen(false)
    } catch (error) {
      console.error('Failed to save schedules:', error)
      showToast({ type: 'error', message: 'Không thể lưu lịch làm việc' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const copyableDays =
    copySourceDayOfWeek === null
      ? []
      : DAYS_OF_WEEK.filter((day) => day.dayOfWeek !== copySourceDayOfWeek)
  const allCopyableDaysSelected =
    copyableDays.length > 0 && copyTargetDays.length === copyableDays.length
  const fixedScheduleTypeCounts = weekSchedule.reduce(
    (counts, day) => {
      day.slots.forEach((slot) => {
        if (slot.enabled === false) return
        counts[slot.scheduleType] = (counts[slot.scheduleType] || 0) + 1
      })
      return counts
    },
    {}
  )
  const flexibleScheduleTypeCounts = flexibleEntries.reduce(
    (counts, entry) => {
      if (entry.kind === 'LEAVE') {
        counts.LEAVE = (counts.LEAVE || 0) + 1
      } else {
        counts[entry.scheduleType] = (counts[entry.scheduleType] || 0) + 1
      }
      return counts
    },
    {}
  )
  const calendarDays = getMonthDays(calendarMonth)
  const flexibleEntriesByDate = flexibleEntries.reduce((map, entry) => {
    const current = map.get(entry.date) || []
    current.push(entry)
    map.set(entry.date, sortFlexibleEntries(current))
    return map
  }, new Map())
  const yearOptions = Array.from({ length: 7 }, (_, index) => {
    const baseYear = new Date().getFullYear() - 2
    const year = baseYear + index
    return { value: String(year), label: String(year) }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {SCHEDULE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-[14px] border px-4 py-2 text-sm font-semibold transition',
              activeTab === tab.value
                ? 'border-[#d7e2da] bg-white text-slate-900 shadow-sm'
                : 'border-transparent bg-[#f1f4f2] text-slate-600 hover:bg-[#e8eeea]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'FIXED' ? (
      <Card className="overflow-hidden rounded-[20px] border-[#d7e2da] bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardHeader className="border-b border-[#e6ece7] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              {SCHEDULE_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="inline-flex items-center gap-2">
                  <span className={cn('h-3 w-3 rounded-full', option.dotClassName)} />
                  {option.label}
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#eef3ef] px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {fixedScheduleTypeCounts[option.value] || 0}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setIsEditorOpen(true)}
              leftIcon={<PencilLine className="h-4 w-4" />}
              className={doctorPrimaryButtonClass}
            >
              Điều chỉnh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-7">
              {weekSchedule.map((day, index) => (
                <div
                  key={day.dayOfWeek}
                  className={cn(
                    'min-h-[380px] border-r border-[#e6ece7] bg-white',
                    index === weekSchedule.length - 1 && 'border-r-0'
                  )}
                >
                  <div className="border-b border-[#d9e1dc] bg-[#f5f7f6] px-4 py-4 text-center">
                    <div className="text-lg font-semibold text-slate-900">{day.name}</div>
                  </div>

                  <div className="space-y-3 p-2.5">
                    {day.slots.length === 0 ? (
                      <div className="rounded-[14px] border border-dashed border-[#d7e2da] bg-[#fafcfb] px-3 py-8 text-center text-sm text-slate-400">
                        Chưa có lịch
                      </div>
                    ) : (
                      day.slots.map((slot) => {
                        const typeMeta = getScheduleTypeMeta(slot.scheduleType)

                        return (
                          <button
                            key={slot.localId}
                            type="button"
                            onClick={() => handleOpenFixedSlotEditor(day.dayOfWeek, slot)}
                            className={cn(
                              'w-full rounded-[14px] border px-4 py-3 text-left shadow-sm transition hover:shadow-md',
                              slot.enabled !== false ? typeMeta.cardClassName : 'border-slate-200 bg-slate-100'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'h-10 w-1 rounded-full',
                                  slot.enabled !== false ? typeMeta.dotClassName : 'bg-slate-400'
                                )}
                              />
                              <div>
                                <div
                                  className={cn(
                                    'text-[15px] font-semibold leading-5',
                                    slot.enabled !== false ? 'text-slate-900' : 'text-slate-500'
                                  )}
                                >
                                  {typeMeta.label}
                                </div>
                                <div
                                  className={cn(
                                    'text-sm font-medium',
                                    slot.enabled !== false ? 'text-slate-700' : 'text-slate-400'
                                  )}
                                >
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      ) : (
        <Card className="overflow-hidden rounded-[20px] border-[#d7e2da] bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardHeader className="border-b border-[#e6ece7] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenLeaveModal}
                  className="rounded-[12px] border-[#f2c6c6] bg-[#fff6f6] text-[#d65c5c] hover:bg-[#ffeaea]"
                >
                  Thêm lịch nghỉ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenFlexibleModal}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className={doctorPrimaryButtonClass}
                >
                  Thêm lịch linh hoạt
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                {SCHEDULE_TYPE_OPTIONS.map((option) => (
                  <div key={option.value} className="inline-flex items-center gap-2">
                    <span className={cn('h-3 w-3 rounded-full', option.dotClassName)} />
                    {option.label}
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#eef3ef] px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {flexibleScheduleTypeCounts[option.value] || 0}
                    </span>
                  </div>
                ))}
                <div className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5252]" />
                  Lịch nghỉ
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#fff1f1] px-2 py-0.5 text-xs font-semibold text-[#d65c5c]">
                    {flexibleScheduleTypeCounts.LEAVE || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#d7e2da] bg-white text-slate-700 transition hover:bg-[#f7faf8]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <Select
                value={String(calendarMonth.getMonth())}
                onChange={(event) => handleMonthChange(event.target.value)}
                options={MONTH_NAMES.map((month, index) => ({
                  value: String(index),
                  label: month,
                }))}
                containerClassName="w-[150px]"
                className="!rounded-[12px] !border-[#d7e2da] !bg-white"
              />

              <Select
                value={String(calendarMonth.getFullYear())}
                onChange={(event) => handleYearChange(event.target.value)}
                options={yearOptions}
                containerClassName="w-[110px]"
                className="!rounded-[12px] !border-[#d7e2da] !bg-white"
              />

              <button
                type="button"
                onClick={handleNextMonth}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#d7e2da] bg-white text-slate-700 transition hover:bg-[#f7faf8]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[980px] grid-cols-7 border border-[#e6ece7]">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className="border-b border-r border-[#e6ece7] bg-[#f5f7f6] px-4 py-3 text-lg font-semibold text-slate-900 last:border-r-0"
                  >
                    {day.name}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  const entries = flexibleEntriesByDate.get(day.dateValue) || []

                  return (
                    <div
                      key={day.key}
                      className={cn(
                        'min-h-[142px] border-r border-b border-[#e6ece7] p-3',
                        index % 7 === 6 && 'border-r-0',
                        entries.length > 0 ? 'bg-[#fff9e8]' : 'bg-white'
                      )}
                    >
                      <div
                        className={cn(
                          'text-right text-[30px] font-bold leading-none',
                          day.isCurrentMonth ? 'text-slate-900' : 'text-slate-300'
                        )}
                      >
                        {day.dayNumber}
                      </div>

                      <div className="mt-3 space-y-2">
                        {entries.map((entry) => {
                          const meta = getFlexibleEntryMeta(entry)

                          return (
                            <button
                              key={entry.localId}
                              type="button"
                              onClick={() => handleOpenFlexibleEntryEditor(entry)}
                              className={cn(
                                'w-full rounded-[14px] border px-3 py-2 text-left shadow-sm transition hover:shadow-md',
                                entry.enabled ? meta.cardClassName : 'border-slate-200 bg-slate-100'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={cn(
                                    'mt-0.5 h-9 w-1 rounded-full',
                                    entry.enabled ? meta.dotClassName : 'bg-slate-400'
                                  )}
                                />
                                <div className="min-w-0">
                                  <div
                                    className={cn(
                                      'truncate text-[15px] font-semibold leading-5',
                                      entry.enabled ? 'text-slate-900' : 'text-slate-500'
                                    )}
                                  >
                                    {meta.label}
                                  </div>
                                  <div className={cn('text-sm', entry.enabled ? 'text-slate-700' : 'text-slate-400')}>
                                    {entry.startTime} - {entry.endTime}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {flexibleEntries.length > 0 ? (
              <div className="space-y-3 rounded-[20px] border border-[#e6ece7] bg-[#fbfdfc] p-4">
                {sortFlexibleEntries(flexibleEntries).map((entry) => {
                  const meta = getFlexibleEntryMeta(entry)

                  return (
                    <div
                      key={entry.localId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e6ece7] bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn('h-10 w-1 rounded-full', meta.dotClassName)} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {meta.label} • {formatDisplayDate(entry.date)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {entry.startTime} - {entry.endTime}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteFlexibleEntry(
                            entry.localId,
                            entry.kind === 'LEAVE' ? 'Đã xóa lịch nghỉ' : 'Đã xóa lịch linh hoạt'
                          )
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#f6dede] bg-[#fff5f5] text-rose-500 transition hover:text-rose-600"
                        aria-label="Xóa lịch linh hoạt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Điều chỉnh lịch làm việc"
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap justify-end gap-3 border-b border-[#eef2ef] pb-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
              className="rounded-[12px] border-slate-200"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={isSaving ? undefined : <Save className="h-4 w-4" />}
              className={doctorPrimaryButtonClass}
            >
              {isSaving ? 'Đang lưu...' : 'Áp dụng'}
            </Button>
          </div>

          <div className="space-y-4">
            {weekSchedule.map((day) => {
              const dayFrameCounts = getDayScheduleTypeFrameCounts(day.slots)

              return (
                <div
                  key={day.dayOfWeek}
                  className="overflow-hidden rounded-[20px] border border-[#d7e2da] bg-white"
                >
                  <div className="flex flex-col gap-4 border-b border-[#e6ece7] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <ToggleSwitch checked={day.slots.length > 0} onChange={() => handleToggleDay(day.dayOfWeek)} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">{day.name}</div>
                        <span className="inline-flex items-center rounded-full border border-[#b7c8ff] bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#3456c4]">
                          Lịch khám: {dayFrameCounts.direct}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[#9fdfba] bg-[#ebfbf2] px-3 py-1 text-xs font-semibold text-[#1d8d52]">
                          Lịch tư vấn: {dayFrameCounts.online}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSlot(day.dayOfWeek)}
                        leftIcon={<Plus className="h-4 w-4" />}
                        className="rounded-[12px] border-slate-200"
                      >
                        Thêm khung giờ
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCopyDialog(day.dayOfWeek)}
                        leftIcon={<Copy className="h-4 w-4" />}
                        className="rounded-[12px] border-slate-200"
                      >
                        Sao chép
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 px-5 py-5">
                    {day.slots.length === 0 ? (
                      <div className="rounded-[16px] border border-dashed border-[#d7e2da] bg-[#fafcfb] px-4 py-8 text-center text-sm leading-6 text-slate-500">
                        Bật ngày làm việc để thêm khung giờ.
                      </div>
                    ) : (
                      day.slots.map((slot) => {
                        const typeMeta = getScheduleTypeMeta(slot.scheduleType)
                        const totalSlots = getSlotCountForScheduleSlot(slot)

                        return (
                          <div
                            key={slot.localId}
                            className={cn('rounded-[18px] border px-4 py-4', typeMeta.cardClassName)}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-slate-700">Tổng số slot: {totalSlots}</div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopySlot(day.dayOfWeek, slot.localId)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/70 bg-white/80 text-slate-600 transition hover:text-slate-900"
                                  aria-label="Sao chép khung giờ"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(day.dayOfWeek, slot.localId)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/70 bg-white/80 text-rose-500 transition hover:text-rose-600"
                                  aria-label="Xóa khung giờ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                              <Select
                                label="Loại lịch"
                                value={slot.scheduleType}
                                onChange={(event) =>
                                  handleSlotChange(day.dayOfWeek, slot.localId, 'scheduleType', event.target.value)
                                }
                                options={SCHEDULE_TYPE_OPTIONS.map((option) => ({
                                  value: option.value,
                                  label: option.label,
                                }))}
                                className="!rounded-[12px] !border-slate-200 !bg-white"
                              />

                              <Input
                                label="Giờ bắt đầu"
                                type="time"
                                value={slot.startTime}
                                onChange={(event) =>
                                  handleSlotChange(day.dayOfWeek, slot.localId, 'startTime', event.target.value)
                                }
                                className="!rounded-[12px] !border-slate-200 !bg-white"
                              />

                              <Input
                                label="Giờ kết thúc"
                                type="time"
                                value={slot.endTime}
                                onChange={(event) =>
                                  handleSlotChange(day.dayOfWeek, slot.localId, 'endTime', event.target.value)
                                }
                                className="!rounded-[12px] !border-slate-200 !bg-white"
                              />

                              <Input
                                label="Thời gian 1 slot (phút)"
                                type="number"
                                min="5"
                                step="5"
                                value={slot.slotDurationMinutes}
                                onChange={(event) =>
                                  handleSlotChange(day.dayOfWeek, slot.localId, 'slotDurationMinutes', event.target.value)
                                }
                                className="!rounded-[12px] !border-slate-200 !bg-white"
                              />

                              <Input
                                label="Phí khám"
                                type="number"
                                min="0"
                                step="10000"
                                value={slot.fee}
                                onChange={(event) =>
                                  handleSlotChange(day.dayOfWeek, slot.localId, 'fee', event.target.value)
                                }
                                className="!rounded-[12px] !border-slate-200 !bg-white"
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editingFixedSlot)}
        onClose={() => setEditingFixedSlot(null)}
        title="Điều chỉnh lịch làm việc cố định"
        size="lg"
        showCloseButton={false}
      >
        {editingFixedSlot ? (
          <div className="space-y-6">
            <Select
              label="Thứ trong tuần *"
              value={String(editingFixedSlot.dayOfWeek)}
              onChange={(event) =>
                setEditingFixedSlot((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))
              }
              options={DAYS_OF_WEEK.map((day) => ({
                value: String(day.dayOfWeek),
                label: day.name,
              }))}
              className="!rounded-[12px] !border-slate-200 !bg-white"
            />

            <div
              className={cn(
                'rounded-[18px] border px-4 py-4',
                editingFixedSlot.enabled !== false
                  ? getScheduleTypeMeta(editingFixedSlot.scheduleType).cardClassName
                  : 'border-slate-200 bg-slate-100'
              )}
            >
              <div className="mb-4 text-sm font-semibold text-slate-700">
                Tổng số slot: {getSlotCountForScheduleSlot(editingFixedSlot)}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Select
                  label="Loại lịch"
                  value={editingFixedSlot.scheduleType}
                  onChange={(event) =>
                    setEditingFixedSlot((current) => ({ ...current, scheduleType: event.target.value }))
                  }
                  options={SCHEDULE_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Giờ bắt đầu"
                  type="time"
                  value={editingFixedSlot.startTime}
                  onChange={(event) =>
                    setEditingFixedSlot((current) => ({ ...current, startTime: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Giờ kết thúc"
                  type="time"
                  value={editingFixedSlot.endTime}
                  onChange={(event) =>
                    setEditingFixedSlot((current) => ({ ...current, endTime: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Thời gian 1 slot (phút)"
                  type="number"
                  min="5"
                  step="5"
                  value={editingFixedSlot.slotDurationMinutes}
                  onChange={(event) =>
                    setEditingFixedSlot((current) => ({ ...current, slotDurationMinutes: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Phí khám"
                  type="number"
                  min="0"
                  value={editingFixedSlot.fee}
                  onChange={(event) => setEditingFixedSlot((current) => ({ ...current, fee: event.target.value }))}
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ece7] pt-4">
              <div className="flex items-center gap-3 text-base font-semibold text-slate-800">
                <span>Bật/Tắt lịch</span>
                <ToggleSwitch
                  checked={editingFixedSlot.enabled !== false}
                  onChange={() =>
                    setEditingFixedSlot((current) => ({ ...current, enabled: current.enabled === false }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={handleDeleteFixedSlot}
                  className="rounded-[12px] bg-[#ef4444] text-white hover:bg-[#dc2626]"
                >
                  Xóa lịch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFixedSlot(null)}
                  className="rounded-[12px] border-slate-200"
                >
                  Đóng
                </Button>
                <Button type="button" onClick={handleUpdateFixedSlot} className={doctorPrimaryButtonClass}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isFlexibleModalOpen}
        onClose={() => setIsFlexibleModalOpen(false)}
        title="Thêm lịch làm việc linh hoạt"
        size="lg"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <div className="rounded-[18px] border border-[#ffd59f] bg-[#fff7eb] px-5 py-4 text-slate-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#f97316]" />
              <div className="space-y-2 text-base leading-8">
                <p>Lịch này chỉ áp dụng cho đúng ngày bạn đã chọn, không lặp lại theo tuần.</p>
                <p>Nếu đã có bệnh nhân đặt lịch trước đó trong ngày này, bạn nên kiểm tra lại trước khi thay đổi.</p>
              </div>
            </div>
          </div>

          <Input
            label="Ngày khám"
            type="date"
            value={flexibleDraft.date}
            onChange={(event) => setFlexibleDraft((current) => ({ ...current, date: event.target.value }))}
            className="!rounded-[12px] !border-slate-200 !bg-white"
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFlexibleDraftSlot}
              leftIcon={<Plus className="h-4 w-4" />}
              className="rounded-[12px] border-slate-200"
            >
              Thêm khung giờ
            </Button>
          </div>

          <div className="space-y-4">
            {flexibleDraft.slots.map((slot) => {
              const typeMeta = getScheduleTypeMeta(slot.scheduleType)
              const totalSlots = getSlotCountForScheduleSlot(slot)

              return (
                <div key={slot.localId} className={cn('rounded-[18px] border px-4 py-4', typeMeta.cardClassName)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-semibold text-slate-900">Tổng số slot: {totalSlots}</div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFlexibleDraftSlot(slot.localId)}
                      disabled={flexibleDraft.slots.length === 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/70 bg-white/80 text-rose-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Xóa khung giờ linh hoạt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Select
                      label="Loại lịch"
                      value={slot.scheduleType}
                      onChange={(event) => handleFlexibleDraftSlotChange(slot.localId, 'scheduleType', event.target.value)}
                      options={SCHEDULE_TYPE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      className="!rounded-[12px] !border-slate-200 !bg-white"
                    />

                    <Input
                      label="Giờ bắt đầu"
                      type="time"
                      value={slot.startTime}
                      onChange={(event) => handleFlexibleDraftSlotChange(slot.localId, 'startTime', event.target.value)}
                      className="!rounded-[12px] !border-slate-200 !bg-white"
                    />

                    <Input
                      label="Giờ kết thúc"
                      type="time"
                      value={slot.endTime}
                      onChange={(event) => handleFlexibleDraftSlotChange(slot.localId, 'endTime', event.target.value)}
                      className="!rounded-[12px] !border-slate-200 !bg-white"
                    />

                    <Input
                      label="Thời gian 1 slot (phút)"
                      type="number"
                      min="5"
                      step="5"
                      value={slot.slotDurationMinutes}
                      onChange={(event) =>
                        handleFlexibleDraftSlotChange(slot.localId, 'slotDurationMinutes', event.target.value)
                      }
                      className="!rounded-[12px] !border-slate-200 !bg-white"
                    />

                    <Input
                      label="Phí khám"
                      type="number"
                      min="0"
                      value={slot.fee}
                      onChange={(event) => handleFlexibleDraftSlotChange(slot.localId, 'fee', event.target.value)}
                      className="!rounded-[12px] !border-slate-200 !bg-white"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e6ece7] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFlexibleModalOpen(false)}
              className="rounded-[12px] border-slate-200"
            >
              Đóng
            </Button>
            <Button type="button" onClick={handleCreateFlexibleEntry} className={doctorPrimaryButtonClass}>
              Thêm mới
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Thêm lịch nghỉ"
        size="md"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <div className="rounded-[18px] border border-[#ffd59f] bg-[#fff7eb] px-5 py-4 text-slate-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#f97316]" />
              <div className="space-y-2 text-base leading-8">
                <p>Lưu ý</p>
                <p>Khách hàng sẽ không thể đặt lịch khám hoặc tư vấn trong khung giờ nghỉ này.</p>
              </div>
            </div>
          </div>

          <Input
            label="Ngày nghỉ"
            type="date"
            value={leaveDraft.date}
            onChange={(event) => setLeaveDraft((current) => ({ ...current, date: event.target.value }))}
            className="!rounded-[12px] !border-slate-200 !bg-white"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Giờ bắt đầu"
              type="time"
              value={leaveDraft.startTime}
              onChange={(event) => setLeaveDraft((current) => ({ ...current, startTime: event.target.value }))}
              className="!rounded-[12px] !border-slate-200 !bg-white"
            />

            <Input
              label="Giờ kết thúc"
              type="time"
              value={leaveDraft.endTime}
              onChange={(event) => setLeaveDraft((current) => ({ ...current, endTime: event.target.value }))}
              className="!rounded-[12px] !border-slate-200 !bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e6ece7] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLeaveModalOpen(false)}
              className="rounded-[12px] border-slate-200"
            >
              Đóng
            </Button>
            <Button type="button" onClick={handleCreateLeaveEntry} className={doctorPrimaryButtonClass}>
              Thêm mới
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(editingFlexibleEntry)}
        onClose={() => setEditingFlexibleEntry(null)}
        title="Điều chỉnh lịch làm việc linh hoạt"
        size="lg"
        showCloseButton={false}
      >
        {editingFlexibleEntry ? (
          <div className="space-y-6">
            <div className="rounded-[18px] border border-[#ffd59f] bg-[#fff7eb] px-5 py-4 text-slate-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-[#f97316]" />
                <div className="space-y-2 text-base leading-8">
                  <p>Lịch này chỉ áp dụng cho ngày bạn đã chọn, không lặp lại theo tuần.</p>
                  <p>Nếu đã có lịch hẹn trước đó, bạn nên kiểm tra lại trước khi thay đổi.</p>
                </div>
              </div>
            </div>

            <Input
              label="Ngày khám"
              type="date"
              value={editingFlexibleEntry.date}
              onChange={(event) => setEditingFlexibleEntry((current) => ({ ...current, date: event.target.value }))}
              className="!rounded-[12px] !border-slate-200 !bg-white"
            />

            <div
              className={cn(
                'rounded-[18px] border px-4 py-4',
                editingFlexibleEntry.enabled !== false
                  ? getScheduleTypeMeta(editingFlexibleEntry.scheduleType).cardClassName
                  : 'border-slate-200 bg-slate-100'
              )}
            >
              <div className="mb-4 text-sm font-semibold text-slate-700">
                Tổng số slot: {getSlotCountForScheduleSlot(editingFlexibleEntry)}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Select
                  label="Loại lịch làm việc"
                  value={editingFlexibleEntry.scheduleType}
                  onChange={(event) =>
                    setEditingFlexibleEntry((current) => ({ ...current, scheduleType: event.target.value }))
                  }
                  options={SCHEDULE_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Giờ bắt đầu"
                  type="time"
                  value={editingFlexibleEntry.startTime}
                  onChange={(event) =>
                    setEditingFlexibleEntry((current) => ({ ...current, startTime: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Giờ kết thúc"
                  type="time"
                  value={editingFlexibleEntry.endTime}
                  onChange={(event) =>
                    setEditingFlexibleEntry((current) => ({ ...current, endTime: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Thời gian 1 slot (phút)"
                  type="number"
                  min="5"
                  step="5"
                  value={editingFlexibleEntry.slotDurationMinutes}
                  onChange={(event) =>
                    setEditingFlexibleEntry((current) => ({ ...current, slotDurationMinutes: event.target.value }))
                  }
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />

                <Input
                  label="Phí khám"
                  type="number"
                  min="0"
                  value={editingFlexibleEntry.fee}
                  onChange={(event) => setEditingFlexibleEntry((current) => ({ ...current, fee: event.target.value }))}
                  className="!rounded-[12px] !border-slate-200 !bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ece7] pt-4">
              <div className="flex items-center gap-3 text-base font-semibold text-slate-800">
                <span>Bật/Tắt lịch</span>
                <ToggleSwitch
                  checked={editingFlexibleEntry.enabled}
                  onChange={() =>
                    setEditingFlexibleEntry((current) => ({ ...current, enabled: !current.enabled }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => handleDeleteFlexibleEntry(editingFlexibleEntry.localId, 'Đã xóa lịch linh hoạt')}
                  className="rounded-[12px] bg-[#ef4444] text-white hover:bg-[#dc2626]"
                >
                  Xóa lịch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFlexibleEntry(null)}
                  className="rounded-[12px] border-slate-200"
                >
                  Đóng
                </Button>
                <Button type="button" onClick={handleUpdateFlexibleEntry} className={doctorPrimaryButtonClass}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(editingLeaveEntry)}
        onClose={() => setEditingLeaveEntry(null)}
        title="Điều chỉnh lịch nghỉ"
        size="md"
        showCloseButton={false}
      >
        {editingLeaveEntry ? (
          <div className="space-y-6">
            <div className="rounded-[18px] border border-[#ffd59f] bg-[#fff7eb] px-5 py-4 text-slate-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-[#f97316]" />
                <div className="space-y-2 text-base leading-8">
                  <p>Lưu ý</p>
                  <p>Khách hàng sẽ không thể đặt lịch khám hoặc tư vấn trong khung giờ nghỉ này.</p>
                </div>
              </div>
            </div>

            <Input
              label="Ngày nghỉ"
              type="date"
              value={editingLeaveEntry.date}
              onChange={(event) => setEditingLeaveEntry((current) => ({ ...current, date: event.target.value }))}
              className="!rounded-[12px] !border-slate-200 !bg-white"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Giờ bắt đầu"
                type="time"
                value={editingLeaveEntry.startTime}
                onChange={(event) =>
                  setEditingLeaveEntry((current) => ({ ...current, startTime: event.target.value }))
                }
                className="!rounded-[12px] !border-slate-200 !bg-white"
              />

              <Input
                label="Giờ kết thúc"
                type="time"
                value={editingLeaveEntry.endTime}
                onChange={(event) =>
                  setEditingLeaveEntry((current) => ({ ...current, endTime: event.target.value }))
                }
                className="!rounded-[12px] !border-slate-200 !bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ece7] pt-4">
              <div className="flex items-center gap-3 text-base font-semibold text-slate-800">
                <span>Bật/Tắt lịch</span>
                <ToggleSwitch
                  checked={editingLeaveEntry.enabled}
                  onChange={() => setEditingLeaveEntry((current) => ({ ...current, enabled: !current.enabled }))}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => handleDeleteFlexibleEntry(editingLeaveEntry.localId, 'Đã xóa lịch nghỉ')}
                  className="rounded-[12px] bg-[#ef4444] text-white hover:bg-[#dc2626]"
                >
                  Xóa lịch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLeaveEntry(null)}
                  className="rounded-[12px] border-slate-200"
                >
                  Đóng
                </Button>
                <Button type="button" onClick={handleUpdateLeaveEntry} className={doctorPrimaryButtonClass}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={copySourceDayOfWeek !== null}
        onClose={resetCopyDialog}
        title="Sao chép khung giờ"
        size="sm"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <button
            type="button"
            onClick={handleToggleAllCopyTargetDays}
            className="flex w-full items-center justify-between rounded-[18px] border border-[#d7e2da] px-4 py-3 text-left transition hover:bg-[#fafcfb]"
          >
            <span className="text-lg font-semibold text-slate-900">Chọn tất cả các ngày khác</span>
            <span
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-[10px] border transition',
                allCopyableDaysSelected
                  ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-[0_0_0_3px_rgba(37,99,235,0.15)]'
                  : 'border-slate-300 bg-white text-transparent'
              )}
            >
              <Check className="h-4 w-4" />
            </span>
          </button>

          <div className="space-y-3">
            {copyableDays.map((day) => (
              <button
                key={day.dayOfWeek}
                type="button"
                onClick={() => handleToggleCopyTargetDay(day.dayOfWeek)}
                className="flex w-full items-center justify-between rounded-[16px] px-2 py-2 text-left transition hover:bg-[#fafcfb]"
              >
                <span className="text-[18px] font-semibold text-slate-900">{day.name}</span>
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-md border transition',
                    copyTargetDays.includes(day.dayOfWeek)
                      ? 'border-[#2563eb] bg-[#2563eb] text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#e6ece7] pt-4">
            <div className="text-base text-slate-500">Đã chọn: {copyTargetDays.length} Ngày</div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetCopyDialog}
                className="rounded-[12px] border-slate-200"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleApplyCopy}
                disabled={copyTargetDays.length === 0}
                leftIcon={<Copy className="h-4 w-4" />}
                className={doctorPrimaryButtonClass}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
