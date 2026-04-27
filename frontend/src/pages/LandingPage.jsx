import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Shield,
  Heart,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'

export function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Đặt lịch dễ dàng',
      description: 'Chọn bác sĩ, khung giờ khám và xác nhận lịch hẹn chỉ trong vài bước.',
    },
    {
      icon: Shield,
      title: 'Bảo mật dữ liệu',
      description: 'Thông tin sức khỏe được mã hóa và bảo vệ theo tiêu chuẩn an toàn.',
    },
    {
      icon: Heart,
      title: 'Theo dõi sức khỏe',
      description: 'Quản lý chỉ số, hồ sơ khám và lịch sử điều trị ngay trên một nền tảng.',
    },
    {
      icon: Users,
      title: 'Chăm sóc gia đình',
      description: 'Theo dõi lịch khám và hồ sơ y tế của các thành viên trong gia đình.',
    },
    {
      icon: Clock,
      title: 'Hỗ trợ 24/7',
      description: 'Luôn có đội ngũ hỗ trợ khi cần tư vấn lịch hẹn hoặc thông tin khám bệnh.',
    },
    {
      icon: Sparkles,
      title: 'Gợi ý thông minh',
      description: 'Nhận nhắc lịch và gợi ý chăm sóc phù hợp với hồ sơ sức khỏe của bạn.',
    },
  ]

  const testimonials = [
    {
      name: 'Nguyễn Thị Lan',
      role: 'Bệnh nhân',
      avatar: '/landing/testimonial-nguyen-thi-lan.jpg',
      content: 'Tôi đặt lịch khám cho cả gia đình nhanh hơn trước rất nhiều. Giao diện dễ dùng và thông tin lịch hẹn rõ ràng.',
      rating: 5,
    },
    {
      name: 'BS. Trần Minh Quân',
      role: 'Bác sĩ Tim mạch',
      avatar: '/landing/vietnam-doctor-card.jpg',
      content: 'Hệ thống giúp tôi quản lý lịch khám gọn hơn, giảm thời gian xử lý thủ công và tập trung hơn vào bệnh nhân.',
      rating: 5,
    },
    {
      name: 'Phạm Gia Hân',
      role: 'Bệnh nhân',
      avatar: '/landing/testimonial-pham-gia-han.jpg',
      content: 'Các nhắc lịch và hồ sơ khám tập trung giúp tôi không bỏ sót lần tái khám quan trọng.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-sage-950">
      {/* Phần giới thiệu */}
      <section className="relative overflow-hidden">
        {/* Trang trí nền */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sage-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-terra-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Nội dung bên trái */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 dark:bg-sage-900 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span className="text-sm font-medium text-sage-700 dark:text-sage-300">
                  Được tin dùng bởi 50,000+ bệnh nhân
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-sage-900 dark:text-cream-100 mb-6 leading-tight">
                Hệ thống đặt lịch{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-terra-500">
                  khám bệnh
                </span>
              </h1>

              <p className="text-xl text-sage-600 dark:text-sage-400 mb-8 leading-relaxed">
                Kết nối bệnh nhân với bác sĩ, quản lý lịch hẹn và theo dõi hồ sơ khám bệnh trên một nền tảng trực tuyến.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Bắt đầu đặt lịch
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Đăng nhập
                  </Button>
                </Link>
              </div>

              {/* Chỉ số tin cậy */}
              <div className="mt-12 grid grid-cols-3 items-start gap-4 sm:flex sm:items-center sm:gap-8">
                <div>
                  <div className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">
                    200+
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">Bác sĩ chuyên khoa</div>
                </div>
                <div className="hidden w-px h-12 bg-sage-200 dark:bg-sage-800 sm:block"></div>
                <div>
                  <div className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">
                    98%
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">Tỷ lệ hài lòng</div>
                </div>
                <div className="hidden w-px h-12 bg-sage-200 dark:bg-sage-800 sm:block"></div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-terra-400 text-terra-400" />
                    ))}
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">Đánh giá 4.9/5</div>
                </div>
              </div>
            </motion.div>

            {/* Hình ảnh bên phải */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-soft overflow-hidden shadow-float">
                <img
                  src="/landing/vietnam-doctors-hero.jpg"
                  alt="Bác sĩ Việt Nam"
                  className="h-full w-full object-cover object-bottom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/50 to-transparent"></div>
              </div>

              {/* Thẻ nổi */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 left-4 glass p-4 rounded-soft shadow-float border border-white/20 sm:-left-6"
              >
                <div className="flex items-center gap-3">
                  <Avatar src="/landing/vietnam-doctor-card.jpg" name="BS. Nguyễn Minh Anh" size="md" />
                  <div>
                    <div className="font-semibold text-sage-900 dark:text-cream-100">BS. Nguyễn Minh Anh</div>
                    <div className="text-sm text-sage-600 dark:text-sage-400">Chuyên khoa Nội tổng quát</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-6 right-4 glass p-4 rounded-soft shadow-float border border-white/20 sm:-right-6"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-sage-900 dark:text-cream-100">Lịch hẹn đã xác nhận</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Phần tính năng */}
      <section className="py-24 bg-white dark:bg-sage-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-sage-900 dark:text-cream-100 mb-4">
              Mọi công cụ cần thiết cho việc chăm sóc sức khỏe
            </h2>
            <p className="text-xl text-sage-600 dark:text-sage-400 max-w-2xl mx-auto">
              Nền tảng hỗ trợ đặt lịch, quản lý hồ sơ và kết nối bác sĩ một cách thuận tiện, hiệu quả.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <div className="w-12 h-12 rounded-soft bg-gradient-to-br from-sage-500 to-terra-400 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-sage-900 dark:text-cream-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sage-600 dark:text-sage-400">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Phần đánh giá */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-sage-900 dark:text-cream-100 mb-4">
              Được bệnh nhân và bác sĩ tin tưởng
            </h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">
              Lắng nghe phản hồi từ cộng đồng sử dụng hệ thống đặt lịch khám bệnh
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-terra-400 text-terra-400" />
                    ))}
                  </div>
                  <p className="text-sage-700 dark:text-sage-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar src={testimonial.avatar} name={testimonial.name} size="md" />
                    <div>
                      <div className="font-semibold text-sage-900 dark:text-cream-100">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-sage-600 dark:text-sage-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phần kêu gọi hành động */}
      <section className="py-24 bg-gradient-to-br from-sage-600 via-sage-700 to-terra-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Sẵn sàng chủ động chăm sóc sức khỏe?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Tạo tài khoản để đặt lịch khám, theo dõi hồ sơ và quản lý lịch hẹn dễ dàng hơn.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-sage-900 hover:bg-cream-100"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Bắt đầu miễn phí
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Chân trang */}
      <footer className="bg-sage-900 dark:bg-sage-950 text-cream-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-500 to-terra-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="font-display font-bold text-xl">Lịch Khám</span>
              </div>
              <p className="text-cream-300 text-sm">
                Nền tảng đặt lịch khám bệnh trực tuyến dành cho bệnh nhân và bác sĩ.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/features" className="hover:text-white">Tính năng</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Bảng giá</Link></li>
                <li><Link to="/doctors" className="hover:text-white">Tìm bác sĩ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/about" className="hover:text-white">Giới thiệu</Link></li>
                <li><Link to="/careers" className="hover:text-white">Tuyển dụng</Link></li>
                <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/privacy" className="hover:text-white">Chính sách bảo mật</Link></li>
                <li><Link to="/terms" className="hover:text-white">Điều khoản dịch vụ</Link></li>
                <li><Link to="/hipaa" className="hover:text-white">Tuân thủ dữ liệu y tế</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream-800 mt-8 pt-8 text-center text-sm text-cream-400">
            © 2025 Lịch Khám. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </div>
  )
}
