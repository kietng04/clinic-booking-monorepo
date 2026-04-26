import { renderWithProviders, screen } from './test/utils'
import App from './App'

describe('Student management route', () => {
  test('renders the student management demo page on its public route', async () => {
    window.history.pushState({}, '', '/student-management')

    renderWithProviders(<App />)

    expect(
      await screen.findByRole('heading', { name: /student management dashboard/i })
    ).toBeInTheDocument()
  })
})
