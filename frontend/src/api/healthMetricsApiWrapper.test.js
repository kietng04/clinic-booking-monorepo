import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetMetrics = vi.hoisted(() => vi.fn())
const mockGetMetricsByType = vi.hoisted(() => vi.fn())
const mockLogMetric = vi.hoisted(() => vi.fn())
const mockUpdateMetric = vi.hoisted(() => vi.fn())
const mockDeleteMetric = vi.hoisted(() => vi.fn())

vi.mock('./realApis/healthMetricsApi', () => ({
  healthMetricsApi: {
    getMetrics: mockGetMetrics,
    getMetricsByType: mockGetMetricsByType,
    logMetric: mockLogMetric,
    updateMetric: mockUpdateMetric,
    deleteMetric: mockDeleteMetric,
  },
}))

vi.mock('./mockApi', () => ({
  healthMetricsApi: {},
}))

import { healthMetricsApi } from './healthMetricsApiWrapper'

describe('healthMetricsApiWrapper', () => {
  beforeEach(() => {
    mockGetMetrics.mockReset()
    mockGetMetricsByType.mockReset()
    mockLogMetric.mockReset()
    mockUpdateMetric.mockReset()
    mockDeleteMetric.mockReset()
  })

  it('provides getMetrics alias for dashboard compatibility', async () => {
    mockGetMetrics.mockResolvedValue([])

    await healthMetricsApi.getMetrics('32', { size: 5 })

    expect(mockGetMetrics).toHaveBeenCalledWith('32', { size: 5 })
  })
})
