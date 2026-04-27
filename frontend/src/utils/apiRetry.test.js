import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRetryWrapper, withRetry } from './apiRetry'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('retries retryable failures and eventually resolves', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 503 }, message: 'Service unavailable' })
      .mockRejectedValueOnce({ code: 'ECONNABORTED', message: 'Timeout' })
      .mockResolvedValue('ok')
    const onRetry = vi.fn()

    const promise = withRetry(fn, {
      maxRetries: 3,
      initialDelay: 10,
      maxDelay: 25,
      onRetry,
    })

    await vi.advanceTimersByTimeAsync(10)
    await vi.advanceTimersByTimeAsync(20)

    await expect(promise).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
    expect(onRetry).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ message: 'Service unavailable' }),
      10
    )
    expect(onRetry).toHaveBeenNthCalledWith(
      2,
      2,
      expect.objectContaining({ code: 'ECONNABORTED' }),
      20
    )
  })

  it('does not retry non-retryable failures', async () => {
    const fn = vi.fn().mockRejectedValue({ response: { status: 400 }, message: 'Bad request' })

    await expect(
      withRetry(fn, {
        maxRetries: 3,
        initialDelay: 10,
      })
    ).rejects.toMatchObject({
      response: { status: 400 },
    })

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('aborts while waiting between retries', async () => {
    const controller = new AbortController()
    const fn = vi.fn().mockRejectedValue({ response: { status: 503 }, message: 'Retry me' })

    const promise = withRetry(fn, {
      maxRetries: 1,
      initialDelay: 50,
      signal: controller.signal,
    })

    controller.abort()

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('merges createRetryWrapper defaults with runtime options', async () => {
    const apiFn = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 503 }, message: 'Try again' })
      .mockResolvedValue('wrapped')
    const wrapped = createRetryWrapper(apiFn, {
      maxRetries: 1,
      initialDelay: 15,
    })

    const promise = wrapped({
      maxDelay: 15,
    })

    await vi.advanceTimersByTimeAsync(15)
    await expect(promise).resolves.toBe('wrapped')
    expect(apiFn).toHaveBeenCalledTimes(2)
  })
})
