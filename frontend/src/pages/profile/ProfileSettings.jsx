import { useAuthStore } from '@/store/authStore'
import DoctorProfileSettings from './DoctorProfileSettings'
import LegacyProfileSettings from './LegacyProfileSettings'
import PatientProfilesPage from './PatientProfilesPage'

export default function ProfileSettings() {
  const { user } = useAuthStore()

  if (user?.role === 'PATIENT') {
    return <PatientProfilesPage />
  }

  if (user?.role === 'DOCTOR') {
    return <DoctorProfileSettings />
  }

  return <LegacyProfileSettings />
}
