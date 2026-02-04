import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MedicationPicker from '@/components/doctor/MedicationPicker'
import { Clock, FileText, AlertCircle, CheckCircle2, Plus } from 'lucide-react'

// Mock medications (same as medical database)
const MOCK_MEDICATIONS = [
  {
    id: 1,
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    defaultDosage: '500mg',
    defaultFrequency: 'Every 6 hours',
    defaultDuration: '7 days',
    instructions: 'Take with water after meals'
  },
  {
    id: 2,
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    defaultDosage: '400mg',
    defaultFrequency: 'Every 8 hours',
    defaultDuration: '5 days',
    instructions: 'Take with food'
  },
  {
    id: 3,
    name: 'Amoxicillin',
    genericName: 'Beta-lactam Antibiotic',
    defaultDosage: '250mg',
    defaultFrequency: '3 times daily',
    defaultDuration: '10 days',
    instructions: 'Complete full course even if symptoms improve'
  },
  {
    id: 4,
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    defaultDosage: '650mg',
    defaultFrequency: 'Every 4-6 hours',
    defaultDuration: '3 days',
    instructions: 'Do not exceed 4000mg per day'
  },
  {
    id: 5,
    name: 'Metformin',
    genericName: 'Biguanide',
    defaultDosage: '500mg',
    defaultFrequency: 'Twice daily',
    defaultDuration: 'Long-term',
    instructions: 'Take with or after meals'
  },
  {
    id: 6,
    name: 'Lisinopril',
    genericName: 'ACE Inhibitor',
    defaultDosage: '10mg',
    defaultFrequency: 'Once daily',
    defaultDuration: 'Long-term',
    instructions: 'Take at the same time each day'
  }
]

// Mock appointments (as they would come from backend)
const MOCK_APPOINTMENTS = [
  {
    id: 1001,
    patientName: 'John Doe',
    patientAge: 35,
    appointmentTime: '2026-02-02T10:00:00',
    reason: 'General Checkup',
    status: 'CONFIRMED',
    symptoms: 'Headache and fever'
  },
  {
    id: 1002,
    patientName: 'Jane Smith',
    patientAge: 28,
    appointmentTime: '2026-02-02T11:00:00',
    reason: 'Follow-up Visit',
    status: 'CONFIRMED',
    symptoms: 'Cough and sore throat'
  },
  {
    id: 1003,
    patientName: 'Robert Johnson',
    patientAge: 45,
    appointmentTime: '2026-02-02T14:00:00',
    reason: 'Chronic Condition Management',
    status: 'CONFIRMED',
    symptoms: 'Blood pressure monitoring'
  }
]

export default function MedicationPickerE2EDemo() {
  const navigate = useNavigate()
  const [step, setStep] = useState('appointments') // 'appointments' | 'medical-record'
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [prescriptions, setPrescriptions] = useState([{ id: 1, medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }])

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setStep('medical-record')
    // Reset prescriptions
    setPrescriptions([{ id: 1, medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const handleBackToAppointments = () => {
    setStep('appointments')
    setSelectedAppointment(null)
  }

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { id: prescriptions.length + 1, medicationId: '', medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ])
  }

  const handleRemovePrescription = (id) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id))
  }

  const handleMedicationSelect = (prescriptionId, selectedMed) => {
    setPrescriptions(prescriptions.map(p =>
      p.id === prescriptionId
        ? {
            ...p,
            medicationId: selectedMed.medicationId,
            medicationName: selectedMed.medicationName,
            dosage: selectedMed.dosage,
            frequency: selectedMed.frequency,
            duration: selectedMed.duration,
            instructions: selectedMed.instructions
          }
        : p
    ))
  }

  const handleSaveMedicalRecord = () => {
    alert(`✅ Medical record saved for ${selectedAppointment.patientName} with ${prescriptions.filter(p => p.medicationId).length} medication(s)!`)
    handleBackToAppointments()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sage-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-sage-900 mb-2">
            Doctor Portal - E2E Medication Picker Demo
          </h1>
          <p className="text-sage-600">
            End-to-end workflow: Appointments → Medical Records → Medication Selection
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'appointments' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-sage-100 border-2 border-sage-300'}`}>
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Appointments</span>
          </div>
          <div className="h-1 w-8 bg-sage-300"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'medical-record' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-sage-100 border-2 border-sage-300'}`}>
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Medical Record</span>
          </div>
        </div>

        {/* Appointments Step */}
        {step === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-sage-800 mb-6">
                📅 Today's Appointments
              </h2>
              <div className="space-y-4">
                {MOCK_APPOINTMENTS.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border-2 border-sage-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleSelectAppointment(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-sage-900 mb-2">
                          {appointment.patientName}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sage-700">
                          <div>
                            <p className="text-sm text-sage-600">Age</p>
                            <p className="font-medium">{appointment.patientAge} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-sage-600">Time</p>
                            <p className="font-medium">{new Date(appointment.appointmentTime).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-sage-600">Reason</p>
                            <p className="font-medium">{appointment.reason}</p>
                          </div>
                          <div>
                            <p className="text-sm text-sage-600">Symptoms</p>
                            <p className="font-medium">{appointment.symptoms}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
                  <p className="text-blue-800">
                    Click on any appointment above to create a medical record and select medications for the patient.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Record Step */}
        {step === 'medical-record' && selectedAppointment && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-sage-800">
                    👨‍⚕️ Medical Record - {selectedAppointment.patientName}
                  </h2>
                  <p className="text-sage-600 mt-1">Appointment ID: #{selectedAppointment.id}</p>
                </div>
                <button
                  onClick={handleBackToAppointments}
                  className="px-6 py-2 bg-sage-200 text-sage-800 rounded-lg hover:bg-sage-300 font-semibold transition"
                >
                  ← Back to Appointments
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-sage-50 rounded-lg">
                <div>
                  <p className="text-sm text-sage-600">Patient Name</p>
                  <p className="font-semibold text-sage-900">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Age</p>
                  <p className="font-semibold text-sage-900">{selectedAppointment.patientAge} years</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Reason</p>
                  <p className="font-semibold text-sage-900">{selectedAppointment.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Symptoms</p>
                  <p className="font-semibold text-sage-900">{selectedAppointment.symptoms}</p>
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-sage-800">
                  💊 Prescriptions
                </h3>
                <button
                  onClick={handleAddPrescription}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-6">
                {prescriptions.map((prescription, index) => (
                  <div key={prescription.id} className="border-2 border-sage-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-sage-800">Medication {index + 1}</h4>
                      {prescriptions.length > 1 && (
                        <button
                          onClick={() => handleRemovePrescription(prescription.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* MedicationPicker Component */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Search and Select Medication
                      </label>
                      <MedicationPicker
                        medications={MOCK_MEDICATIONS}
                        value={prescription.medicationId}
                        onSelect={(selectedMed) => handleMedicationSelect(prescription.id, selectedMed)}
                        placeholder="Type medication name or search..."
                        disabled={false}
                      />
                    </div>

                    {/* Selected Medication Details */}
                    {prescription.medicationName && (
                      <div className="bg-sage-50 border-2 border-sage-200 rounded-lg p-4">
                        <h5 className="font-semibold text-sage-800 mb-3">📋 Selected Medication Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-sage-600">Name</p>
                            <p className="font-semibold text-sage-900">{prescription.medicationName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-sage-600">Dosage</p>
                            <p className="font-semibold text-sage-900">{prescription.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-sage-600">Frequency</p>
                            <p className="font-semibold text-sage-900">{prescription.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-sage-600">Duration</p>
                            <p className="font-semibold text-sage-900">{prescription.duration}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-sage-600">Instructions</p>
                            <p className="font-semibold text-sage-900">{prescription.instructions}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBackToAppointments}
                className="px-8 py-3 bg-sage-200 text-sage-800 rounded-lg hover:bg-sage-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMedicalRecord}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition"
              >
                Save Medical Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
