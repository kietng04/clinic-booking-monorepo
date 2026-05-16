export const setStoredTokens = (token, refreshToken) => {
  if (typeof localStorage === 'undefined') return

  if (token) {
    localStorage.setItem('accessToken', token)
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }

  const rawAuthStorage = localStorage.getItem('auth-storage')
  if (!rawAuthStorage) return

  try {
    const parsed = JSON.parse(rawAuthStorage)
    const nextState = {
      ...(parsed?.state || {}),
      ...(token ? { token } : {}),
      ...(refreshToken ? { refreshToken } : {}),
      isAuthenticated: true,
    }

    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        ...parsed,
        state: nextState,
      })
    )
  } catch {
    // Ignore malformed persisted auth state and keep bare tokens in localStorage.
  }
}

export const clearStoredAuth = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('auth-storage')
}
