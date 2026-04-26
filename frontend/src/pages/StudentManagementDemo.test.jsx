import { fireEvent, renderWithProviders, screen, within } from '@/test/utils'
import { StudentManagementDemo } from './StudentManagementDemo'

describe('StudentManagementDemo', () => {
  test('adds a student from the management form into the table', () => {
    renderWithProviders(<StudentManagementDemo />)

    fireEvent.change(screen.getByLabelText(/ho va ten/i), { target: { value: 'Nguyen Van A' } })
    fireEvent.change(screen.getByLabelText(/ma so sinh vien/i), { target: { value: '3122999999' } })
    fireEvent.change(screen.getByLabelText(/lop/i), { target: { value: 'DCT123C1' } })
    fireEvent.change(screen.getByLabelText(/chuyen nganh/i), { target: { value: 'Cong nghe thong tin' } })
    fireEvent.change(screen.getByLabelText(/email truong/i), { target: { value: 'vana@student.sgu.edu.vn' } })

    fireEvent.click(screen.getByRole('button', { name: /them sinh vien/i }))

    const table = screen.getByRole('table', { name: /danh sach sinh vien/i })
    expect(within(table).getByText('Nguyen Van A')).toBeInTheDocument()
    expect(within(table).getByText('3122999999')).toBeInTheDocument()
  })
})
