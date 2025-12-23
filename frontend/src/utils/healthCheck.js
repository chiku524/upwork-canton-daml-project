/**
 * Health check utility for API routes
 */

/**
 * Check if API routes are accessible
 * @returns {Promise<boolean>} True if API routes are working
 */
export async function checkApiHealth() {
  try {
    // Check the health endpoint with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    try {
      const healthResponse = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (healthResponse.ok) {
        return true
      }
      
      // If health endpoint returns non-404, API routes exist but may have issues
      if (healthResponse.status !== 404) {
        return true // Routes exist, just not working perfectly
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return false // Timeout
      }
    }

    // If health endpoint returns 404, API routes don't exist
    return false
  } catch (error) {
    return false
  }
}

/**
 * Check if direct ledger connection works (for fallback)
 * @param {string} ledgerUrl - Ledger URL
 * @returns {Promise<boolean>} True if direct connection works
 */
export async function checkDirectConnection(ledgerUrl) {
  try {
    const response = await fetch(`${ledgerUrl}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateIds: ['Test'],
        query: {},
      }),
    })
    
    return response.status !== 404 && response.status < 500
  } catch (error) {
    return false
  }
}

