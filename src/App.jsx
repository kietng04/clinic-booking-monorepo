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
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorConsultations from './pages/doctor/DoctorConsultations'
import DoctorAnalytics from './pages/doctor/DoctorAnalytics'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import DoctorManagement from './pages/admin/DoctorManagement'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// Placeholder components for routes that aren't fully implemented yet
function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-sage-900 dark:text-cream-100 mb-4">
          {title}
        </h2>
        <p className="text-sage-600 dark:text-sage-400">
          This feature is coming soon!
        </p>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

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
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <ComingSoon title="Settings" />
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
