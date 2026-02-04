import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2 } from 'lucide-react'

const MedicationPicker = ({
  medications = [],
  value = '',
  onSelect,
  disabled = false,
  placeholder = 'Chọn hoặc tìm thuốc...'
}) => {
  const [searchInput, setSearchInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  // Filter medications based on search input
  const filteredMedications = useMemo(() => {
    if (!searchInput.trim()) {
      return medications.slice(0, 5)
    }

    const query = searchInput.toLowerCase()
    return medications
      .filter(med =>
        med.name?.toLowerCase().includes(query) ||
        med.genericName?.toLowerCase().includes(query) ||
        med.strength?.toLowerCase().includes(query)
      )
      .slice(0, 5)
  }, [searchInput, medications])

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredMedications])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    setIsOpen(true)
  }

  // Handle medication selection
  const handleSelect = (medication) => {
    const selectedData = {
      medicationId: medication.id,
      medicationName: medication.name,
      dosage: medication.defaultDosage,
      frequency: medication.defaultFrequency,
      duration: medication.defaultDuration,
      instructions: medication.instructions
    }

    onSelect(selectedData)
    setSearchInput(medication.name)
    setIsOpen(false)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredMedications.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMedications.length - 1
        )
        break

      case 'Enter':
        e.preventDefault()
        if (filteredMedications[highlightedIndex]) {
          handleSelect(filteredMedications[highlightedIndex])
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break

      case 'Tab':
        setIsOpen(false)
        break

      default:
        break
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true)
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      )
      if (highlightedElement && highlightedElement.scrollIntoView) {
        try {
          highlightedElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        } catch (e) {
          // Ignore errors in test environment where scrollIntoView may not be fully implemented
        }
      }
    }
  }, [highlightedIndex, isOpen])

  // Find selected medication to show in input
  const selectedMedication = medications.find((m) => m.id === value)

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onKeyDown={handleKeyDown}
    >
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchInput || selectedMedication?.name || ''}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="medication-dropdown"
          aria-label="Chọn thuốc từ danh mục"
          className={`w-full px-3 py-2 border border-sage-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-sage-500
                     bg-white text-sage-900 placeholder-sage-500
                     ${disabled ? 'bg-sage-50 cursor-not-allowed opacity-60' : ''}`}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 
                      text-sage-400 pointer-events-none transition-transform
                      ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown Container */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            ref={dropdownRef}
            id="medication-dropdown"
            role="listbox"
            aria-label="Danh sách thuốc có sẵn"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 
                     bg-white border border-sage-200 rounded-lg 
                     shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="py-8 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-sage-600" />
                <p className="text-sm text-sage-600">Đang tải danh sách thuốc...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-700 underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State - No medications */}
            {!isLoading && !error && medications.length === 0 && !searchInput && (
              <div className="py-8 text-center">
                <p className="text-sm text-sage-500">
                  Chưa có thuốc nào trong hệ thống
                </p>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !error && searchInput && filteredMedications.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-sage-500">
                  Không tìm thấy thuốc "{searchInput}"
                </p>
              </div>
            )}

            {/* Medication Items */}
            {!isLoading && !error && filteredMedications.length > 0 && (
              filteredMedications.map((medication, index) => (
                <div
                  key={medication.id}
                  data-index={index}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelect(medication)}
                  className={`p-3 cursor-pointer transition-colors border-b border-sage-100 last:border-b-0
                    ${
                      highlightedIndex === index
                        ? 'bg-sage-100'
                        : 'hover:bg-sage-50'
                    }`}
                >
                  <div className="font-medium text-sage-900">
                    {medication.name}
                    {medication.genericName && (
                      <span className="text-sage-600 ml-1">
                        ({medication.genericName})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-sage-600 mt-1">
                    {medication.dosage}
                    {medication.defaultFrequency && (
                      <span> • {medication.defaultFrequency}</span>
                    )}
                    {medication.defaultDuration && (
                      <span> • {medication.defaultDuration}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MedicationPicker
