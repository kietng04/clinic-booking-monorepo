import React from 'react'
import { render } from '@testing-library/react'

// Custom render with common providers if needed
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return children
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
