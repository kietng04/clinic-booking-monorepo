import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  HeartPulse,
  MessageSquareHeart,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card'

const features = [
  {
    icon: Calendar,
    title: 'Đặt lịch nhanh',
    description: 'Tìm bác sĩ, xem khung giờ khám còn trống và đặt lịch trước ngay trên nền tảng.',
  },
  {
    icon: FileText,
    title: 'Hồ sơ tập trung',
    description: 'Lịch sử khám, phiếu khám điện tử, đơn thuốc và hồ sơ sau khám được lưu tại một nơi.',
  },
  {
    icon: ShieldCheck,
    title: 'Tin cậy và an toàn',
    description: 'Thông tin lịch hẹn, số thứ tự và trạng thái thanh toán được hiển thị rõ ràng, minh bạch.',
  },
]

const stats = [
  { value: '50K+', label: 'Lượt đặt lịch đã xử lý' },
  { value: '200+', label: 'Bác sĩ và chuyên khoa đang kết nối' },
  { value: '24/7', label: 'Khả năng chủ động đặt khám' },
]

const workflows = [
  'Tìm bác sĩ theo chuyên khoa, bệnh viện hoặc phòng khám có lịch trống',
  'Nhận số thứ tự, khung giờ khám và thông tin lịch hẹn ngay trong tài khoản',
  'Theo dõi hồ sơ khám, đơn thuốc và lịch sử tái khám sau mỗi lần điều trị',
]

const bookingIntents = [
  {
    title: 'Đặt khám bác sĩ',
    description: 'Tìm bác sĩ theo chuyên khoa, ngày khám và khung giờ phù hợp với nhu cầu hiện tại.',
  },
  {
    title: 'Đặt khám bệnh viện',
    description: 'Ưu tiên bệnh viện lớn, nhận số thứ tự và khung giờ khám dự kiến trước khi đến nơi.',
  },
  {
    title: 'Đặt khám phòng khám',
    description: 'Phù hợp nhu cầu khám nhanh, tái khám hoặc theo dõi sức khỏe tại cơ sở gần nơi ở.',
  },
]

const specialties = [
  {
    title: 'Nội tổng quát',
    description: 'Khám định kỳ, tư vấn triệu chứng phổ biến và theo dõi sức khỏe lâu dài.',
    accent: 'from-sky-100 to-blue-50 text-sky-700',
  },
  {
    title: 'Tim mạch',
    description: 'Theo dõi huyết áp, chỉ số tim mạch và tái khám theo lịch hẹn rõ ràng.',
    accent: 'from-rose-100 to-orange-50 text-rose-700',
  },
  {
    title: 'Nhi khoa',
    description: 'Đặt lịch cho trẻ nhỏ, lưu hồ sơ theo từng thành viên gia đình.',
    accent: 'from-emerald-100 to-lime-50 text-emerald-700',
  },
  {
    title: 'Da liễu',
    description: 'Phù hợp cả khám trực tiếp lẫn tư vấn ban đầu từ xa.',
    accent: 'from-violet-100 to-fuchsia-50 text-violet-700',
  },
]

const doctors = [
  {
    name: 'PGS. TS. BS Trần Quang Nam',
    specialty: 'Nội tiết',
    experience: 'Hơn 20 năm kinh nghiệm',
    rating: '4.9/5',
    image: '/landing/doctor-sarah.jpg',
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    name: 'BS. CK2 Lê Thị Minh Hồng',
    specialty: 'Nhi khoa',
    experience: 'Bác sĩ Chuyên khoa II',
    rating: '4.8/5',
    image: '/landing/doctor-minh-anh.jpg',
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'BS. CK2 Nguyễn Thị Thu Hà',
    specialty: 'Nhi khoa',
    experience: 'Nhiều năm kinh nghiệm thăm khám',
    rating: '4.9/5',
    image: '/landing/doctor-hoang-phuc.jpg',
    accent: 'bg-violet-50 text-violet-700',
  },
]

const facilities = [
  {
    name: 'Bệnh viện Chợ Rẫy',
    type: 'Bệnh viện',
    meta: 'Nhiều chuyên khoa · Khám chuyên sâu',
    description: 'Phù hợp nhu cầu khám chuyên sâu, tái khám định kỳ và điều trị tại bệnh viện tuyến cuối.',
    image: '/landing/facility-hospital.jpg',
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    name: 'Bệnh viện Nhi Đồng 2',
    type: 'Bệnh viện',
    meta: 'Nhi khoa · Khám trẻ em · Đặt khám trước',
    description: 'Phù hợp gia đình có trẻ nhỏ cần chủ động số thứ tự và thời gian khám trước khi đến viện.',
    image: '/landing/facility-clinic.jpg',
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'Phòng khám Đa khoa Family Health',
    type: 'Phòng khám',
    meta: 'Nội tổng quát · Nhi khoa · Tai mũi họng',
    description: 'Phù hợp khám nhanh, tái khám và quản lý hồ sơ sức khỏe cho từng thành viên trong gia đình.',
    image: '/landing/facility-cardiology.jpg',
    accent: 'bg-violet-50 text-violet-700',
  },
]

const trustPoints = [
  {
    icon: Bell,
    title: 'Nhắc lịch tự động',
    description: 'Thông báo trước giờ khám, thay đổi lịch hẹn và nhắc tái khám theo thời gian thực.',
  },
  {
    icon: FileText,
    title: 'Hồ sơ bệnh án tập trung',
    description: 'Lưu lịch sử khám, đơn thuốc, chỉ định và thông tin sau khám trong cùng một luồng dễ tra cứu.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo mật dữ liệu',
    description: 'Thông tin sức khỏe được hiển thị đúng hồ sơ, đúng người bệnh và ưu tiên tính minh bạch.',
  },
  {
    icon: CreditCard,
    title: 'Thanh toán và trạng thái rõ ràng',
    description: 'Theo dõi thanh toán, hóa đơn và phiếu khám điện tử ngay sau khi đặt lịch thành công.',
  },
]

const faqs = [
  {
    question: 'Tôi có thể đặt lịch khám trực tuyến và trực tiếp không?',
    answer: 'Có. Bạn có thể đặt lịch khám trực tiếp tại bệnh viện, phòng khám hoặc tư vấn trực tuyến tùy bác sĩ và cơ sở y tế.',
  },
  {
    question: 'Sau khi khám tôi xem lại hồ sơ ở đâu?',
    answer: 'Hồ sơ bệnh án, đơn thuốc, lịch sử thanh toán và thông tin lần khám sẽ được lưu trong tài khoản bệnh nhân.',
  },
  {
    question: 'Gia đình có thể dùng chung một tài khoản không?',
    answer: 'Bạn có thể tạo và quản lý hồ sơ cho nhiều thành viên gia đình để đặt khám và theo dõi lịch riêng từng người.',
  },
  {
    question: 'Nếu cần đổi hoặc hủy lịch thì sao?',
    answer: 'Bạn có thể xem trạng thái lịch hẹn, đổi lịch hoặc hủy lịch ngay trong tài khoản nếu cơ sở y tế hỗ trợ thao tác đó.',
  },
]

const supportHighlights = [
  'Hỗ trợ đặt lịch và hướng dẫn chọn chuyên khoa phù hợp trong giờ hành chính',
  'Theo dõi phiếu khám, thanh toán, hồ sơ khám và nhắc lịch trong cùng tài khoản',
  'Phù hợp người dùng lần đầu cần chọn bác sĩ, bệnh viện hoặc phòng khám đúng nhu cầu',
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-100 text-sage-900 dark:bg-sage-950 dark:text-cream-100">
      <section className="relative overflow-hidden border-b border-sage-100 bg-gradient-to-br from-sky-50 via-white to-sky-100/60 dark:border-sage-800 dark:from-sage-950 dark:via-sage-900 dark:to-sage-950">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-r from-sky-100/90 via-white/20 to-brand-100/70 blur-3xl" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-12 top-16 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute left-1/2 top-10 h-52 w-52 -translate-x-1/2 rounded-full bg-sky-100/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pb-16 lg:pt-5">
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-sage-100 bg-white/78 px-4 py-3 shadow-soft backdrop-blur-sm dark:border-sage-800 dark:bg-sage-900/78">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-terra-400 text-white shadow-soft">
                <span className="text-lg font-semibold">H</span>
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-sage-900 dark:text-cream-100">HealthFlow</div>
                <div className="text-xs text-sage-500 dark:text-sage-400">Đặt khám và theo dõi chăm sóc sức khỏe</div>
              </div>
            </div>

            <div className="hidden items-center gap-6 lg:flex">
              <a href="#booking-intent" className="text-sm font-medium text-sage-700 transition-colors hover:text-brand-700 dark:text-sage-200 dark:hover:text-brand-300">Đặt khám</a>
              <a href="#specialties" className="text-sm font-medium text-sage-700 transition-colors hover:text-brand-700 dark:text-sage-200 dark:hover:text-brand-300">Chuyên khoa</a>
              <a href="#faq" className="text-sm font-medium text-sage-700 transition-colors hover:text-brand-700 dark:text-sage-200 dark:hover:text-brand-300">FAQ</a>
              <div className="rounded-full bg-gradient-to-r from-sky-100 to-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:from-brand-950/40 dark:to-sky-950/20 dark:text-brand-200">
                Hỗ trợ 1900 2805
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col pt-2 lg:min-h-[760px] lg:pt-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 shadow-soft dark:border-brand-900/50 dark:bg-brand-950/30 dark:text-brand-200">
                <CheckCircle2 className="h-4 w-4" />
                Đặt khám trước, nhận số thứ tự và khung giờ khám rõ ràng
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-tight text-sage-900 dark:text-cream-50 sm:text-[4.2rem]">
                Đặt khám nhanh, theo dõi lịch hẹn và lưu hồ sơ khám
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-sage-600 dark:text-sage-300">
                Chủ động chọn bác sĩ, nhận số thứ tự trước và xem lại thông tin sau khám ngay trong tài khoản.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="bg-brand-600 hover:bg-brand-700" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Tạo tài khoản
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-sky-200 bg-white/80 text-brand-700 hover:bg-sky-50 dark:border-brand-700 dark:bg-sage-900 dark:text-brand-200 dark:hover:bg-brand-900/20">
                    Đăng nhập
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat, index) => (
                  <div
                    data-testid={`hero-stat-card-${index + 1}`}
                    key={stat.label}
                    className={[
                      'rounded-2xl border p-4 shadow-soft dark:border-sage-800 dark:bg-sage-900/80',
                      index === 0 && 'border-sky-300 bg-gradient-to-br from-sky-200 via-sky-50 to-white',
                      index === 1 && 'border-brand-300 bg-gradient-to-br from-brand-200 via-sky-50 to-white',
                      index === 2 && 'border-sky-200 bg-gradient-to-br from-sky-100 via-white to-brand-50',
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="text-2xl font-semibold text-sage-900 dark:text-cream-100">{stat.value}</div>
                    <div className="mt-1 text-sm text-sage-600 dark:text-sage-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-sage-100 bg-gradient-to-br from-white via-sky-50/45 to-emerald-50/35 p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.16em] text-brand-700">
                      Dịch vụ nổi bật
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-sage-900">
                      Đặt khám bác sĩ, bệnh viện và phòng khám trên cùng một nền tảng
                    </div>
                    <div className="mt-3 text-sm leading-7 text-sage-600">
                      Chọn đúng chuyên khoa, nhận thông tin lịch khám và theo dõi hồ sơ sau khám ngay trong tài khoản.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-brand-100 to-sky-50 p-3 text-brand-700 shadow-soft">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: 'Đặt khám theo bác sĩ',
                      description: 'Chọn bác sĩ, chuyên khoa và khung giờ phù hợp.',
                    },
                    {
                      title: 'Đặt khám theo bệnh viện',
                      description: 'Nhận số thứ tự và theo dõi lịch hẹn rõ ràng.',
                    },
                    {
                      title: 'Lưu hồ sơ sau khám',
                      description: 'Xem lại phiếu khám, đơn thuốc và thanh toán.',
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={[
                        'rounded-2xl border p-4 shadow-soft',
                        index === 0 && 'border-sky-100 bg-sky-50/70',
                        index === 1 && 'border-brand-100 bg-brand-50/60',
                        index === 2 && 'border-emerald-100 bg-emerald-50/55',
                      ].filter(Boolean).join(' ')}
                    >
                      <div className="font-semibold text-sage-900">{item.title}</div>
                      <div className="mt-2 text-sm text-sage-600">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:pt-0"
            >
              <Card className="overflow-hidden border-brand-100 bg-white/90 p-0 shadow-float dark:border-sage-800 dark:bg-sage-900/90">
                <div data-testid="hero-booking-panel" className="relative overflow-hidden border-b border-brand-200 bg-brand-700 px-6 py-5 text-white shadow-soft dark:border-brand-900/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%),linear-gradient(135deg,#1d4ed8_0%,#2563eb_45%,#1e40af_100%)]" />
                  <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-white/10 bg-white/5 blur-2xl" />
                  <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-sky-300/10 blur-2xl" />

                  <div className="relative grid gap-5 lg:grid-cols-[1fr_260px] lg:items-start">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-white/80">Đặt khám trực tuyến</div>
                          <div className="mt-1 text-lg font-semibold text-white">
                            Chọn bác sĩ, ngày khám và khung giờ phù hợp để nhận số thứ tự trước khi đến khám.
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white/14 p-3 text-white shadow-soft backdrop-blur-sm ring-1 ring-white/20">
                          <Calendar className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Nội tiết', 'Nhi khoa', 'Tim mạch'].map((tag) => (
                          <span key={tag} className="rounded-full bg-white/12 px-3 py-1 text-sm text-white shadow-soft ring-1 ring-white/15">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                          <div className="text-sm text-white/70">Lịch gần nhất</div>
                          <div className="mt-1 font-semibold text-white">PGS. TS. BS Trần Quang Nam</div>
                          <div className="mt-1 text-sm text-white/80">Thứ Hai, 08:30 • Nội tiết</div>
                        </div>
                        <div className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                          <div className="text-sm text-white/70">Trạng thái</div>
                          <div className="mt-1 font-semibold text-white">Đã xác nhận khung giờ</div>
                          <div className="mt-1 text-sm text-white/80">Phiếu khám điện tử và nhắc lịch sẽ hiển thị trong tài khoản</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/14 bg-[#0f2c75]/55 p-3 shadow-float backdrop-blur-md">
                      <div className="overflow-hidden rounded-[22px] border border-white/12 bg-slate-950/35">
                        <div className="h-24 overflow-hidden border-b border-white/10">
                          <img
                            src="/landing/facility-hospital.jpg"
                            alt="Bệnh viện Chợ Rẫy"
                            className="h-full w-full object-cover opacity-80"
                          />
                        </div>
                        <div className="space-y-3 p-4">
                          <div className="text-xs uppercase tracking-[0.16em] text-white/55">Cơ sở y tế</div>
                          <div>
                            <div className="font-semibold text-white">Bệnh viện Chợ Rẫy</div>
                            <div className="mt-1 text-sm text-white/70">Khám chuyên khoa • Nhận số thứ tự trước</div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
                            <div className="text-sm text-white/65">Mã phiếu</div>
                            <div className="mt-1 font-semibold text-white">PK-CR-240413</div>
                            <div className="mt-1 text-sm text-white/72">Phiếu khám điện tử đã sẵn sàng</div>
                          </div>
                          <div className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-brand-700 shadow-soft">
                            Xem phiếu khám
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-sage-100 bg-gradient-to-r from-sky-50 via-white to-brand-50 px-6 py-5 dark:border-sage-800 dark:from-sage-900 dark:to-sage-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Luồng tiêu biểu</p>
                      <h2 className="mt-1 text-xl font-semibold text-sage-900 dark:text-cream-100">Từ đặt lịch đến theo dõi sau khám</h2>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-brand-100 to-terra-100 p-3 text-brand-700 dark:from-brand-950/40 dark:to-terra-900/30 dark:text-brand-200">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4 p-6">
                  {[
                    {
                      icon: Calendar,
                      title: '1. Chọn lịch phù hợp',
                      description: 'Xem lịch còn trống theo bác sĩ, chuyên khoa, bệnh viện hoặc phòng khám.',
                    },
                    {
                      icon: Clock3,
                      title: '2. Nhận xác nhận rõ ràng',
                      description: 'Trạng thái lịch hẹn, thanh toán, số thứ tự và nhắc lịch đều được hiển thị mạch lạc.',
                    },
                    {
                      icon: FileText,
                      title: '3. Theo dõi sau khám',
                      description: 'Hồ sơ bệnh án, đơn thuốc và thông tin sau khám được tập trung trong một nơi.',
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className={[
                          'flex gap-4 rounded-2xl border p-4 dark:border-sage-800 dark:bg-sage-900/60',
                          item.title.includes('1.') && 'border-sky-100 bg-sky-50/60',
                          item.title.includes('2.') && 'border-brand-100 bg-brand-50/50',
                          item.title.includes('3.') && 'border-sky-100 bg-sky-50/60',
                        ].filter(Boolean).join(' ')}
                      >
                        <div
                          className={[
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            item.title.includes('1.') && 'bg-gradient-to-br from-sky-100 to-blue-50 text-sky-700',
                            item.title.includes('2.') && 'bg-gradient-to-br from-brand-100 to-sky-50 text-brand-700',
                            item.title.includes('3.') && 'bg-gradient-to-br from-sky-100 to-brand-50 text-sky-700',
                          ].filter(Boolean).join(' ')}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                      <div className="font-medium text-sage-900 dark:text-cream-100">{item.title}</div>
                      <div className="mt-1 text-sm text-sage-600 dark:text-sage-300">{item.description}</div>
                    </div>
                  </div>
                )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-gradient-to-br from-sky-50 via-white to-emerald-50/40">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-100 to-terra-100 p-3 text-brand-700 dark:from-brand-950/40 dark:to-terra-900/30 dark:text-brand-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Thiết kế ưu tiên tính dễ hiểu</CardTitle>
                  <CardDescription>Hướng tới trải nghiệm đặt khám thực tế với ngôn ngữ gần với người dùng Việt Nam.</CardDescription>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-sage-600 dark:text-sage-300">
                {workflows.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className={[
                    'h-full',
                    feature.title === 'Đặt lịch nhanh' && 'bg-gradient-to-br from-sky-100 to-white',
                    feature.title === 'Hồ sơ tập trung' && 'bg-gradient-to-br from-emerald-100 to-white',
                    feature.title === 'Tin cậy và an toàn' && 'bg-gradient-to-br from-terra-100 to-white',
                  ].filter(Boolean).join(' ')}
                >
                  <CardContent className="p-6">
                    <div
                      className={[
                        'flex h-11 w-11 items-center justify-center rounded-xl',
                        feature.title === 'Đặt lịch nhanh' && 'bg-gradient-to-br from-sky-100 to-blue-50 text-sky-700',
                        feature.title === 'Hồ sơ tập trung' && 'bg-gradient-to-br from-emerald-100 to-lime-50 text-emerald-700',
                        feature.title === 'Tin cậy và an toàn' && 'bg-gradient-to-br from-terra-100 to-orange-50 text-terra-700',
                      ].filter(Boolean).join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="booking-intent" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="self-start bg-gradient-to-br from-sky-50 via-white to-violet-50/60 dark:from-sage-900 dark:to-sage-950">
            <CardContent className="p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                Booking intent
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                Đặt khám theo nhu cầu
              </h2>
              <p className="mt-3 text-base text-sage-600 dark:text-sage-300">
                Người dùng nên thấy ngay mình sẽ đặt khám bác sĩ, bệnh viện hay phòng khám, thay vì phải tự đoán luồng phù hợp sau khi bấm CTA.
              </p>

              <div className="mt-6 space-y-3">
                {bookingIntents.map((intent) => (
                  <div
                    key={intent.title}
                    className={[
                      'flex items-start justify-between gap-4 rounded-2xl border p-4 dark:border-sage-800 dark:bg-sage-950/60',
                      intent.title === 'Đặt khám bác sĩ' && 'border-sky-100 bg-sky-50/70',
                      intent.title === 'Đặt khám bệnh viện' && 'border-emerald-100 bg-emerald-50/60',
                      intent.title === 'Đặt khám phòng khám' && 'border-violet-100 bg-violet-50/60',
                    ].filter(Boolean).join(' ')}
                  >
                    <div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">{intent.title}</div>
                      <div className="mt-1 text-sm text-sage-600 dark:text-sage-300">{intent.description}</div>
                    </div>
                    <div className="mt-1 rounded-xl bg-white p-2 text-brand-700 shadow-soft dark:bg-sage-900 dark:text-brand-200">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5 dark:border-brand-900/40 dark:from-brand-950/30 dark:to-sage-900">
                <div className="text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
                  Bắt đầu từ đâu?
                </div>
                <div className="mt-2 text-base font-semibold text-sage-900 dark:text-cream-100">
                  Nếu chưa biết nên chọn bác sĩ hay cơ sở nào, bạn có thể bắt đầu từ chuyên khoa rồi xem lịch khám còn trống.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Nội tổng quát', 'Tim mạch', 'Nhi khoa', 'Da liễu'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1 text-sm text-sage-700 shadow-soft dark:bg-sage-800 dark:text-sage-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 via-white to-sky-50/70 dark:from-sage-900 dark:to-sage-950">
            <CardContent className="p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                Facilities
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                Bệnh viện và phòng khám nổi bật
              </h2>
              <div className="mt-6 grid gap-4">
                {facilities.map((facility) => (
                  <div key={facility.name} className="rounded-2xl border border-sage-100 bg-white/85 p-4 shadow-soft dark:border-sage-800 dark:bg-sage-950/60">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="mb-4 h-40 w-full rounded-2xl object-cover"
                    />
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-terra-100 text-brand-700 dark:from-brand-950/40 dark:to-terra-900/30 dark:text-brand-200">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sage-900 dark:text-cream-100">{facility.name}</div>
                        <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${facility.accent}`}>{facility.type}</div>
                        <div className="mt-1 text-sm text-sage-500 dark:text-sage-400">{facility.meta}</div>
                        <div className="mt-2 text-sm text-sage-600 dark:text-sage-300">{facility.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="specialties" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-sage-100 bg-gradient-to-br from-terra-50 via-white to-violet-50/50 p-6 shadow-soft dark:border-sage-800 dark:from-sage-900 dark:via-sage-900 dark:to-sage-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                Specialties
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                Chuyên khoa nổi bật
              </h2>
              <p className="mt-2 text-base text-sage-600 dark:text-sage-300">
                Đủ breadth để phục vụ lần khám đầu tiên lẫn các đợt tái khám định kỳ.
              </p>
            </div>
            <Button variant="outline">Xem bác sĩ và khung giờ</Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {specialties.map((specialty) => (
              <Card key={specialty.title} className="bg-white/85 dark:bg-sage-900/80">
                <CardContent className="p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${specialty.accent}`}>
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">{specialty.title}</CardTitle>
                  <CardDescription className="mt-2">{specialty.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-gradient-to-br from-violet-50 via-white to-emerald-50/30 dark:from-sage-900 dark:to-sage-950">
            <CardContent className="p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                Featured doctors
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                Bác sĩ được bệnh nhân tin tưởng
              </h2>
              <p className="mt-2 text-base text-sage-600 dark:text-sage-300">
                Kết nối với chuyên gia phù hợp thay vì bắt đầu từ một form trống.
              </p>
              <p className="mt-3 text-base text-sage-600 dark:text-sage-300">
                Người dùng Việt thường muốn biết bác sĩ nào đang khám, chuyên môn gì và có thể đặt lịch trước hay không ngay từ trang đầu tiên.
              </p>

              <div className="mt-6 space-y-4">
                {doctors.map((doctor) => (
                  <div key={doctor.name} className="flex items-start justify-between gap-4 rounded-2xl border border-sage-100 bg-cream-50/80 p-4 dark:border-sage-800 dark:bg-sage-950/60">
                    <div className="flex items-start gap-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-2xl object-cover shadow-soft"
                      />
                      <div>
                        <div className="font-semibold text-sage-900 dark:text-cream-100">{doctor.name}</div>
                        <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${doctor.accent}`}>{doctor.specialty}</div>
                        <div className="mt-1 text-sm text-sage-500 dark:text-sage-400">{doctor.experience}</div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-terra-100 px-3 py-1 text-sm font-medium text-terra-700 dark:bg-terra-900/30 dark:text-terra-200">
                      <Star className="h-4 w-4 fill-current" />
                      {doctor.rating}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustPoints.map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.title}
                  className={[
                    'h-full',
                    item.title === 'Nhắc lịch tự động' && 'bg-gradient-to-br from-sky-100 to-white',
                    item.title === 'Hồ sơ bệnh án tập trung' && 'bg-gradient-to-br from-emerald-100 to-white',
                    item.title === 'Bảo mật dữ liệu' && 'bg-gradient-to-br from-violet-100 to-white',
                    item.title === 'Thanh toán và trạng thái rõ ràng' && 'bg-gradient-to-br from-terra-100 to-white',
                  ].filter(Boolean).join(' ')}
                >
                  <CardContent className="p-6">
                    <div
                      className={[
                        'flex h-11 w-11 items-center justify-center rounded-xl',
                        item.title === 'Nhắc lịch tự động' && 'bg-gradient-to-br from-sky-100 to-blue-50 text-sky-700',
                        item.title === 'Hồ sơ bệnh án tập trung' && 'bg-gradient-to-br from-emerald-100 to-lime-50 text-emerald-700',
                        item.title === 'Bảo mật dữ liệu' && 'bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-700',
                        item.title === 'Thanh toán và trạng thái rõ ràng' && 'bg-gradient-to-br from-terra-100 to-orange-50 text-terra-700',
                      ].filter(Boolean).join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4">{item.title}</CardTitle>
                    <CardDescription className="mt-2">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-gradient-to-r from-brand-600 via-sky-500 to-emerald-400 text-white dark:from-brand-700 dark:via-sky-700 dark:to-emerald-700">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/75">
                Ready to convert
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Sẵn sàng đặt lịch lần khám tiếp theo mà không phải dò lại từng bước?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/80">
                Chọn bác sĩ, xem khung giờ còn trống, nhận số thứ tự, phiếu khám điện tử và tiếp tục theo dõi hồ sơ trong cùng một sản phẩm thống nhất.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/register">
                <Button className="bg-white text-brand-700 hover:bg-cream-50">Tạo tài khoản bệnh nhân</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                  Xem bác sĩ và khung giờ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="self-start bg-gradient-to-br from-violet-50 via-white to-cream-50 dark:from-sage-900 dark:to-sage-950">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-100 to-terra-100 p-3 text-brand-700 dark:from-brand-950/40 dark:to-terra-900/30 dark:text-brand-200">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                    FAQ
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight text-sage-900 dark:text-cream-100">
                    Giải đáp nhanh trước khi đặt lịch
                  </h2>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-sage-100 bg-gradient-to-br from-terra-50 via-white to-emerald-50 p-5 dark:border-sage-800 dark:from-sage-950 dark:to-sage-900">
                <div className="text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
                  Hỗ trợ người dùng mới
                </div>
                <div className="mt-2 text-base font-semibold text-sage-900 dark:text-cream-100">
                  Những gì người dùng thường cần trước khi bấm đặt lịch khám.
                </div>
                <ul className="mt-4 space-y-3 text-sm text-sage-600 dark:text-sage-300">
                  {supportHighlights.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl bg-brand-600 px-4 py-4 text-white shadow-soft">
                  <div className="text-sm uppercase tracking-wide text-white/80">Hỗ trợ nhanh</div>
                  <div className="mt-1 text-2xl font-semibold">1900 2805</div>
                  <div className="mt-1 text-sm text-white/80">Tư vấn đặt khám, chọn chuyên khoa và hướng dẫn sử dụng nền tảng</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={faq.question}
                className={[
                  index % 2 === 0 ? 'bg-gradient-to-br from-white to-sky-50/40' : 'bg-gradient-to-br from-white to-terra-50/40',
                  'dark:bg-sage-900/75',
                ].filter(Boolean).join(' ')}
              >
                <CardContent className="p-6">
                  <CardTitle>{faq.question}</CardTitle>
                  <CardDescription className="mt-3">{faq.answer}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
