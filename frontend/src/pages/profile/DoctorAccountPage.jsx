import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, Lock, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { profileApi } from '@/api/profileApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { PasswordStrengthBar } from '@/components/PasswordStrengthBar'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resolveAvatarSrc } from '@/lib/avatarUtils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  specialization: '',
  professionalStartYear: '',
  position: '',
  workplaceId: '',
  workplaceName: '',
  workplaceType: '',
  workAddress: '',
  avatarUrl: '',
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function normalizeDateValue(value) {
  if (!value) return ''
  const raw = String(value)
  return raw.includes('T') ? raw.slice(0, raw.indexOf('T')) : raw
}

function buildAddress(profile, user) {
  return (
    profile?.address ||
    profile?.workAddress ||
    profile?.workplaceAddress ||
    profile?.clinicAddress ||
    user?.workAddress ||
    ''
  )
}

function mapProfileToForm(profile, user) {
  return {
    fullName: profile?.fullName || user?.fullName || user?.name || '',
    phone: String(profile?.phone || profile?.phoneNumber || user?.phone || user?.phoneNumber || ''),
    email: profile?.email || user?.email || '',
    dateOfBirth: normalizeDateValue(profile?.dateOfBirth || user?.dateOfBirth),
    gender: profile?.gender || user?.gender || '',
    address: buildAddress(profile, user),
    specialization: profile?.specialization || user?.specialization || '',
    professionalStartYear: String(
      profile?.professionalStartYear ||
        profile?.startYear ||
        user?.professionalStartYear ||
        ''
    ),
    position: profile?.position || profile?.title || user?.position || '',
    workplaceId: String(profile?.workplaceId || ''),
    workplaceName:
      profile?.workplaceName ||
      profile?.workplace ||
      profile?.hospital ||
      profile?.clinicName ||
      user?.workplace ||
      '',
    workplaceType: profile?.workplaceType || '',
    workAddress:
      profile?.workAddress ||
      profile?.workplaceAddress ||
      profile?.clinicAddress ||
      user?.workAddress ||
      '',
    avatarUrl: profile?.avatarUrl || user?.avatar || '',
  }
}

export default function DoctorAccountPage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useUIStore()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      setLoading(true)
      try {
        const profile = await profileApi.getProfile()
        if (!active) return
        setFormData(mapProfileToForm(profile, user))
      } catch {
        if (!active) return
        setFormData(mapProfileToForm({}, user))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [user])

  const resolvedAvatar = resolveAvatarSrc(formData.avatarUrl, formData.email || user?.email, {
    name: formData.fullName || user?.name,
    role: 'DOCTOR',
  })

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSizeBytes = 5 * 1024 * 1024

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast({ type: 'error', message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.' })
      return
    }

    if (file.size > maxSizeBytes) {
      showToast({ type: 'error', message: 'Ảnh vượt quá dung lượng 5MB.' })
      return
    }

    const previousAvatar = formData.avatarUrl
    const previewUrl = URL.createObjectURL(file)

    setUploadingAvatar(true)
    handleChange('avatarUrl', previewUrl)

    profileApi.uploadAvatarFile(file)
      .then((result) => {
        const uploadedUrl = result?.avatarUrl || ''
        if (!uploadedUrl) {
          throw new Error('Không nhận được URL ảnh sau khi tải lên.')
        }

        handleChange('avatarUrl', uploadedUrl)
        updateUser({ avatar: uploadedUrl })
        showToast({ type: 'success', message: 'Đã cập nhật ảnh đại diện.' })
      })
      .catch((error) => {
        handleChange('avatarUrl', previousAvatar)
        showToast({
          type: 'error',
          message: extractApiErrorMessage(error, 'Không thể tải ảnh đại diện.'),
        })
      })
      .finally(() => {
        setUploadingAvatar(false)
        URL.revokeObjectURL(previewUrl)
        if (event.target) {
          event.target.value = ''
        }
      })
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()

    const fullName = formData.fullName.trim()
    const phone = String(formData.phone || '').trim()
    const phoneDigits = phone.replace(/\D/g, '')
    const address = formData.address.trim() || formData.workAddress.trim() || null
    const workplaceName = formData.workplaceName.trim() || null
    const position = formData.position.trim() || null
    const specialization = formData.specialization.trim() || null
    const professionalStartYear = formData.professionalStartYear
      ? Number(formData.professionalStartYear)
      : null

    if (!fullName) {
      showToast({ type: 'error', message: 'Vui lòng nhập tên tài khoản.' })
      return
    }

    if (!phone || phoneDigits.length < 8 || phoneDigits.length > 15) {
      showToast({ type: 'error', message: 'Vui lòng nhập số điện thoại hợp lệ.' })
      return
    }

    if (
      professionalStartYear &&
      (!Number.isFinite(professionalStartYear) ||
        professionalStartYear < 1950 ||
        professionalStartYear > getCurrentYear())
    ) {
      showToast({ type: 'error', message: 'Năm bắt đầu hành nghề không hợp lệ.' })
      return
    }

    setSavingProfile(true)
    try {
      const payload = {
        fullName,
        phone,
        avatarUrl: formData.avatarUrl || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        address,
        specialization,
        professionalStartYear,
        workplaceId: formData.workplaceId || null,
        workplaceName,
        workplaceType: formData.workplaceType || null,
        workplace: workplaceName,
        hospital: formData.workplaceType === 'Bệnh viện' ? workplaceName : null,
        clinicName: formData.workplaceType === 'Phòng khám' ? workplaceName : null,
        position,
        workAddress: address,
        clinicAddress: address,
      }

      const updated = await profileApi.updateProfile(payload)
      const nextForm = mapProfileToForm(
        {
          ...updated,
          email: updated?.email || formData.email,
          phone: updated?.phone || phone,
          address: updated?.address || updated?.workAddress || address,
          dateOfBirth: updated?.dateOfBirth || formData.dateOfBirth,
          gender: updated?.gender || formData.gender,
          specialization: updated?.specialization || specialization,
          professionalStartYear: updated?.professionalStartYear || professionalStartYear,
          workplaceName: updated?.workplaceName || workplaceName,
          workplaceType: updated?.workplaceType || formData.workplaceType,
          position: updated?.position || position,
          avatarUrl: updated?.avatarUrl || formData.avatarUrl,
        },
        user
      )

      setFormData(nextForm)
      updateUser({
        name: nextForm.fullName,
        fullName: nextForm.fullName,
        avatar: nextForm.avatarUrl,
        email: nextForm.email,
        phone: nextForm.phone,
        phoneNumber: nextForm.phone,
        dateOfBirth: nextForm.dateOfBirth,
        gender: nextForm.gender,
        specialization: nextForm.specialization,
        workplace: nextForm.workplaceName,
        workAddress: nextForm.address,
        position: nextForm.position,
        professionalStartYear: nextForm.professionalStartYear,
      })
      showToast({ type: 'success', message: 'Đã cập nhật tài khoản bác sĩ.' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể cập nhật tài khoản bác sĩ.'),
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin mật khẩu.' })
      return
    }

    if (newPassword.length < 8) {
      showToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
      return
    }

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: 'Xác nhận mật khẩu mới không khớp.' })
      return
    }

    setChangingPassword(true)
    try {
      await profileApi.changePassword(currentPassword, newPassword)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      showToast({ type: 'success', message: 'Đã thay đổi mật khẩu.' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể thay đổi mật khẩu.'),
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)] md:p-7">
        <div className="mb-6 flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              <Avatar src={resolvedAvatar} name={formData.fullName || user?.name} size="2xl" />
              <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white bg-[#1f5f43] text-white shadow-lg">
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Tài khoản</h2>
            </div>
          </div>

          <div className="text-sm text-slate-500">PNG, JPG, WEBP. Dung lượng tối đa 5MB.</div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Tên tài khoản *"
              value={formData.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              placeholder="Nhập tên tài khoản"
              leftIcon={<UserRound className="h-4 w-4" />}
              className="h-12 rounded-[16px] border-slate-200"
            />

            <Input
              label="Số điện thoại *"
              value={formData.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="Nhập số điện thoại"
              leftIcon={<Phone className="h-4 w-4" />}
              className="h-12 rounded-[16px] border-slate-200"
            />

            <Input
              label="Email *"
              value={formData.email}
              disabled
              leftIcon={<Mail className="h-4 w-4" />}
              className="h-12 rounded-[16px] border-slate-200 bg-slate-50 text-slate-500"
            />

            <Input
              label="Ngày sinh"
              type="date"
              value={formData.dateOfBirth}
              onChange={(event) => handleChange('dateOfBirth', event.target.value)}
              className="h-12 rounded-[16px] border-slate-200"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-sage-700">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(event) => handleChange('gender', event.target.value)}
                className="h-12 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-[#1f5f43]"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div />

            <Input
              label="Địa chỉ"
              value={formData.address}
              onChange={(event) => handleChange('address', event.target.value)}
              placeholder="Nhập địa chỉ"
              leftIcon={<MapPin className="h-4 w-4" />}
              containerClassName="md:col-span-2"
              className="h-12 rounded-[16px] border-slate-200"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={savingProfile}
              className="rounded-[16px] bg-[#1f5f43] px-6 text-white shadow-none hover:bg-[#184c35]"
            >
              Cập nhật tài khoản
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)] md:p-7">
        <div className="border-b border-slate-100 pb-6">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
          <Input
            label="Mật khẩu hiện tại *"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(event) => handlePasswordFieldChange('currentPassword', event.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            leftIcon={<Lock className="h-4 w-4" />}
            className="h-12 rounded-[16px] border-slate-200"
          />

          <Input
            label="Mật khẩu mới *"
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) => handlePasswordFieldChange('newPassword', event.target.value)}
            placeholder="Nhập mật khẩu mới"
            leftIcon={<Lock className="h-4 w-4" />}
            className="h-12 rounded-[16px] border-slate-200"
          />
          <PasswordStrengthBar password={passwordForm.newPassword} />

          <Input
            label="Xác nhận mật khẩu mới *"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(event) => handlePasswordFieldChange('confirmPassword', event.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            leftIcon={<Lock className="h-4 w-4" />}
            error={
              passwordForm.newPassword &&
              passwordForm.confirmPassword &&
              passwordForm.newPassword !== passwordForm.confirmPassword
                ? 'Mật khẩu xác nhận chưa khớp.'
                : ''
            }
            className="h-12 rounded-[16px] border-slate-200"
          />

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={changingPassword}
              className="rounded-[16px] bg-[#1f5f43] px-6 text-white shadow-none hover:bg-[#184c35]"
            >
              Lưu mật khẩu mới
            </Button>
          </div>
        </form>
      </section>
    </motion.div>
  )
}
