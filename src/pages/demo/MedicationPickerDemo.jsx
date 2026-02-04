import React, { useState } from 'react'
import MedicationPicker from '@/components/doctor/MedicationPicker'

// Mock medications data
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
  },
  {
    id: 7,
    name: 'Atorvastatin',
    genericName: 'Statin',
    defaultDosage: '20mg',
    defaultFrequency: 'Once daily',
    defaultDuration: 'Long-term',
    instructions: 'Best taken in the evening'
  },
  {
    id: 8,
    name: 'Omeprazole',
    genericName: 'Proton Pump Inhibitor',
    defaultDosage: '20mg',
    defaultFrequency: 'Once daily',
    defaultDuration: '2 weeks',
    instructions: 'Take 30 minutes before meals'
  }
]

export default function MedicationPickerDemo() {
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [prescriptionData, setPrescriptionData] = useState({
    medicationId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })

  const handleSelect = (medication) => {
    console.log('Selected medication:', medication)
    setPrescriptionData({
      medicationId: medication.id,
      medicationName: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      instructions: medication.instructions
    })
    setSelectedMedication(medication)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-sage-900 mb-2">
            MedicationPicker Component Demo
          </h1>
          <p className="text-lg text-sage-600">
            Test the medication selection component with real-time search and auto-fill
          </p>
        </div>

        {/* Main Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-sage-800 mb-6">
            Select a Medication
          </h2>

          {/* MedicationPicker Component */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Search and select medication
            </label>
            <MedicationPicker
              medications={MOCK_MEDICATIONS}
              value={prescriptionData.medicationId}
              onSelect={handleSelect}
              placeholder="Type medication name or search..."
              disabled={false}
            />
          </div>

          {/* Display Selected Data */}
          {selectedMedication && (
            <div className="bg-sage-50 border-2 border-sage-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-sage-800 mb-4">
                Selected Medication Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sage-600">Medication ID</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.medicationId}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Name</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.medicationName}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Dosage</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Frequency</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Duration</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-600">Instructions</p>
                  <p className="font-semibold text-sage-900">{prescriptionData.instructions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-sage-800 mb-6">
            Features to Test
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">✓</span>
              <span className="text-sage-700">
                <strong>Real-time Search:</strong> Type any medication name and see results filter in real-time
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">✓</span>
              <span className="text-sage-700">
                <strong>Keyboard Navigation:</strong> Use Arrow Up/Down to navigate, Enter to select, Escape to close
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">✓</span>
              <span className="text-sage-700">
                <strong>Auto-fill:</strong> Selecting a medication automatically fills in all prescription details
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">✓</span>
              <span className="text-sage-700">
                <strong>Smooth Animations:</strong> Dropdown opens/closes with Framer Motion animations
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">✓</span>
              <span className="text-sage-700">
                <strong>Accessibility:</strong> ARIA attributes for screen readers and keyboard support
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
