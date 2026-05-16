import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, PencilLine } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { profileApi } from '@/api/profileApiWrapper'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { formatPhone } from '@/lib/utils'

const primaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-5 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const secondaryButtonClass =
  '!rounded-[6px] border-[#cfd9d1] bg-white px-5 py-3 text-base font-semibold text-[#173925] shadow-none hover:bg-[#f5f8f5]'

const normalizeDateValue = (value) => {
  if (!value) return ''
  const raw = String(value)
  return raw.includes('T') ? raw.slice(0, raw.indexOf('T')) : raw
}

const formatDateDisplay = (value) => {
  if (!value) return '--'
  const normalized = String(value).includes('T') ? String(value).slice(0, 10) : String(value)
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return normalized
  return date.toLocaleDateString('vi-VN')
}

const formatGenderLabel = (value) => {
  switch (String(value || '').toUpperCase()) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'OTHER':
      return 'Khác'
    default:
      return '--'
  }
}

const buildAddress = (profile) =>
  profile?.address ||
  profile?.streetAddress ||
  profile?.fullAddress ||
  profile?.district ||
  profile?.city ||
  profile?.province ||
  '--'

function InfoField({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[#e3ebe4] bg-[#fbfdfb] px-4 py-3">
      <div className="text-sm text-[#68806f]">{label}</div>
      <div className="mt-2 text-sm font-semibold text-[#173925]">{value || '--'}</div>
    </div>
  )
}

export default function PatientAccountPage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.getProfile()
        setProfile(data)
      } catch (error) {
        console.error('Failed to load account profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const accountInfo = useMemo(() => ({
    fullName: profile?.fullName || user?.name || '--',
    phone: formatPhone(profile?.phone || user?.phone || user?.phoneNumber || '') || '--',
    dateOfBirth: formatDateDisplay(profile?.dateOfBirth || user?.dateOfBirth),
    gender: formatGenderLabel(profile?.gender || user?.gender),
    address: buildAddress(profile),
    email: profile?.email || user?.email || '--',
    avatar: profile?.avatarUrl || user?.avatar || '',
  }), [profile, user])

  const openEditModal = () => {
    setAccountForm({
      fullName: profile?.fullName || user?.name || '',
      phone: profile?.phone || user?.phone || user?.phoneNumber || '',
      dateOfBirth: normalizeDateValue(profile?.dateOfBirth || user?.dateOfBirth),
      gender: profile?.gender || user?.gender || 'MALE',
      address: profile?.address || profile?.streetAddress || profile?.fullAddress || '',
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setIsSavingProfile(false)
  }

  const handleSaveAccountInfo = async () => {
    const payload = {
      fullName: accountForm.fullName.trim(),
      phone: accountForm.phone.trim(),
      dateOfBirth: accountForm.dateOfBirth || null,
      gender: accountForm.gender || null,
      address: accountForm.address.trim() || null,
    }

    if (!payload.fullName) {
      showToast({ type: 'error', message: 'Vui lòng nhập họ và tên.' })
      return
    }

    setIsSavingProfile(true)
    try {
      const updated = await profileApi.updateProfile(payload)
      setProfile(updated)
      updateUser({
        name: updated.fullName,
        phone: updated.phone,
        phoneNumber: updated.phone,
        email: updated.email,
        gender: updated.gender,
      })
      showToast({ type: 'success', message: 'Đã cập nhật thông tin tài khoản.' })
      closeEditModal()
    } catch (error) {
      setIsSavingProfile(false)
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'Không thể cập nhật thông tin tài khoản.',
      })
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    if (!passwords.current.trim() || !passwords.next.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.' })
      return
    }

    setChangingPassword(true)
    try {
      await profileApi.changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '' })
      showToast({ type: 'success', message: 'Đã thay đổi mật khẩu.' })
    } catch (error) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'Không thể thay đổi mật khẩu.',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loading text="Đang tải tài khoản..." />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#143c26]">Tài khoản</h1>
      </div>

      <section className="overflow-hidden border border-[#d7e2da] bg-white">
        <div className="border-b border-[#d7e2da] px-7 py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#6a7d70]">Hình avatar</div>
                <Avatar src={accountInfo.avatar} name={accountInfo.fullName} size="3xl" />
              </div>
              <div>
                <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#143c26]">Thông tin tài khoản</h2>
              </div>
            </div>
            <Button className={secondaryButtonClass} leftIcon={<PencilLine className="h-4 w-4" />} onClick={openEditModal}>
              Thay đổi thông tin tài khoản
            </Button>
          </div>
        </div>

        <div className="px-7 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoField label="Họ và tên" value={accountInfo.fullName} />
            <InfoField label="Số điện thoại" value={accountInfo.phone} />
            <InfoField label="Ngày sinh" value={accountInfo.dateOfBirth} />
            <InfoField label="Giới tính" value={accountInfo.gender} />
            <InfoField label="Địa chỉ" value={accountInfo.address} />
            <div className="md:col-span-2">
              <InfoField label="Email" value={accountInfo.email} />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border border-[#d7e2da] bg-white">
        <div className="border-b border-[#d7e2da] px-7 py-6">
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-[#143c26]">Thay đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 px-7 py-6">
          <Input
            label="Mật khẩu hiện tại *"
            type="password"
            value={passwords.current}
            onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))}
            placeholder="Mật khẩu hiện tại của bạn"
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <Input
            label="Mật khẩu mới *"
            type="password"
            value={passwords.next}
            onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))}
            placeholder="Nhập mật khẩu mới"
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <div className="pt-2">
            <Button type="submit" className={primaryButtonClass} isLoading={changingPassword}>
              Thay đổi
            </Button>
          </div>
        </form>
      </section>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Thay đổi thông tin tài khoản" size="lg">
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={accountForm.fullName}
            onChange={(event) => setAccountForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Số điện thoại"
            value={accountForm.phone}
            onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="09xxxxxxxx"
          />
          <Input
            label="Ngày sinh"
            type="date"
            value={accountForm.dateOfBirth}
            onChange={(event) => setAccountForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-[#173925]">Giới tính</label>
            <select
              value={accountForm.gender}
              onChange={(event) => setAccountForm((current) => ({ ...current, gender: event.target.value }))}
              className="h-12 w-full rounded-[10px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <Input
            label="Địa chỉ"
            value={accountForm.address}
            onChange={(event) => setAccountForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="Nhập địa chỉ"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className={secondaryButtonClass} onClick={closeEditModal}>
              Đóng
            </Button>
            <Button className={primaryButtonClass} isLoading={isSavingProfile} onClick={handleSaveAccountInfo}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
