/**
 * Simple in-memory cache utility
 */

class Cache {
  constructor(defaultTTL = 60000) { // 1 minute default TTL
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Generate cache key from template IDs and query
   * @param {string[]} templateIds - Template IDs
   * @param {object} query - Query object
   * @returns {string} Cache key
   */
  static generateKey(templateIds, query = {}) {
    return `query:${templateIds.join(',')}:${JSON.stringify(query)}`
  }
}

// Export singleton instance
export const cache = new Cache()

// Export class for custom instances
export default Cache

