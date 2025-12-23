/**
 * Retry utility with exponential backoff
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // Retry on network errors and 5xx server errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return true
      }
      if (error.response?.status >= 500) {
        return true
      }
      return false
    },
  } = options

  let lastError
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if we've exhausted retries or error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 2, maxDelay)
    }
  }

  throw lastError
}

/**
 * Create a retry wrapper for async functions
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Retry options
 * @returns {Function} Wrapped function with retry logic
 */
export function withRetry(fn, options = {}) {
  return async (...args) => {
    return retryWithBackoff(() => fn(...args), options)
  }
}

