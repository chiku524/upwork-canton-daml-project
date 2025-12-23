/**
 * CORS Proxy Service
 * Provides fallback CORS proxy when Vercel API routes aren't available
 */

// List of public CORS proxy services (fallback options)
// Note: These are public proxies and may have rate limits
const CORS_PROXIES = [
  {
    name: 'allorigins',
    format: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'corsproxy',
    format: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  },
]

let currentProxyIndex = 0
let proxyFailures = 0
const MAX_PROXY_FAILURES = 3

/**
 * Get current CORS proxy formatter
 * @returns {object} Proxy formatter
 */
function getCurrentProxy() {
  return CORS_PROXIES[currentProxyIndex]
}

/**
 * Rotate to next CORS proxy
 */
function rotateProxy() {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length
  console.log(`Rotating to CORS proxy: ${getCurrentProxy().name}`)
}

/**
 * Fetch with CORS proxy
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithProxy(url, options = {}) {
  const proxy = getCurrentProxy()
  const proxiedUrl = proxy.format(url)
  
  try {
    const response = await fetch(proxiedUrl, {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
    if (!response.ok && response.status >= 500) {
      throw new Error(`Proxy returned ${response.status}`)
    }
    
    // Reset failure count on success
    proxyFailures = 0
    return response
  } catch (error) {
    proxyFailures++
    console.warn(`CORS proxy ${proxy.name} failed (${proxyFailures}/${MAX_PROXY_FAILURES}):`, error.message)
    
    // Try next proxy if we haven't exceeded max failures
    if (proxyFailures < MAX_PROXY_FAILURES && CORS_PROXIES.length > 1) {
      rotateProxy()
      return fetchWithProxy(url, options)
    }
    
    throw new Error(`All CORS proxies failed. Please configure Vercel API routes. Original error: ${error.message}`)
  }
}

/**
 * Check if CORS proxy is available
 * @returns {boolean} True if proxy should be used
 */
export function shouldUseProxy() {
  return true // Always available as fallback
}

