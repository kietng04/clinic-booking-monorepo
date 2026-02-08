import { describe, it, expect } from 'vitest'
import { endpointRegistry } from './endpointRegistry'

describe('endpointRegistry', () => {
  it('contains only /api-prefixed paths', () => {
    for (const endpoint of endpointRegistry) {
      expect(endpoint.path.startsWith('/api/')).toBe(true)
    }
  })

  it('contains valid HTTP methods', () => {
    const allowed = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    for (const endpoint of endpointRegistry) {
      expect(allowed.has(endpoint.method)).toBe(true)
    }
  })

  it('does not have duplicate method+path+source entries', () => {
    const seen = new Set()
    for (const endpoint of endpointRegistry) {
      const key = `${endpoint.method} ${endpoint.path} ${endpoint.source}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})
