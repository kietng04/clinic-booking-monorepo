import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { repairReactNode } from './utils/repairReactMojibake'

const lazyNamed = (load, name) =>
  lazy(() => load().then((module) => ({ default: module[name] })))

const ProtectedRoute = lazyNamed(() => import('./components/layout/ProtectedRoute'), 'ProtectedRoute')
const DashboardLayout = lazyNamed(() => import('./components/layout/DashboardLayout'), 'DashboardLayout')
const PatientLayout = lazyNamed(() => import('./components/layout/PatientLayout'), 'PatientLayout')
const DoctorWorkspaceLayout = lazyNamed(() => import('./components/layout/DoctorWorkspaceLayout'), 'DoctorWorkspaceLayout')

const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('./pages/auth/RegisterPage'), 'RegisterPage')
const PatientHome = lazy(() => import('./pages/patient/PatientHome'))
const BookAppointment = lazyNamed(() => import('./pages/patient/BookAppointment'), 'BookAppointment')
const AppointmentBookingSuccess = lazy(() => import('./pages/patient/AppointmentBookingSuccess'))
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
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds'))
const NotificationCenter = lazy(() => import('./pages/patient/NotificationCenter'))
const PrescriptionDetail = lazy(() => import('./pages/patient/PrescriptionDetail'))
const AppointmentDetail = lazy(() => import('./pages/patient/AppointmentDetail'))
const PaymentHistory = lazy(() => import('./pages/patient/PaymentHistory'))
const PaymentResult = lazy(() => import('./pages/patient/PaymentResult'))
const ClinicDetailBooking = lazy(() => import('./pages/patient/ClinicDetailBooking'))
const ForgotPassword = lazyNamed(() => import('./pages/auth/ForgotPassword'), 'ForgotPassword')
const ResetPassword = lazyNamed(() => import('./pages/auth/ResetPassword'), 'ResetPassword')
const VerifyEmail = lazyNamed(() => import('./pages/auth/VerifyEmail'), 'VerifyEmail')
const VerifyPhone = lazyNamed(() => import('./pages/auth/VerifyPhone'), 'VerifyPhone')
const ProfileSettings = lazy(() => import('./pages/profile/ProfileSettings'))
const PatientAccountPage = lazy(() => import('./pages/profile/PatientAccountPage'))
const DoctorAccountPage = lazy(() => import('./pages/profile/DoctorAccountPage'))
const SecuritySettings = lazy(() => import('./pages/profile/SecuritySettings'))
const NotificationSettings = lazy(() => import('./pages/profile/NotificationSettings'))
const DoctorSearch = lazy(() => import('./pages/patient/DoctorSearch'))

function RouteFallback() {
  return repairReactNode(
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
  const { user } = useAuthStore()
  const Layout = user?.role === 'DOCTOR' ? DoctorWorkspaceLayout : DashboardLayout

  return (
    <Suspense fallback={<RouteFallback />}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout>{children}</Layout>
      </ProtectedRoute>
    </Suspense>
  )
}

function ProtectedPatientPage({ allowedRoles = [], children }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <PatientLayout>{children}</PatientLayout>
      </ProtectedRoute>
    </Suspense>
  )
}

function ProtectedAccountPage({ allowedRoles = [], children }) {
  const { user } = useAuthStore()
  const Layout =
    user?.role === 'PATIENT' ? PatientLayout :
      user?.role === 'DOCTOR' ? DoctorWorkspaceLayout :
        DashboardLayout

  return (
    <Suspense fallback={<RouteFallback />}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout>{children}</Layout>
      </ProtectedRoute>
    </Suspense>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const dashboardPage =
    user?.role === 'PATIENT' ? <PatientHome /> :
      user?.role === 'DOCTOR' ? <DoctorDashboard /> :
        <AdminDashboard />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
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
            user?.role === 'PATIENT' ? (
              <ProtectedPatientPage allowedRoles={['PATIENT']}>
                {dashboardPage}
              </ProtectedPatientPage>
            ) : (
              <ProtectedDashboardPage>
                {dashboardPage}
              </ProtectedDashboardPage>
            )
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
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <DoctorSearch />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/appointments/book"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <BookAppointment />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/appointments/success"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <AppointmentBookingSuccess />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <Appointments />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/appointments/:id"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <AppointmentDetail />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <PaymentHistory />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/payment/result"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <PaymentResult />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/clinics/:clinicId"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <ClinicDetailBooking />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/hospitals/:hospitalSlug"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <ClinicDetailBooking />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/medical-records"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <MedicalRecords />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/medical-records/:id"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <MedicalRecordDetail />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/health-metrics"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <HealthMetrics />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/family"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <FamilyMembers />
            </ProtectedPatientPage>
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
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <NotificationCenter />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <PrescriptionDetail />
            </ProtectedPatientPage>
          }
        />

        {/* Patient Consultation routes */}
        <Route
          path="/patient/consultations"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <ConsultationList />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/patient/consultations/new"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <ConsultationRequest />
            </ProtectedPatientPage>
          }
        />

        <Route
          path="/patient/consultations/:consultationId"
          element={
            <ProtectedPatientPage allowedRoles={['PATIENT']}>
              <ConsultationChat />
            </ProtectedPatientPage>
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
          path="/doctor/bookings"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorAppointments />
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
          path="/doctor/calls"
          element={
            <ProtectedDashboardPage allowedRoles={['DOCTOR']}>
                <DoctorConsultations />
            </ProtectedDashboardPage>
          }
        />

        <Route
          path="/doctor/messages"
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
                <DoctorConsultations />
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

        <Route
          path="/admin/refunds"
          element={
            <ProtectedDashboardPage allowedRoles={['ADMIN']}>
                <AdminRefunds />
            </ProtectedDashboardPage>
          }
        />

        {/* Profile routes */}
        <Route
          path="/account"
          element={
            <ProtectedAccountPage allowedRoles={['PATIENT', 'DOCTOR']}>
              {user?.role === 'DOCTOR' ? <DoctorAccountPage /> : <PatientAccountPage />}
            </ProtectedAccountPage>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedAccountPage>
              <ProfileSettings />
            </ProtectedAccountPage>
          }
        />
        <Route
          path="/profile/security"
          element={
            <ProtectedAccountPage>
              <SecuritySettings />
            </ProtectedAccountPage>
          }
        />
        <Route
          path="/profile/notifications"
          element={
            <ProtectedAccountPage>
              <NotificationSettings />
            </ProtectedAccountPage>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
