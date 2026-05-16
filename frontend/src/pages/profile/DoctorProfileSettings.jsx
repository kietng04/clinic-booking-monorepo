import { useEffect, useState } from 'react'
import {
  Briefcase,
  Building2,
  Camera,
  Loader2,
  MapPin,
  Search,
  UserRound,
} from 'lucide-react'
import { clinicApi } from '@/api/clinicApiWrapper'
import { extractApiErrorMessage } from '@/api/core/extractApiErrorMessage'
import { profileApi } from '@/api/profileApiWrapper'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { resolveAvatarSrc } from '@/lib/avatarUtils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const specializationOptions = [
  'Lao - bệnh phổi',
  'Tim mạch',
  'Nội tổng quát',
  'Nhi khoa',
  'Da liễu',
  'Thần kinh',
  'Cơ xương khớp',
  'Tai mũi họng',
  'Tiêu hóa',
  'Hô hấp',
]

const hospitalPresets = [
  { id: 'hospital-1', name: 'BV Đa Khoa Huyện Phú Tân', address: 'Phú Tân, An Giang', type: 'Bệnh viện' },
  { id: 'hospital-2', name: 'Bệnh viện Phạm Ngọc Thạch', address: 'Quận 5, TP.HCM', type: 'Bệnh viện' },
  { id: 'hospital-3', name: 'Bệnh viện Chợ Rẫy', address: 'Quận 5, TP.HCM', type: 'Bệnh viện' },
  { id: 'hospital-4', name: 'Bệnh viện Nhân dân 115', address: 'Quận 10, TP.HCM', type: 'Bệnh viện' },
  { id: 'hospital-5', name: 'Bệnh viện Đại học Y Dược TP.HCM', address: 'Quận 5, TP.HCM', type: 'Bệnh viện' },
]

const emptyForm = {
  fullName: '',
  professionalStartYear: '',
  specialization: '',
  workplaceId: '',
  workplaceName: '',
  workplaceType: '',
  workAddress: '',
  position: '',
  avatarUrl: '',
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function buildFacilityOptions(clinics) {
  const mappedClinics = (Array.isArray(clinics) ? clinics : []).map((clinic) => ({
    id: `clinic-${clinic.id}`,
    sourceId: clinic.id,
    name: clinic.name,
    address: clinic.address || '',
    type: 'Phòng khám',
  }))

  const seen = new Set()
  return [...hospitalPresets, ...mappedClinics].filter((item) => {
    const key = normalizeText(item.name)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function formatExperienceYears(startYear) {
  const numericYear = Number(startYear)
  if (!Number.isFinite(numericYear) || numericYear <= 0) return '--'
  const years = Math.max(getCurrentYear() - numericYear, 0)
  return `${years} năm kinh nghiệm`
}

export default function DoctorProfileSettings() {
  const { user, updateUser } = useAuthStore()
  const { showToast } = useUIStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [facilityLoading, setFacilityLoading] = useState(false)
  const [allFacilities, setAllFacilities] = useState([])
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [facilityQuery, setFacilityQuery] = useState('')
  const [customFacilityName, setCustomFacilityName] = useState('')
  const [customFacilityAddress, setCustomFacilityAddress] = useState('')
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      setFacilityLoading(true)

      try {
        const [profileResult, clinicResult] = await Promise.allSettled([
          profileApi.getProfile(),
          clinicApi.getClinics({ active: true }),
        ])

        const clinics = clinicResult.status === 'fulfilled' ? clinicResult.value : []
        const facilities = buildFacilityOptions(clinics)
        const profile = profileResult.status === 'fulfilled' ? profileResult.value || {} : {}

        const workplaceName =
          profile.workplaceName ||
          profile.workplace ||
          profile.hospital ||
          profile.clinicName ||
          user?.workplace ||
          ''

        const workAddress =
          profile.workAddress ||
          profile.workplaceAddress ||
          profile.clinicAddress ||
          profile.address ||
          user?.workAddress ||
          ''

        const nextForm = {
          fullName: profile.fullName || user?.name || '',
          professionalStartYear: String(
            profile.professionalStartYear ||
              profile.startYear ||
              profile.yearsOfExperienceStart ||
              user?.professionalStartYear ||
              ''
          ),
          specialization: profile.specialization || user?.specialization || '',
          workplaceId: String(profile.workplaceId || ''),
          workplaceName,
          workplaceType: profile.workplaceType || '',
          workAddress,
          position: profile.position || profile.title || user?.position || '',
          avatarUrl: profile.avatarUrl || user?.avatar || '',
        }

        if (!active) return

        setAllFacilities(facilities)
        setFormData(nextForm)
        setSelectedFacility(
          facilities.find((item) => normalizeText(item.name) === normalizeText(workplaceName)) || null
        )
      } catch {
        if (!active) return

        setFormData({
          ...emptyForm,
          fullName: user?.name || '',
          avatarUrl: user?.avatar || '',
        })
      } finally {
        if (!active) return
        setLoading(false)
        setFacilityLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [user])

  const filteredFacilities = allFacilities.filter((item) => {
    const query = normalizeText(facilityQuery)
    if (!query) return true
    return [item.name, item.address, item.type].some((value) => normalizeText(value).includes(query))
  })

  const resolvedAvatar = resolveAvatarSrc(formData.avatarUrl, user?.email || formData.fullName, {
    name: formData.fullName,
    role: 'DOCTOR',
  })

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSizeBytes = 5 * 1024 * 1024

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast({ type: 'error', message: 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP' })
      return
    }

    if (file.size > maxSizeBytes) {
      showToast({ type: 'error', message: 'Ảnh vượt quá 5MB' })
      return
    }

    const previousAvatar = formData.avatarUrl
    const previewUrl = URL.createObjectURL(file)

    handleChange('avatarUrl', previewUrl)
    setUploadingAvatar(true)

    profileApi.uploadAvatarFile(file)
      .then((result) => {
        const uploadedUrl = result?.avatarUrl || ''
        if (!uploadedUrl) {
          throw new Error('Không nhận được URL ảnh')
        }

        handleChange('avatarUrl', uploadedUrl)
        updateUser({ avatar: uploadedUrl })
        showToast({ type: 'success', message: 'Tải ảnh đại diện thành công' })
      })
      .catch((error) => {
        handleChange('avatarUrl', previousAvatar)
        showToast({ type: 'error', message: extractApiErrorMessage(error, 'Tải ảnh thất bại') })
      })
      .finally(() => {
        setUploadingAvatar(false)
        URL.revokeObjectURL(previewUrl)
        if (event.target) event.target.value = ''
      })
  }

  const openFacilityModal = () => {
    setFacilityQuery('')
    setCustomFacilityName(formData.workplaceName || '')
    setCustomFacilityAddress(formData.workAddress || '')
    setSelectedFacility(
      allFacilities.find((item) => normalizeText(item.name) === normalizeText(formData.workplaceName)) || null
    )
    setShowFacilityModal(true)
  }

  const handleApplyFacility = () => {
    if (selectedFacility) {
      setFormData((current) => ({
        ...current,
        workplaceId: selectedFacility.sourceId ? String(selectedFacility.sourceId) : '',
        workplaceName: selectedFacility.name,
        workplaceType: selectedFacility.type,
        workAddress: current.workAddress || selectedFacility.address || '',
      }))
      setShowFacilityModal(false)
      return
    }

    if (!customFacilityName.trim()) {
      showToast({ type: 'error', message: 'Hãy chọn nơi công tác hoặc tự nhập tên đơn vị' })
      return
    }

    setFormData((current) => ({
      ...current,
      workplaceId: '',
      workplaceName: customFacilityName.trim(),
      workplaceType: 'Tự nhập',
      workAddress: customFacilityAddress.trim() || current.workAddress,
    }))
    setShowFacilityModal(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.fullName.trim()) {
      showToast({ type: 'error', message: 'Họ và tên bác sĩ là bắt buộc' })
      return
    }

    const startYear = Number(formData.professionalStartYear)
    if (!Number.isFinite(startYear) || startYear < 1950 || startYear > getCurrentYear()) {
      showToast({ type: 'error', message: 'Năm bắt đầu hành nghề không hợp lệ' })
      return
    }

    if (!formData.specialization) {
      showToast({ type: 'error', message: 'Hãy chọn chuyên khoa chính' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl,
        specialization: formData.specialization,
        professionalStartYear: startYear,
        workplaceId: formData.workplaceId || null,
        workplaceName: formData.workplaceName.trim(),
        workplaceType: formData.workplaceType || null,
        workplace: formData.workplaceName.trim(),
        hospital: formData.workplaceType === 'Bệnh viện' ? formData.workplaceName.trim() : null,
        clinicName: formData.workplaceType === 'Phòng khám' ? formData.workplaceName.trim() : null,
        position: formData.position.trim(),
        workAddress: formData.workAddress.trim(),
        clinicAddress: formData.workAddress.trim(),
        address: formData.workAddress.trim(),
      }

      const updated = await profileApi.updateProfile(payload)

      updateUser({
        name: updated.fullName || payload.fullName,
        avatar: updated.avatarUrl || payload.avatarUrl,
        specialization: updated.specialization || payload.specialization,
        workplace: updated.workplaceName || updated.workplace || payload.workplaceName,
        workAddress: updated.workAddress || updated.address || payload.workAddress,
        position: updated.position || payload.position,
        professionalStartYear: updated.professionalStartYear || payload.professionalStartYear,
      })

      showToast({ type: 'success', message: 'Hồ sơ bác sĩ đã được cập nhật' })
    } catch (error) {
      showToast({
        type: 'error',
        message: extractApiErrorMessage(error, 'Không thể cập nhật hồ sơ bác sĩ'),
      })
    } finally {
      setSaving(false)
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
    <>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_390px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
          >
            <div className="mb-8 flex items-start gap-4">
              <div className="relative h-24 w-24">
                <Avatar src={resolvedAvatar} name={formData.fullName || user?.name} size="2xl" />
                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white bg-[#29352B] text-white shadow-lg">
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Họ và tên bác sĩ*"
                value={formData.fullName}
                onChange={(event) => handleChange('fullName', event.target.value)}
                leftIcon={<UserRound className="h-4 w-4" />}
                className="h-12 rounded-[16px] border-slate-200"
              />

              <Input
                label="Năm bắt đầu hành nghề*"
                type="number"
                min="1950"
                max={String(getCurrentYear())}
                value={formData.professionalStartYear}
                onChange={(event) => handleChange('professionalStartYear', event.target.value)}
                className="h-12 rounded-[16px] border-slate-200"
              />

              <div>
                <Select
                  label="Chuyên khoa*"
                  value={formData.specialization}
                  onChange={(event) => handleChange('specialization', event.target.value)}
                  options={specializationOptions.map((item) => ({ value: item, label: item }))}
                  placeholder="Chọn một chuyên khoa chính"
                  className="h-12 rounded-[16px] border-slate-200"
                />
              </div>

              <Input
                label="Chức vụ"
                value={formData.position}
                onChange={(event) => handleChange('position', event.target.value)}
                leftIcon={<Briefcase className="h-4 w-4" />}
                className="h-12 rounded-[16px] border-slate-200"
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-sage-700">Nơi công tác</label>
                <button
                  type="button"
                  onClick={openFacilityModal}
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={formData.workplaceName ? 'font-semibold text-slate-900' : 'font-medium text-slate-400'}>
                        {formData.workplaceName || 'Tìm bệnh viện, phòng khám hoặc tự nhập'}
                      </div>
                      {formData.workplaceType && (
                        <div className="mt-1 text-sm text-slate-500">{formData.workplaceType}</div>
                      )}
                    </div>
                    <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  </div>
                </button>
              </div>

              <Input
                label="Địa chỉ nơi công tác"
                value={formData.workAddress}
                onChange={(event) => handleChange('workAddress', event.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
                helperText="Địa chỉ này được tự nhập."
                containerClassName="md:col-span-2"
                className="h-12 rounded-[16px] border-slate-200"
              />
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                className="rounded-[16px] bg-[#29352B] px-6 text-white hover:bg-[#1f2921]"
                isLoading={saving}
              >
                Lưu hồ sơ bác sĩ
              </Button>
            </div>
          </form>

          <div className="p-0">
            <div className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col items-center text-center">
                <Avatar src={resolvedAvatar} name={formData.fullName || user?.name} size="2xl" />
                <h3 className="mt-5 text-[20px] font-semibold text-slate-900">
                  {formData.fullName || 'Họ và tên bác sĩ'}
                </h3>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-[#2563eb]">
                  <span>Bác sĩ</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-900">{formatExperienceYears(formData.professionalStartYear)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-medium text-slate-500">Chuyên khoa</span>
                  <span className="text-right font-semibold text-slate-900">{formData.specialization || '--'}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-medium text-slate-500">Chức vụ</span>
                  <span className="text-right font-semibold text-slate-900">{formData.position || '--'}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-medium text-slate-500">Nơi công tác</span>
                  <span className="text-right font-semibold text-slate-900">{formData.workplaceName || '--'}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-medium text-slate-500">Địa chỉ nơi công tác</span>
                  <span className="text-right font-semibold text-slate-900">{formData.workAddress || '--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showFacilityModal}
        onClose={() => setShowFacilityModal(false)}
        title="Chọn nơi công tác"
        size="lg"
      >
        <div className="space-y-5">
          <Input
            value={facilityQuery}
            onChange={(event) => setFacilityQuery(event.target.value)}
            placeholder="Tìm bệnh viện hoặc phòng khám..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-12 rounded-[16px] border-slate-200"
          />

          <div className="rounded-[20px] border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
              {facilityLoading ? 'Đang tải danh sách cơ sở...' : 'Cơ sở sẵn có'}
            </div>
            <div className="max-h-[280px] overflow-y-auto p-3">
              <div className="space-y-2">
                {filteredFacilities.map((item) => {
                  const isActive = selectedFacility?.id === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedFacility(item)
                        setCustomFacilityName('')
                      }}
                      className={`w-full rounded-[16px] border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-[#29352B] bg-[#f4f7f4]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.address || 'Chưa cập nhật địa chỉ'}</div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.type}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {!facilityLoading && filteredFacilities.length === 0 && (
                  <div className="rounded-[16px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    Không có cơ sở phù hợp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-dashed border-slate-300 p-4">
            <div className="text-sm font-semibold text-slate-800">Hoặc tự nhập nơi công tác</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                value={customFacilityName}
                onChange={(event) => {
                  setCustomFacilityName(event.target.value)
                  if (event.target.value.trim()) {
                    setSelectedFacility(null)
                  }
                }}
                placeholder="Ví dụ: BV Đa Khoa Huyện Phú Tân"
                className="h-11 rounded-[16px] border-slate-200"
              />
              <Input
                value={customFacilityAddress}
                onChange={(event) => setCustomFacilityAddress(event.target.value)}
                placeholder="Địa chỉ nơi công tác"
                className="h-11 rounded-[16px] border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFacilityModal(false)}
              className="rounded-[14px] border-slate-200"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleApplyFacility}
              className="rounded-[14px] bg-[#29352B] text-white hover:bg-[#1f2921]"
            >
              Áp dụng nơi công tác
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
