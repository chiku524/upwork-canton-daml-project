import axios from 'axios'
import { formatError } from '../utils/errorHandler'
import { retryWithBackoff } from '../utils/retry'
import { cache, Cache } from '../utils/cache'

// Import axios for fallback direct connections
const axiosDirect = axios.create()

const LEDGER_URL = import.meta.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

// Use proxy API routes in production to avoid CORS issues
const USE_PROXY = import.meta.env.PROD || window.location.hostname !== 'localhost'

// Cache TTL for queries (5 seconds for real-time feel)
const QUERY_CACHE_TTL = 5000

/**
 * Simple client for Canton JSON API
 * Uses proxy API routes in production to avoid CORS issues
 */
class LedgerClient {
  constructor(baseUrl = LEDGER_URL, token = null) {
    this.baseUrl = baseUrl
    this.token = token
    this.useProxy = USE_PROXY
    
    // For proxy routes, use relative URLs
    // For direct calls (dev), use the full base URL
    const apiBaseUrl = this.useProxy ? '' : baseUrl
    
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
  }

  /**
   * Query contracts with caching and retry logic
   * @param {string[]} templateIds - Template IDs to query
   * @param {object} query - Query filters
   * @param {object} options - Query options
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @param {boolean} options.forceRefresh - Force refresh cache (default: false)
   * @returns {Promise<object[]>} Array of contract results
   */
  async query(templateIds, query = {}, options = {}) {
    const { useCache = true, forceRefresh = false } = options
    
    // Generate cache key
    const cacheKey = Cache.generateKey(templateIds, query)
    
    // Check cache first (unless force refresh)
    if (useCache && !forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }
    }

    try {
      // Retry with exponential backoff
      const result = await retryWithBackoff(async () => {
        const endpoint = this.useProxy ? '/api/query' : `${this.baseUrl}/v1/query`
        
        try {
          const response = await this.client.post(endpoint, {
            templateIds,
            query,
          })
          
          // Handle both direct API response and proxy response
          if (response.data.result) {
            return response.data.result
          } else if (Array.isArray(response.data)) {
            return response.data
          } else {
            return []
          }
        } catch (apiError) {
          // If proxy fails, try direct connection as fallback
          if (this.useProxy && apiError.response?.status === 404) {
            console.warn('Proxy API not found, trying direct connection (may have CORS issues)...')
            try {
              const directResponse = await axiosDirect.post(`${this.baseUrl}/v1/query`, {
                templateIds,
                query,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              return directResponse.data.result || []
            } catch (directError) {
              // If direct also fails, throw original error
              throw apiError
            }
          }
          throw apiError
        }
      }, {
        maxRetries: 2, // Reduced retries
        initialDelay: 1000,
      })

      // Cache the result
      if (useCache) {
        cache.set(cacheKey, result, QUERY_CACHE_TTL)
      }

      return result
    } catch (error) {
      console.error('Query error:', error)
      // Format error for better user experience
      const formattedError = new Error(formatError(error))
      formattedError.originalError = error
      throw formattedError
    }
  }

  /**
   * Submit a command (create contract or exercise choice) with retry logic
   * @param {object} commands - Command object
   * @returns {Promise<object>} Command result
   */
  async submitCommand(commands) {
    try {
      // Retry with exponential backoff for commands
      const result = await retryWithBackoff(async () => {
        const endpoint = this.useProxy ? '/api/command' : `${this.baseUrl}/v1/command`
        const response = await this.client.post(endpoint, {
          commands,
        })
        return response.data
      }, {
        maxRetries: 2, // Fewer retries for commands (they're more critical)
        initialDelay: 1000,
      })

      // Invalidate relevant caches after command
      // This ensures fresh data after mutations
      this.invalidateCache()

      return result
    } catch (error) {
      console.error('Command error:', error)
      // Format error for better user experience
      const formattedError = new Error(formatError(error))
      formattedError.originalError = error
      throw formattedError
    }
  }

  /**
   * Invalidate cache (useful after mutations)
   */
  invalidateCache() {
    cache.clear()
  }

  /**
   * Create a contract
   * @param {string} templateId - Template ID
   * @param {object} payload - Contract payload
   * @param {string} party - Party submitting the command
   * @returns {Promise<object>} Command result
   */
  async create(templateId, payload, party) {
    return this.submitCommand({
      party,
      applicationId: 'prediction-markets',
      commandId: `create-${Date.now()}-${Math.random()}`,
      list: [
        {
          templateId,
          payload,
        },
      ],
    })
  }

  /**
   * Exercise a choice
   * @param {string} templateId - Template ID
   * @param {string} contractId - Contract ID
   * @param {string} choice - Choice name
   * @param {object} argument - Choice argument
   * @param {string} party - Party exercising the choice
   * @returns {Promise<object>} Command result
   */
  async exercise(templateId, contractId, choice, argument, party) {
    return this.submitCommand({
      party,
      applicationId: 'prediction-markets',
      commandId: `exercise-${Date.now()}-${Math.random()}`,
      list: [
        {
          templateId,
          contractId,
          choice,
          argument,
        },
      ],
    })
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setToken(token) {
    this.token = token
    this.client.defaults.headers.Authorization = token ? `Bearer ${token}` : null
  }
}

export default LedgerClient

