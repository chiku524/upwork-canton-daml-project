/**
 * CORS Proxy Service
 * Provides fallback CORS proxy when Vercel API routes aren't available
 */

// List of public CORS proxy services (fallback options)
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
]

let currentProxyIndex = 0

/**
 * Get current CORS proxy URL
 * @returns {string} Proxy URL
 */
export function getCorsProxy() {
  return CORS_PROXIES[currentProxyIndex]
}

/**
 * Rotate to next CORS proxy
 */
export function rotateProxy() {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length
}

/**
 * Fetch with CORS proxy
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithProxy(url, options = {}) {
  const proxy = getCorsProxy()
  
  // Format URL for proxy
  const proxiedUrl = proxy + encodeURIComponent(url)
  
  try {
    const response = await fetch(proxiedUrl, {
      ...options,
      headers: {
        ...options.headers,
        // Some proxies need specific headers
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
    return response
  } catch (error) {
    // Try next proxy if current one fails
    rotateProxy()
    throw error
  }
}

