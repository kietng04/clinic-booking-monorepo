/**
 * API Retry Utility with Exponential Backoff
 *
 * Handles transient failures (503, network errors) by retrying with increasing delays.
 * Respects AbortSignal for cleanup on component unmount.
 */

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [503, 504, 502, 408, 429], // Service unavailable, timeout, etc.
  onRetry: null, // Callback: (attempt, error, delay) => void
}

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<void>}
 */
const sleep = (ms, signal) => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }

    const timeoutId = setTimeout(resolve, ms)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Request aborted', 'AbortError'))
      })
    }
  })
}

/**
 * Check if error is retryable
 * @param {Error} error - The error to check
 * @param {number[]} retryableCodes - HTTP status codes that should trigger retry
 * @returns {boolean}
 */
const isRetryableError = (error, retryableCodes) => {
  // Network errors (connection lost, timeout)
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return true
  }

  // HTTP errors with retryable status codes
  if (error.response?.status && retryableCodes.includes(error.response.status)) {
    return true
  }

  return false
}

/**
 * Calculate delay for next retry using exponential backoff
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
const calculateDelay = (attempt, config) => {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt)
  return Math.min(delay, config.maxDelay)
}

/**
 * Retry an async function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {number[]} options.retryableStatusCodes - Status codes to retry (default: [503, 504, 502, 408, 429])
 * @param {Function} options.onRetry - Callback on retry: (attempt, error, delay) => void
 * @param {AbortSignal} options.signal - Abort signal for cleanup
 * @returns {Promise} Result of the function or throws last error
 *
 * @example
 * const data = await withRetry(
 *   () => statsApi.getAdminAnalyticsDashboard(),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error, delay) => {
 *       console.log(`Retry ${attempt} after ${delay}ms due to:`, error.message)
 *     },
 *     signal: abortController.signal
 *   }
 * )
 */
export const withRetry = async (fn, options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options }
  let lastError = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Check if aborted before attempting
      if (config.signal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError')
      }

      // Attempt the function
      const result = await fn()
      return result

    } catch (error) {
      lastError = error

      // Don't retry on abort
      if (error.name === 'AbortError') {
        throw error
      }

      // Check if we should retry
      const shouldRetry = attempt < config.maxRetries &&
                          isRetryableError(error, config.retryableStatusCodes)

      if (!shouldRetry) {
        throw error
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, config)

      if (config.onRetry) {
        config.onRetry(attempt + 1, error, delay)
      }

      // Wait before retrying
      await sleep(delay, config.signal)
    }
  }

  // Should not reach here, but throw last error just in case
  throw lastError
}

/**
 * Create a retry wrapper for a specific API function
 * Useful for creating pre-configured retry functions
 *
 * @param {Function} apiFn - The API function to wrap
 * @param {object} defaultOptions - Default retry options
 * @returns {Function} Wrapped function with retry logic
 *
 * @example
 * const getAdminAnalyticsWithRetry = createRetryWrapper(
 *   statsApi.getAdminAnalyticsDashboard,
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 *
 * // Usage in component
 * const data = await getAdminAnalyticsWithRetry({
 *   signal: abortController.signal,
 *   onRetry: (attempt) => setRetrying(true)
 * })
 */
export const createRetryWrapper = (apiFn, defaultOptions = {}) => {
  return (runtimeOptions = {}) => {
    const mergedOptions = { ...defaultOptions, ...runtimeOptions }
    return withRetry(apiFn, mergedOptions)
  }
}

export default withRetry
