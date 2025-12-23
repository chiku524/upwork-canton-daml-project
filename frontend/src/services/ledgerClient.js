import axios from 'axios'
import { formatError } from '../utils/errorHandler'

const LEDGER_URL = import.meta.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

// Use proxy API routes in production to avoid CORS issues
const USE_PROXY = import.meta.env.PROD || window.location.hostname !== 'localhost'

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
   * Query contracts
   * @param {string[]} templateIds - Template IDs to query
   * @param {object} query - Query filters
   * @returns {Promise<object[]>} Array of contract results
   */
  async query(templateIds, query = {}) {
    try {
      const endpoint = this.useProxy ? '/api/query' : `${this.baseUrl}/v1/query`
      const response = await this.client.post(endpoint, {
        templateIds,
        query,
      })
      return response.data.result || []
    } catch (error) {
      console.error('Query error:', error)
      // Format error for better user experience
      const formattedError = new Error(formatError(error))
      formattedError.originalError = error
      throw formattedError
    }
  }

  /**
   * Submit a command (create contract or exercise choice)
   * @param {object} commands - Command object
   * @returns {Promise<object>} Command result
   */
  async submitCommand(commands) {
    try {
      const endpoint = this.useProxy ? '/api/command' : `${this.baseUrl}/v1/command`
      const response = await this.client.post(endpoint, {
        commands,
      })
      return response.data
    } catch (error) {
      console.error('Command error:', error)
      // Format error for better user experience
      const formattedError = new Error(formatError(error))
      formattedError.originalError = error
      throw formattedError
    }
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

