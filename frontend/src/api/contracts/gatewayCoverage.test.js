import { describe, it, expect } from 'vitest'
import { endpointRegistry } from '../endpointRegistry'
import { gatewayPatterns } from './gatewayPatterns'

const normalize = (pattern) => pattern.trim()

const isCovered = (path, pattern) => {
  const p = normalize(pattern)
  if (p.endsWith('/**')) {
    const base = p.slice(0, -3)
    return path === base || path.startsWith(`${base}/`)
  }
  return path === p || path.startsWith(`${p}/`)
}

describe('gateway coverage contract', () => {
  it('covers every frontend endpoint with at least one gateway pattern', () => {
    const uncovered = endpointRegistry.filter((endpoint) =>
      !gatewayPatterns.some((pattern) => isCovered(endpoint.path, pattern))
    )

    expect(uncovered).toEqual([])
  })

  it('does not expose voucher route patterns in gateway contract', () => {
    const voucherPatterns = gatewayPatterns.filter((pattern) =>
      /\/api\/vouchers(\/|$)/.test(pattern)
    )
    expect(voucherPatterns).toEqual([])
  })
})
