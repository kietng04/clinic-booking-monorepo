import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Navbar } from './components/layout/Navbar'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { PatientDashboard } from './pages/patient/PatientDashboard'
import { BookAppointment } from './pages/patient/BookAppointment'
import Appointments from './pages/patient/Appointments'
import MedicalRecords from './pages/patient/MedicalRecords'
import MedicalRecordDetail from './pages/patient/MedicalRecordDetail'
import HealthMetrics from './pages/patient/HealthMetrics'
import FamilyMembers from './pages/patient/FamilyMembers'
import Messages from './pages/patient/Messages'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorConsultations from './pages/doctor/DoctorConsultations'
import DoctorConsultationChat from './pages/doctor/DoctorConsultationChat'
import DoctorAnalytics from './pages/doctor/DoctorAnalytics'
import ConsultationList from './pages/patient/ConsultationList'
import ConsultationRequest from './pages/patient/ConsultationRequest'
import ConsultationChat from './pages/patient/ConsultationChat'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import DoctorManagement from './pages/admin/DoctorManagement'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import ClinicManagement from './pages/admin/ClinicManagement'
import ServiceManagement from './pages/admin/ServiceManagement'
import RoomManagement from './pages/admin/RoomManagement'
import Reports from './pages/admin/Reports'
import VoucherManagement from './pages/admin/VoucherManagement'
import NotificationCenter from './pages/patient/NotificationCenter'
import PrescriptionDetail from './pages/patient/PrescriptionDetail'
import AppointmentDetail from './pages/patient/AppointmentDetail'
import PaymentHistory from './pages/patient/PaymentHistory'
import PaymentResult from './pages/patient/PaymentResult'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { VerifyEmail } from './pages/auth/VerifyEmail'
import { VerifyPhone } from './pages/auth/VerifyPhone'
import ProfileSettings from './pages/profile/ProfileSettings'
import SecuritySettings from './pages/profile/SecuritySettings'
import NotificationSettings from './pages/profile/NotificationSettings'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {user?.role === 'PATIENT' ? <PatientDashboard /> :
                  user?.role === 'DOCTOR' ? <DoctorDashboard /> :
                    <AdminDashboard />}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect /doctor/dashboard to /dashboard for doctors */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Patient routes */}
        <Route
          path="/appointments/book"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <BookAppointment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <Appointments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <AppointmentDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <PaymentHistory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/result"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <PaymentResult />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-records"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <MedicalRecords />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-records/:id"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <MedicalRecordDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-metrics"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <HealthMetrics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/family"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <FamilyMembers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Messages />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <NotificationCenter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <PrescriptionDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Patient Consultation routes */}
        <Route
          path="/patient/consultations"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <ConsultationList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/consultations/new"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <ConsultationRequest />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/consultations/:consultationId"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout>
                <ConsultationChat />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorAppointments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/create-medical-record"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <CreateMedicalRecord />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorSchedule />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorPatients />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultations"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorConsultations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/consultations/:consultationId"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorConsultationChat />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/analytics"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout>
                <DoctorAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <DoctorManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clinics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <ClinicManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <ServiceManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <RoomManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <VoucherManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfileSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/security"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SecuritySettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationSettings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
