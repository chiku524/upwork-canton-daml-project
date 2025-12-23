/**
 * Health check utility for API routes
 */

/**
 * Check if API routes are accessible
 * @returns {Promise<boolean>} True if API routes are working
 */
export async function checkApiHealth() {
  try {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateIds: ['Test'],
        query: {},
      }),
    })
    
    // Even if the query fails, if we get a response (not 404), the API route is working
    return response.status !== 404
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

