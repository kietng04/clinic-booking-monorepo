import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Star,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  DollarSign,
} from 'lucide-react'
import { userApi } from '@/api/userApiWrapper'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'

export default function DoctorSearch() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Search & filter state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '')
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '')
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '')
  const [showFilters, setShowFilters] = useState(false)

  // Data state
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 12

  // Load specializations on mount
  useEffect(() => {
    loadSpecializations()
  }, [])

  // Search when filters or page change
  useEffect(() => {
    searchDoctors()
  }, [page])

  const loadSpecializations = async () => {
    try {
      const data = await userApi.getSpecializations()
      setSpecializations(data)
    } catch (error) {
      console.error('Failed to load specializations:', error)
    }
  }

  const searchDoctors = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, size: PAGE_SIZE }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (specialization) params.specialization = specialization
      if (minRating) params.minRating = Number(minRating)
      if (maxFee) params.maxFee = Number(maxFee)

      const data = await userApi.searchDoctors(params)
      setDoctors(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      console.error('Failed to search doctors:', error)
    } finally {
      setLoading(false)
    }
  }, [keyword, specialization, minRating, maxFee, page])

  const handleSearch = (e) => {
    e?.preventDefault()
    setPage(0)
    searchDoctors()
  }

  const clearFilters = () => {
    setKeyword('')
    setSpecialization('')
    setMinRating('')
    setMaxFee('')
    setPage(0)
    // Trigger search after clearing
    setTimeout(() => searchDoctors(), 0)
  }

  const hasActiveFilters = specialization || minRating || maxFee

  const handleBookDoctor = (doctorId) => {
    navigate(`/appointments/book?doctorId=${doctorId}`)
  }

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= numRating ? 'fill-terra-400 text-terra-400' : 'text-sage-300 dark:text-sage-600'}`}
        />
      )
    }
    return stars
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sage-900 dark:text-cream-100">
          Tìm Bác sĩ
        </h1>
        <p className="text-sage-600 dark:text-sage-400 mt-1">
          Tìm kiếm và đặt lịch khám với bác sĩ phù hợp
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button type="submit">
            Tìm kiếm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-terra-500 rounded-full" />
            )}
          </Button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sage-900 dark:text-cream-100">
                  Bộ lọc nâng cao
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-terra-600 hover:text-terra-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Chuyên khoa"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  options={[
                    { value: '', label: 'Tất cả chuyên khoa' },
                    ...specializations.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <div>
                  <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                    Đánh giá tối thiểu
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMinRating(minRating === String(star) ? '' : String(star))}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${Number(minRating) >= star ? 'fill-terra-400 text-terra-400' : 'text-sage-300 dark:text-sage-600'}`}
                        />
                      </button>
                    ))}
                    {minRating && (
                      <span className="ml-2 text-sm text-sage-600 dark:text-sage-400 self-center">
                        {minRating}+ sao
                      </span>
                    )}
                  </div>
                </div>
                <Input
                  label="Phí khám tối đa"
                  type="number"
                  placeholder="VD: 500000"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSearch}>
                  Áp dụng bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-sage-600 dark:text-sage-400">
          {totalElements > 0
            ? `Tìm thấy ${totalElements} bác sĩ`
            : loading ? '' : 'Không tìm thấy bác sĩ nào'}
        </p>
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap">
            {specialization && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {specialization}
                <button onClick={() => { setSpecialization(''); handleSearch() }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {minRating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {minRating}+ sao
                <button onClick={() => { setMinRating(''); handleSearch() }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {maxFee && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {'<='} {formatCurrency(maxFee)}
                <button onClick={() => { setMaxFee(''); handleSearch() }}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar
                        src={doctor.avatarUrl}
                        name={doctor.fullName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sage-900 dark:text-cream-100 truncate">
                          {doctor.fullName}
                        </h3>
                        <p className="text-sm text-sage-600 dark:text-sage-400">
                          {doctor.specialization}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(doctor.rating)}
                          <span className="text-sm font-medium text-sage-700 dark:text-sage-300 ml-1">
                            {doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {doctor.experienceYears != null && (
                        <div className="flex items-center gap-2 text-sm text-sage-600 dark:text-sage-400">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span>{doctor.experienceYears} năm kinh nghiệm</span>
                        </div>
                      )}
                      {doctor.workplace && (
                        <div className="flex items-center gap-2 text-sm text-sage-600 dark:text-sage-400">
                          <span className="w-4 h-4 flex-shrink-0 text-center">🏥</span>
                          <span className="truncate">{doctor.workplace}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-sage-200 dark:border-sage-800">
                      <span className="text-lg font-bold text-sage-900 dark:text-cream-100">
                        {formatCurrency(doctor.consultationFee)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleBookDoctor(doctor.id)}
                      >
                        Đặt lịch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => {
                  // Show first, last, and nearby pages
                  if (i === 0 || i === totalPages - 1) return true
                  if (Math.abs(i - page) <= 1) return true
                  return false
                })
                .reduce((acc, curr, idx, arr) => {
                  if (idx > 0 && curr - arr[idx - 1] > 1) {
                    acc.push('...')
                  }
                  acc.push(curr)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-sage-400">...</span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPage(item)}
                    >
                      {item + 1}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && doctors.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-sage-300 dark:text-sage-600 mb-4" />
              <h3 className="text-lg font-semibold text-sage-900 dark:text-cream-100 mb-2">
                Không tìm thấy bác sĩ
              </h3>
              <p className="text-sage-600 dark:text-sage-400 mb-6">
                Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
