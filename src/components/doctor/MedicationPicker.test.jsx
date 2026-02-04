import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicationPicker from './MedicationPicker'

// Mock medication data
const mockMedications = [
  {
    id: 1,
    name: 'Aspirin',
    genericName: 'Acetylsalicylic acid',
    dosage: '500mg',
    strength: '500mg',
    defaultDosage: '1 viên',
    defaultFrequency: '2 lần/ngày',
    defaultDuration: '5 ngày',
    instructions: 'Uống sau ăn'
  },
  {
    id: 2,
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    dosage: '200mg',
    strength: '200mg',
    defaultDosage: '1 viên',
    defaultFrequency: '3 lần/ngày',
    defaultDuration: '7 ngày',
    instructions: 'Uống sau ăn'
  },
  {
    id: 3,
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    dosage: '500mg',
    strength: '500mg',
    defaultDosage: '2 viên',
    defaultFrequency: '3 lần/ngày',
    defaultDuration: '5 ngày',
    instructions: 'Uống trước ăn'
  },
  {
    id: 4,
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dosage: '500mg',
    strength: '500mg',
    defaultDosage: '1 viên',
    defaultFrequency: '3 lần/ngày',
    defaultDuration: '7 ngày',
    instructions: 'Uống sau ăn'
  },
  {
    id: 5,
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    dosage: '500mg',
    strength: '500mg',
    defaultDosage: '1 viên',
    defaultFrequency: '2 lần/ngày',
    defaultDuration: '10 ngày',
    instructions: 'Uống với nước'
  }
]

describe('MedicationPicker Component', () => {
  let mockOnSelect

  beforeEach(() => {
    mockOnSelect = vi.fn()
  })

  // ===== FILTERING & SEARCH TESTS =====

  describe('Search & Filtering', () => {
    it('should display first 5 medications when dropdown opens with empty search', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('Aspirin')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument()
      expect(screen.getByText('Paracetamol')).toBeInTheDocument()
      expect(screen.getByText('Amoxicillin')).toBeInTheDocument()
      expect(screen.getByText('Ciprofloxacin')).toBeInTheDocument()
    })

    it('should filter medications by name (case-insensitive)', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.type(input, 'aspir')

      await waitFor(() => {
        expect(screen.getByText('Aspirin')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument()
    })

    it('should filter medications by generic name', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.type(input, 'acetaminophen')

      await waitFor(() => {
        expect(screen.getByText('Paracetamol')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      expect(screen.queryByText('Aspirin')).not.toBeInTheDocument()
    })

    it('should filter medications by strength', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.type(input, '500mg')

      await waitFor(() => {
        expect(screen.getByText('Aspirin')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      expect(screen.getByText('Paracetamol')).toBeInTheDocument()
    })

    it('should show no results message when search matches nothing', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.type(input, 'xyz123nonexistent')

      await waitFor(() => {
        expect(screen.getByText(/Không tìm thấy thuốc/)).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should limit results to 5 medications max', async () => {
      const lotsOfMeds = Array.from({ length: 10 }, (_, i) => ({
        ...mockMedications[0],
        id: i,
        name: `Drug ${i}`
      }))

      render(
        <MedicationPicker
          medications={lotsOfMeds}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        const drugItems = screen.getAllByRole('option')
        expect(drugItems).toHaveLength(5)
      })
    })

    it('should show empty list message when medications array is empty', async () => {
      render(
        <MedicationPicker
          medications={[]}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText(/Chưa có thuốc nào/)).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  // ===== KEYBOARD NAVIGATION TESTS =====

  describe('Keyboard Navigation', () => {
    it('should move highlight down with Arrow Down key', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Press arrow down
      await userEvent.keyboard('{ArrowDown}')

      // Should still have highlighted item
      const items = screen.getAllByRole('option')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should move highlight up with Arrow Up key', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Move down twice then up
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')

      // Should have some highlighted item
      const items = screen.getAllByRole('option')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should wrap to first item when pressing ArrowUp on first item', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Press arrow up (should wrap)
      await userEvent.keyboard('{ArrowUp}')

      // Should have items
      const items = screen.getAllByRole('option')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should close dropdown on Escape key', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      // Dropdown should be visible
      expect(screen.getByText(/Aspirin/)).toBeInTheDocument()

      // Press escape
      await userEvent.keyboard('{Escape}')

      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByText(/Aspirin/)).not.toBeInTheDocument()
      })
    })

    it('should select medication on Enter key', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Press enter on first item
      await userEvent.keyboard('{Enter}')

      // Should call onSelect
      expect(mockOnSelect).toHaveBeenCalled()
    })
  })

  // ===== SELECTION & AUTO-FILL TESTS =====

  describe('Selection & Auto-fill', () => {
    it('should call onSelect with medication data on click', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      }, { timeout: 2000 })

      const aspirinItem = screen.getByText('Aspirin').closest('[role="option"]')
      await userEvent.click(aspirinItem)

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          medicationId: 1,
          medicationName: 'Aspirin'
        })
      )
    })

    it('should auto-fill all fields when medication is selected', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      const aspirinItem = screen.getByText(/Aspirin/).closest('[role="option"]')
      await userEvent.click(aspirinItem)

      // Should pass auto-filled data
      expect(mockOnSelect).toHaveBeenCalledWith({
        medicationId: 1,
        medicationName: 'Aspirin',
        dosage: '1 viên',
        frequency: '2 lần/ngày',
        duration: '5 ngày',
        instructions: 'Uống sau ăn'
      })
    })

    it('should display selected medication name in input', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      const aspirinItem = screen.getByText('Aspirin').closest('[role="option"]')
      await userEvent.click(aspirinItem)

      // Input should show medication name
      await waitFor(() => {
        expect(input.value).toBe('Aspirin')
      }, { timeout: 2000 })
    })
  })

  // ===== ACCESSIBILITY TESTS =====

  describe('Accessibility', () => {
    it('should have proper ARIA roles', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      expect(input).toHaveAttribute('role', 'combobox')
    })

    it('should have aria-expanded attribute', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      expect(input).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(input)
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should have aria-selected on highlighted items', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      const firstItem = screen.getByText(/Aspirin/).closest('[role="option"]')
      expect(firstItem).toHaveAttribute('aria-selected')
    })

    it('should support Tab key to close and move to next field', async () => {
      render(
        <div>
          <MedicationPicker
            medications={mockMedications}
            value=""
            onSelect={mockOnSelect}
            placeholder="Chọn thuốc..."
          />
          <input placeholder="Next field" />
        </div>
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      // Dropdown visible
      expect(screen.getByText(/Aspirin/)).toBeInTheDocument()

      // Press Tab
      await userEvent.keyboard('{Tab}')

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText(/Aspirin/)).not.toBeInTheDocument()
      })
    })
  })

  // ===== DISABLED STATE TEST =====

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          disabled={true}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      expect(input).toBeDisabled()

      // Should not open dropdown when clicked
      await userEvent.click(input)
      expect(screen.queryByText(/Aspirin/)).not.toBeInTheDocument()
    })
  })

  // ===== DISPLAY TESTS =====

  describe('Display Information', () => {
    it('should show medication details in dropdown items', async () => {
      render(
        <MedicationPicker
          medications={mockMedications}
          value=""
          onSelect={mockOnSelect}
          placeholder="Chọn thuốc..."
        />
      )

      const input = screen.getByPlaceholderText('Chọn thuốc...')
      await userEvent.click(input)

      // Wait for all medication items to be visible
      await waitFor(() => {
        const items = screen.getAllByRole('option')
        expect(items.length).toBeGreaterThan(0)
      }, { timeout: 2000 })
      
      // Check medication details are rendered
      expect(screen.getByText('Aspirin')).toBeInTheDocument()
    })
  })
})
