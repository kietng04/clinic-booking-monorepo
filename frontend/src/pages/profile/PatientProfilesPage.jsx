import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { familyMemberApi } from '@/api/familyMemberApiWrapper'
import { profileApi } from '@/api/profileApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { resolveAvatarSrc } from '@/lib/avatarUtils'
import { formatPhone } from '@/lib/utils'

const primaryButtonClass =
  '!rounded-[6px] border-[#0f4f2a] bg-[#0f4f2a] px-5 py-3 text-base font-semibold text-white shadow-none hover:bg-[#0b3f21]'
const secondaryButtonClass =
  '!rounded-[6px] border-[#cfd9d1] bg-white px-5 py-3 text-base font-semibold text-[#173925] shadow-none hover:bg-[#f5f8f5]'

const relationshipLabels = {
  SPOUSE: 'Vợ/Chồng',
  CHILD: 'Con',
  PARENT: 'Cha/Mẹ',
  SIBLING: 'Anh/Chị/Em',
  SON: 'Con trai',
  DAUGHTER: 'Con gái',
  WIFE: 'Vợ',
  HUSBAND: 'Chồng',
  OTHER: 'Khác',
}

const familyRelationshipOptions = [
  { value: 'SPOUSE', label: 'Vợ/Chồng' },
  { value: 'CHILD', label: 'Con' },
  { value: 'PARENT', label: 'Cha/Mẹ' },
  { value: 'SIBLING', label: 'Anh/Chị/Em' },
  { value: 'OTHER', label: 'Khác' },
]

const blankFamilyForm = {
  fullName: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  relationship: 'OTHER',
  address: '',
  email: '',
  insuranceCode: '',
  citizenId: '',
  ethnicity: '',
}

const blankSelfForm = {
  fullName: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  address: '',
  email: '',
  insuranceCode: '',
  citizenId: '',
  ethnicity: '',
}

const normalizeDateValue = (value) => {
  if (!value) return ''
  const raw = String(value)
  return raw.includes('T') ? raw.slice(0, raw.indexOf('T')) : raw
}

const formatDateDisplay = (value) => {
  const normalized = normalizeDateValue(value)
  if (!normalized) return '--'
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

const formatRelationshipLabel = (value) =>
  relationshipLabels[String(value || '').toUpperCase()] || 'Khác'

const formatNullableValue = (value) => {
  if (value === null || value === undefined) return '--'
  const trimmed = String(value).trim()
  return trimmed ? trimmed : '--'
}

const buildProfileAddress = (profile) =>
  profile?.address ||
  profile?.streetAddress ||
  profile?.fullAddress ||
  profile?.district ||
  profile?.city ||
  profile?.province ||
  ''

const buildFallbackPatientCode = (profile) => {
  const birthDigits = normalizeDateValue(profile?.dateOfBirth).replaceAll('-', '')
  const idDigits = String(profile?.entityId || profile?.id || '')
    .replace(/\D/g, '')
    .slice(-4)
    .padStart(4, '0')

  if (birthDigits) {
    return `YMP${birthDigits.slice(2)}${idDigits}`
  }

  if (idDigits !== '0000') {
    return `YMP000000${idDigits}`
  }

  return '--'
}

const buildPatientCode = (profile) =>
  profile?.patientCode ||
  profile?.code ||
  profile?.memberCode ||
  profile?.patientId ||
  buildFallbackPatientCode(profile)

const buildSelfProfile = (profile, user) => ({
  id: 'self',
  entityId: user?.id || profile?.id || 'self',
  type: 'SELF',
  title: 'Tôi',
  badge: 'Tôi',
  fullName: profile?.fullName || user?.name || 'Hồ sơ của tôi',
  dateOfBirth: normalizeDateValue(profile?.dateOfBirth || user?.dateOfBirth),
  gender: profile?.gender || user?.gender || '',
  phone: formatPhone(profile?.phone || user?.phone || user?.phoneNumber || ''),
  email: profile?.email || user?.email || '',
  address: buildProfileAddress(profile) || buildProfileAddress(user),
  insuranceCode: profile?.insuranceCode || '',
  citizenId: profile?.citizenId || '',
  ethnicity: profile?.ethnicity || '',
  occupation: profile?.occupation || '',
  avatar: resolveAvatarSrc(profile?.avatarUrl || profile?.avatar || user?.avatar, profile?.email || user?.email || profile?.fullName || user?.name, {
    name: profile?.fullName || user?.name,
    gender: profile?.gender || user?.gender,
    role: user?.role,
  }),
})

const buildFamilyProfile = (member) => ({
  id: `family-${member.id}`,
  entityId: member.id,
  type: 'FAMILY',
  title: formatRelationshipLabel(member.relationship),
  badge: 'Người thân',
  fullName: member.fullName || member.name || 'Hồ sơ người thân',
  dateOfBirth: normalizeDateValue(member.dateOfBirth),
  gender: member.gender || '',
  phone: formatPhone(member.phone || member.phoneNumber || ''),
  email: member.email || '',
  address: buildProfileAddress(member),
  insuranceCode: member.insuranceCode || '',
  citizenId: member.citizenId || '',
  ethnicity: member.ethnicity || '',
  occupation: member.occupation || '',
  avatar: resolveAvatarSrc(member.avatarUrl || member.avatar, member.email || member.fullName || member.name, {
    name: member.fullName || member.name,
    gender: member.gender,
    relationship: member.relationship,
  }),
  relationship: member.relationship || 'OTHER',
  bloodType: member.bloodType || '',
  allergies: member.allergies || '',
  chronicDiseases: member.chronicDiseases || '',
  height: member.height || '',
  weight: member.weight || '',
})

const buildSearchText = (profile) =>
  [
    profile.fullName,
    profile.title,
    profile.phone,
    profile.email,
    buildPatientCode(profile),
    formatDateDisplay(profile.dateOfBirth),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const DetailField = ({ icon, label, value, uppercase = false }) => (
  <div className="rounded-[10px] border border-[#e3ebe4] bg-[#fbfdfb] px-4 py-3">
    <div className="flex items-center gap-2 text-sm text-[#68806f]">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`mt-2 text-sm font-semibold text-[#173925] ${uppercase ? 'uppercase' : ''}`}>
      {formatNullableValue(value)}
    </div>
  </div>
)

export default function PatientProfilesPage() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useUIStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfileId, setSelectedProfileId] = useState('self')
  const [selfProfile, setSelfProfile] = useState(null)
  const [familyMembers, setFamilyMembers] = useState([])
  const [modalState, setModalState] = useState({ open: false, mode: 'self-edit', profile: null })
  const [selfForm, setSelfForm] = useState(blankSelfForm)
  const [familyForm, setFamilyForm] = useState(blankFamilyForm)

  const fetchProfiles = async () => {
    setIsLoading(true)
    try {
      const [profileResult, familyResult] = await Promise.all([
        profileApi.getProfile().catch(() => null),
        familyMemberApi.getMembers(user.id).catch(() => []),
      ])

      setSelfProfile(profileResult || {
        id: user?.id,
        fullName: user?.name,
        email: user?.email,
        phone: user?.phone || user?.phoneNumber,
      })
      setFamilyMembers(Array.isArray(familyResult) ? familyResult : [])
    } catch (error) {
      showToast({ type: 'error', message: 'Không thể tải hồ sơ bệnh nhân' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const profiles = useMemo(() => {
    const selfItem = buildSelfProfile(selfProfile, user)
    const familyItems = familyMembers.map(buildFamilyProfile)
    return [selfItem, ...familyItems]
  }, [familyMembers, selfProfile, user])

  const filteredProfiles = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return profiles
    return profiles.filter((profile) => buildSearchText(profile).includes(keyword))
  }, [profiles, searchQuery])

  useEffect(() => {
    if (!filteredProfiles.length) {
      setSelectedProfileId('')
      return
    }

    const hasSelected = filteredProfiles.some((profile) => profile.id === selectedProfileId)
    if (!hasSelected) {
      setSelectedProfileId(filteredProfiles[0].id)
    }
  }, [filteredProfiles, selectedProfileId])

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) || filteredProfiles[0] || null,
    [filteredProfiles, profiles, selectedProfileId]
  )

  const openSelfEditModal = () => {
    setSelfForm({
      fullName: selectedProfile?.fullName || '',
      phone: selectedProfile?.phone || '',
      dateOfBirth: normalizeDateValue(selectedProfile?.dateOfBirth),
      gender: selectedProfile?.gender || 'MALE',
      address: selectedProfile?.address || '',
      email: selectedProfile?.email || user?.email || '',
      insuranceCode: selectedProfile?.insuranceCode || '',
      citizenId: selectedProfile?.citizenId || '',
      ethnicity: selectedProfile?.ethnicity || '',
    })
    setModalState({ open: true, mode: 'self-edit', profile: selectedProfile })
  }

  const openFamilyAddModal = () => {
    setFamilyForm(blankFamilyForm)
    setModalState({ open: true, mode: 'family-add', profile: null })
  }

  const openFamilyEditModal = () => {
    setFamilyForm({
      fullName: selectedProfile?.fullName || '',
      phone: selectedProfile?.phone || '',
      dateOfBirth: normalizeDateValue(selectedProfile?.dateOfBirth),
      gender: selectedProfile?.gender || 'MALE',
      relationship: selectedProfile?.relationship || 'OTHER',
      address: selectedProfile?.address || '',
      email: selectedProfile?.email || '',
      insuranceCode: selectedProfile?.insuranceCode || '',
      citizenId: selectedProfile?.citizenId || '',
      ethnicity: selectedProfile?.ethnicity || '',
    })
    setModalState({ open: true, mode: 'family-edit', profile: selectedProfile })
  }

  const closeModal = () => {
    setModalState((current) => ({ ...current, open: false }))
    setIsSaving(false)
  }

  const handleSaveSelfProfile = async () => {
    const payload = {
      fullName: selfForm.fullName.trim(),
      phone: selfForm.phone.trim(),
      dateOfBirth: selfForm.dateOfBirth || null,
      gender: selfForm.gender || null,
      address: selfForm.address.trim() || null,
      email: selfForm.email.trim() || null,
      insuranceCode: selfForm.insuranceCode.trim() || null,
      citizenId: selfForm.citizenId.trim() || null,
      ethnicity: selfForm.ethnicity.trim() || null,
    }

    if (!payload.fullName) {
      showToast({ type: 'error', message: 'Vui lòng nhập họ và tên' })
      return
    }

    setIsSaving(true)
    try {
      const updated = await profileApi.updateProfile(payload)
      setSelfProfile(updated)
      updateUser({
        name: updated.fullName,
        phone: updated.phone,
        phoneNumber: updated.phone,
        email: updated.email,
        gender: updated.gender,
      })
      showToast({ type: 'success', message: 'Đã cập nhật hồ sơ chính' })
      closeModal()
    } catch (error) {
      setIsSaving(false)
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể cập nhật hồ sơ') })
    }
  }

  const handleSaveFamilyProfile = async () => {
    const payload = {
      fullName: familyForm.fullName.trim(),
      phoneNumber: familyForm.phone.trim() || null,
      dateOfBirth: familyForm.dateOfBirth || null,
      gender: familyForm.gender || null,
      relationship: familyForm.relationship || null,
      address: familyForm.address.trim() || null,
      email: familyForm.email.trim() || null,
      insuranceCode: familyForm.insuranceCode.trim() || null,
      citizenId: familyForm.citizenId.trim() || null,
      ethnicity: familyForm.ethnicity.trim() || null,
    }

    if (!payload.fullName || !payload.dateOfBirth) {
      showToast({ type: 'error', message: 'Vui lòng nhập họ tên và ngày sinh' })
      return
    }

    setIsSaving(true)
    try {
      if (modalState.mode === 'family-add') {
        await familyMemberApi.addMember({
          ...payload,
          userId: user.id,
        })
        showToast({ type: 'success', message: 'Đã thêm hồ sơ người thân' })
      } else {
        await familyMemberApi.updateMember(modalState.profile.entityId, payload)
        showToast({ type: 'success', message: 'Đã cập nhật hồ sơ người thân' })
      }

      closeModal()
      await fetchProfiles()
    } catch (error) {
      setIsSaving(false)
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể lưu hồ sơ người thân') })
    }
  }

  const handleDeleteFamilyProfile = async () => {
    if (!selectedProfile || selectedProfile.type !== 'FAMILY') return
    if (!window.confirm(`Xóa hồ sơ ${selectedProfile.fullName}?`)) return

    try {
      await familyMemberApi.deleteMember(selectedProfile.entityId)
      showToast({ type: 'success', message: 'Đã xóa hồ sơ người thân' })
      await fetchProfiles()
      setSelectedProfileId('self')
    } catch (error) {
      showToast({ type: 'error', message: extractApiErrorMessage(error, 'Không thể xóa hồ sơ') })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loading text="Đang tải hồ sơ..." />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#143c26]">Hồ sơ</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          <div className="border-b border-[#d7e2da] px-5 py-4">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm nhanh hồ sơ"
              leftIcon={<Search className="h-4 w-4" />}
              className="!rounded-[6px] border-[#d7e2da] pr-4"
            />
          </div>

          <div className="max-h-[640px] overflow-y-auto">
            {filteredProfiles.length === 0 ? (
              <div className="px-5 py-8 text-sm text-[#5f7363]">Không tìm thấy hồ sơ phù hợp.</div>
            ) : (
              filteredProfiles.map((profile) => {
                const isActive = profile.id === selectedProfile?.id
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`w-full border-b border-[#e5ece6] px-5 py-4 text-left transition ${
                      isActive ? 'bg-[#f4faf5]' : 'bg-white hover:bg-[#f8fbf8]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar src={profile.avatar} name={profile.fullName} size="md" shape="square" className="[&>img]:rounded-[16px] [&>div]:rounded-[16px]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#e9f4ec] px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#0f4f2a]">
                            {profile.badge}
                          </span>
                        </div>
                        <div className="mt-2 truncate text-base font-semibold text-[#173925]">{profile.fullName}</div>
                        <div className="mt-1 text-sm text-[#5f7363]">{formatDateDisplay(profile.dateOfBirth)}</div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t border-[#d7e2da] p-4">
            <Button className={`${primaryButtonClass} w-full justify-center`} leftIcon={<Plus className="h-4 w-4" />} onClick={openFamilyAddModal}>
              Thêm hồ sơ
            </Button>
          </div>
        </section>

        <section className="overflow-hidden border border-[#d7e2da] bg-white">
          {!selectedProfile ? (
            <div className="px-6 py-10 text-sm text-[#5f7363]">Chọn một hồ sơ để xem chi tiết.</div>
          ) : (
            <div>
              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <Avatar src={selectedProfile.avatar} name={selectedProfile.fullName} size="xl" shape="square" className="[&>img]:rounded-[16px] [&>div]:rounded-[16px]" />
                    </div>
                    <div>
                      <div className="text-[28px] font-bold uppercase tracking-[-0.02em] text-[#143c26]">
                        {selectedProfile.fullName}
                      </div>
                      <div className="mt-2 text-sm text-[#5f7363]">
                        Mã BN: <span className="font-semibold text-[#173925]">{buildPatientCode(selectedProfile)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className={`${secondaryButtonClass} justify-center`}
                      leftIcon={<PencilLine className="h-4 w-4" />}
                      onClick={selectedProfile.type === 'SELF' ? openSelfEditModal : openFamilyEditModal}
                    >
                      Thay đổi thông tin
                    </Button>
                    {selectedProfile.type === 'FAMILY' && (
                      <Button
                        variant="outline"
                        className={`${secondaryButtonClass} justify-center border-[#b53b2f] text-[#b53b2f] hover:bg-[#faeceb] hover:text-[#b53b2f]`}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={handleDeleteFamilyProfile}
                      >
                        Xóa hồ sơ
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-b border-[#d7e2da] px-7 py-6">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">Thông tin cơ bản</h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <DetailField icon={<UserRound className="h-4 w-4" />} label="Họ và tên" value={selectedProfile.fullName} uppercase />
                  <DetailField icon={<Phone className="h-4 w-4" />} label="Điện thoại" value={selectedProfile.phone} />
                  <DetailField icon={<CalendarDays className="h-4 w-4" />} label="Ngày sinh" value={formatDateDisplay(selectedProfile.dateOfBirth)} />
                  <DetailField icon={<Users className="h-4 w-4" />} label="Giới tính" value={formatGenderLabel(selectedProfile.gender)} />
                  <DetailField icon={<MapPin className="h-4 w-4" />} label="Địa chỉ" value={selectedProfile.address} uppercase />
                  <DetailField icon={<Mail className="h-4 w-4" />} label="Email" value={selectedProfile.email || user?.email} />
                </div>
              </div>

              <div className="px-7 py-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#0f4f2a]" />
                  <h2 className="text-lg font-semibold text-[#143c26]">Thông tin bổ sung</h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <DetailField icon={<ShieldCheck className="h-4 w-4" />} label="Mã BHYT" value={selectedProfile.insuranceCode} />
                  <DetailField icon={<ShieldCheck className="h-4 w-4" />} label="Số CMND/CCCD" value={selectedProfile.citizenId} />
                  <DetailField icon={<Users className="h-4 w-4" />} label="Dân tộc" value={selectedProfile.ethnicity} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={modalState.open}
        onClose={closeModal}
        title={
          modalState.mode === 'self-edit'
            ? 'Cập nhật hồ sơ chính'
            : modalState.mode === 'family-add'
              ? 'Thêm hồ sơ người thân'
              : 'Cập nhật hồ sơ người thân'
        }
        size="lg"
      >
        {modalState.mode === 'self-edit' ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-[#143c26]">Thông tin cơ bản</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Họ và tên"
                  value={selfForm.fullName}
                  onChange={(event) => setSelfForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Nguyễn Văn A"
                />
                <Input
                  label="Điện thoại"
                  value={selfForm.phone}
                  onChange={(event) => setSelfForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="09xxxxxxxx"
                />
                <Input
                  label="Ngày sinh"
                  type="date"
                  value={selfForm.dateOfBirth}
                  onChange={(event) => setSelfForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#173925]">Giới tính</label>
                  <select
                    value={selfForm.gender}
                    onChange={(event) => setSelfForm((current) => ({ ...current, gender: event.target.value }))}
                    className="h-12 w-full rounded-[10px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <Input
                  label="Địa chỉ"
                  value={selfForm.address}
                  onChange={(event) => setSelfForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Nhập địa chỉ"
                />
                <Input
                  label="Email"
                  value={selfForm.email}
                  onChange={(event) => setSelfForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#143c26]">Thông tin bổ sung</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Mã BHYT"
                  value={selfForm.insuranceCode}
                  onChange={(event) => setSelfForm((current) => ({ ...current, insuranceCode: event.target.value }))}
                  placeholder="Nhập mã BHYT"
                />
                <Input
                  label="Số CMND/CCCD"
                  value={selfForm.citizenId}
                  onChange={(event) => setSelfForm((current) => ({ ...current, citizenId: event.target.value }))}
                  placeholder="Nhập số CMND/CCCD"
                />
                <Input
                  label="Dân tộc"
                  value={selfForm.ethnicity}
                  onChange={(event) => setSelfForm((current) => ({ ...current, ethnicity: event.target.value }))}
                  placeholder="Nhập dân tộc"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" className={secondaryButtonClass} onClick={closeModal}>
                Đóng
              </Button>
              <Button className={primaryButtonClass} isLoading={isSaving} onClick={handleSaveSelfProfile}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-[#143c26]">Thông tin cơ bản</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Họ và tên"
                  value={familyForm.fullName}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Nguyễn Văn B"
                />
                <Input
                  label="Điện thoại"
                  value={familyForm.phone}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="09xxxxxxxx"
                />
                <Input
                  label="Ngày sinh"
                  type="date"
                  value={familyForm.dateOfBirth}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#173925]">Giới tính</label>
                  <select
                    value={familyForm.gender}
                    onChange={(event) => setFamilyForm((current) => ({ ...current, gender: event.target.value }))}
                    className="h-12 w-full rounded-[10px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                {modalState.mode === 'family-add' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#173925]">Quan hệ</label>
                    <select
                      value={familyForm.relationship}
                      onChange={(event) => setFamilyForm((current) => ({ ...current, relationship: event.target.value }))}
                      className="h-12 w-full rounded-[10px] border border-[#d7e2da] px-3 text-sm text-[#173925] outline-none focus:border-[#0f4f2a]"
                    >
                      {familyRelationshipOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Input
                  label="Địa chỉ"
                  value={familyForm.address}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Nhập địa chỉ"
                />
                <Input
                  label="Email"
                  value={familyForm.email}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#143c26]">Thông tin bổ sung</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Mã BHYT"
                  value={familyForm.insuranceCode}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, insuranceCode: event.target.value }))}
                  placeholder="Nhập mã BHYT"
                />
                <Input
                  label="Số CMND/CCCD"
                  value={familyForm.citizenId}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, citizenId: event.target.value }))}
                  placeholder="Nhập số CMND/CCCD"
                />
                <Input
                  label="Dân tộc"
                  value={familyForm.ethnicity}
                  onChange={(event) => setFamilyForm((current) => ({ ...current, ethnicity: event.target.value }))}
                  placeholder="Nhập dân tộc"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" className={secondaryButtonClass} onClick={closeModal}>
                Đóng
              </Button>
              <Button className={primaryButtonClass} isLoading={isSaving} onClick={handleSaveFamilyProfile}>
                {modalState.mode === 'family-add' ? 'Thêm hồ sơ' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
