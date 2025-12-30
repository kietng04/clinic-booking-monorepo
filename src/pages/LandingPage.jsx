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
      title: 'Easy Booking',
      description: 'Book appointments with top doctors in seconds, from anywhere.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with industry standards.',
    },
    {
      icon: Heart,
      title: 'Health Tracking',
      description: 'Monitor your vitals and health metrics with AI-powered insights.',
    },
    {
      icon: Users,
      title: 'Family Care',
      description: 'Manage healthcare for your entire family from one account.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock support and emergency consultation services.',
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get personalized health recommendations based on your data.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      avatar: 'https://i.pravatar.cc/150?img=44',
      content: 'HealthFlow made managing my family\'s healthcare so much easier. The interface is intuitive and the doctors are excellent!',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      avatar: 'https://i.pravatar.cc/150?img=12',
      content: 'As a doctor, this platform streamlines my workflow. I can focus more on patient care and less on administrative tasks.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      avatar: 'https://i.pravatar.cc/150?img=45',
      content: 'The AI health insights helped me catch a potential issue early. This platform truly cares about preventive healthcare.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-sage-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sage-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-terra-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 dark:bg-sage-900 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span className="text-sm font-medium text-sage-700 dark:text-sage-300">
                  Trusted by 50,000+ patients
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-sage-900 dark:text-cream-100 mb-6 leading-tight">
                Your health,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-terra-500">
                  simplified
                </span>
              </h1>

              <p className="text-xl text-sage-600 dark:text-sage-400 mb-8 leading-relaxed">
                Connect with expert doctors, manage appointments, and take control of your wellness journey—all in one beautiful platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <div className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">
                    200+
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">Expert Doctors</div>
                </div>
                <div className="w-px h-12 bg-sage-200 dark:bg-sage-800"></div>
                <div>
                  <div className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100">
                    98%
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">Satisfaction Rate</div>
                </div>
                <div className="w-px h-12 bg-sage-200 dark:bg-sage-800"></div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-terra-400 text-terra-400" />
                    ))}
                  </div>
                  <div className="text-sm text-sage-600 dark:text-sage-400">4.9/5 Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Right image/illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-soft overflow-hidden shadow-float">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                  alt="Healthcare"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-900/50 to-transparent"></div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass p-4 rounded-soft shadow-float border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Avatar src="https://i.pravatar.cc/150?img=5" name="Dr. Sarah" size="md" />
                  <div>
                    <div className="font-semibold text-sage-900 dark:text-cream-100">Dr. Sarah Mitchell</div>
                    <div className="text-sm text-sage-600 dark:text-sage-400">Cardiology Specialist</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-6 -right-6 glass p-4 rounded-soft shadow-float border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-sage-900 dark:text-cream-100">Appointment Confirmed</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-sage-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-sage-900 dark:text-cream-100 mb-4">
              Everything you need for better health
            </h2>
            <p className="text-xl text-sage-600 dark:text-sage-400 max-w-2xl mx-auto">
              A comprehensive platform designed to make healthcare accessible, efficient, and personal.
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

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-sage-900 dark:text-cream-100 mb-4">
              Loved by patients and doctors
            </h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">
              See what our community has to say about HealthFlow
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-sage-600 via-sage-700 to-terra-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to take control of your health?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied patients and healthcare professionals today.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-sage-900 hover:bg-cream-100"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started - It's Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sage-900 dark:bg-sage-950 text-cream-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-500 to-terra-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="font-display font-bold text-xl">HealthFlow</span>
              </div>
              <p className="text-cream-300 text-sm">
                Modern healthcare platform for patients and doctors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/doctors" className="hover:text-white">Find Doctors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-cream-300">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/hipaa" className="hover:text-white">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream-800 mt-8 pt-8 text-center text-sm text-cream-400">
            © 2025 HealthFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
