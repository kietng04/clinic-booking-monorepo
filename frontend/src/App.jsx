import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

const lazyNamed = (load, name) =>
  lazy(() => load().then((module) => ({ default: module[name] })))

const ProtectedRoute = lazyNamed(() => import('./components/layout/ProtectedRoute'), 'ProtectedRoute')
const DashboardLayout = lazyNamed(() => import('./components/layout/DashboardLayout'), 'DashboardLayout')

const LandingPage = lazyNamed(() => import('./pages/LandingPage'), 'LandingPage')
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage')
const PatientDashboard = lazyNamed(() => import('./pages/patient/PatientDashboard'), 'PatientDashboard')
const BookAppointment = lazyNamed(() => import('./pages/patient/BookAppointment'), 'BookAppointment')
const Appointments = lazy(() => import('./pages/patient/Appointments'))
const MedicalRecords = lazy(() => import('./pages/patient/MedicalRecords'))
const MedicalRecordDetail = lazy(() => import('./pages/patient/MedicalRecordDetail'))
const HealthMetrics = lazy(() => import('./pages/patient/HealthMetrics'))
const FamilyMembers = lazy(() => import('./pages/patient/FamilyMembers'))
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'))
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'))
const CreateMedicalRecord = lazy(() => import('./pages/doctor/CreateMedicalRecord'))
const DoctorSchedule = lazy(() => import('./pages/doctor/DoctorSchedule'))
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'))
const DoctorConsultations = lazy(() => import('./pages/doctor/DoctorConsultations'))
const DoctorConsultationChat = lazy(() => import('./pages/doctor/DoctorConsultationChat'))
const DoctorAnalytics = lazy(() => import('./pages/doctor/DoctorAnalytics'))
const ConsultationList = lazy(() => import('./pages/patient/ConsultationList'))
const ConsultationRequest = lazy(() => import('./pages/patient/ConsultationRequest'))
const ConsultationChat = lazy(() => import('./pages/patient/ConsultationChat'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const DoctorManagement = lazy(() => import('./pages/admin/DoctorManagement'))
const ClinicManagement = lazy(() => import('./pages/admin/ClinicManagement'))
const ServiceManagement = lazy(() => import('./pages/admin/ServiceManagement'))
const RoomManagement = lazy(() => import('./pages/admin/RoomManagement'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const NotificationCenter = lazy(() => import('./pages/patient/NotificationCenter'))
const PrescriptionDetail = lazy(() => import('./pages/patient/PrescriptionDetail'))
const AppointmentDetail = lazy(() => import('./pages/patient/AppointmentDetail'))
const PaymentHistory = lazy(() => import('./pages/patient/PaymentHistory'))
const PaymentResult = lazy(() => import('./pages/patient/PaymentResult'))
const ForgotPassword = lazyNamed(() => import('./pages/auth/ForgotPassword'), 'ForgotPassword')
const ResetPassword = lazyNamed(() => import('./pages/auth/ResetPassword'), 'ResetPassword')
const VerifyEmail = lazyNamed(() => import('./pages/auth/VerifyEmail'), 'VerifyEmail')
const VerifyPhone = lazyNamed(() => import('./pages/auth/VerifyPhone'), 'VerifyPhone')
const ProfileSettings = lazy(() => import('./pages/profile/ProfileSettings'))
const SecuritySettings = lazy(() => import('./pages/profile/SecuritySettings'))
const NotificationSettings = lazy(() => import('./pages/profile/NotificationSettings'))
const DoctorSearch = lazy(() => import('./pages/patient/DoctorSearch'))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-sage-950 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-sage-200 border-t-sage-600 animate-spin" />
        <p className="mt-4 text-sm text-sage-700 dark:text-sage-300">Đang tải trang...</p>
      </div>
    </div>
  )
}

function PublicPage({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function ProtectedDashboardPage({ allowedRoles = [], children }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
    </Suspense>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const dashboardPage =
    user?.role === 'PATIENT' ? <PatientDashboard /> :
      user?.role === 'DOCTOR' ? <DoctorDashboard /> :
        <AdminDashboard />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicPage><LandingPage /></PublicPage>} />
        <Route path="/login" element={!isAuthenticated ? <PublicPage><LoginPage /></PublicPage> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <PublicPage><RegisterPage /></PublicPage> : <Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<PublicPage><ForgotPassword /></PublicPage>} />
        <Route path="/reset-password" element={<PublicPage><ResetPassword /></PublicPage>} />
        <Route path="/verify-email" element={<PublicPage><VerifyEmail /></PublicPage>} />
        <Route path="/verify-phone" element={<PublicPage><VerifyPhone /></PublicPage>} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedDashboardPage>
              {dashboardPage}
            </ProtectedDashboardPage>
          }
        />

        {/* Redirect /doctor/dashboard to /dashboard for doctors */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
            </ProtectedDashboardPage>
          }
        />

        {/* Patient routes */}
        <Route
          path="/find-doctors"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <DoctorSearch />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/appointments/book"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <BookAppointment />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <Appointments />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/appointments/:id"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <AppointmentDetail />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <PaymentHistory />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/payment/result"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <PaymentResult />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/medical-records"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <MedicalRecords />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/medical-records/:id"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <MedicalRecordDetail />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/health-metrics"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <HealthMetrics />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/family"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <FamilyMembers />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Navigate
                to={user?.role === 'DOCTOR' ? '/consultations' : '/patient/consultations'}
                replace
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <NotificationCenter />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <PrescriptionDetail />
            </ProtectedDashboardPage>
          }
        />

        {/* Patient Consultation routes */}
        <Route
          path="/patient/consultations"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <ConsultationList />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/patient/consultations/new"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <ConsultationRequest />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/patient/consultations/:consultationId"
          element={
            <ProtectedDashboardPage allowedRoles={['PATIENT']}>
                <ConsultationChat />
            </ProtectedDashboardPage>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorAppointments />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/doctor/create-medical-record"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <CreateMedicalRecord />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorSchedule />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorPatients />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/consultations"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorConsultations />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/doctor/consultations/:consultationId"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorConsultationChat />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/doctor/analytics"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorAnalytics />
            </ProtectedDashboardPage>
          }
        />



        {/* Admin routes */}
        <Route
          path="/users"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <UserManagement />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <DoctorManagement />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/admin/clinics"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <ClinicManagement />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/admin/services"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <ServiceManagement />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/admin/rooms"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <RoomManagement />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <Reports />
            </ProtectedDashboardPage>
          }
        />

        {/* Profile routes */}
        <Route
          path="/profile"
          element={
            <ProtectedDashboardPage>
                <ProfileSettings />
            </ProtectedDashboardPage>
          }
        />
        <Route
          path="/profile/security"
          element={
            <ProtectedDashboardPage>
                <SecuritySettings />
            </ProtectedDashboardPage>
          }
        />
        <Route
          path="/profile/notifications"
          element={
            <ProtectedDashboardPage>
                <NotificationSettings />
            </ProtectedDashboardPage>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
