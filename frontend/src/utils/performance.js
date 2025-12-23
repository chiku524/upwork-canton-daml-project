/**
 * Performance monitoring and optimization utilities
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Measure performance of async function
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for performance mark
 * @returns {Promise} Result of function
 */
export async function measurePerformance(fn, label) {
  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    console.error(`[Performance] ${label} failed after ${(end - start).toFixed(2)}ms:`, error)
    throw error
  }
}

/**
 * Lazy load image
 * @param {string} src - Image source
 * @returns {Promise} Promise that resolves when image is loaded
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

