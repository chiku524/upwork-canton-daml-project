/**
 * CORS Proxy Service
 * Provides fallback CORS proxy when Vercel API routes aren't available
 */

// List of public CORS proxy services (fallback options)
// Note: These are public proxies and may have rate limits
// Using services that support POST requests
const CORS_PROXIES = [
  {
    name: 'cors-anywhere',
    format: (url) => `https://cors-anywhere.herokuapp.com/${url}`,
    supportsPost: true,
  },
  {
    name: 'allorigins',
    format: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    supportsPost: false, // Only supports GET
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
  // Find a proxy that supports the request method
  const method = options.method || 'GET'
  const needsPost = method === 'POST' || method === 'PUT' || method === 'PATCH'
  
  // Filter proxies that support the method
  const availableProxies = CORS_PROXIES.filter(p => !needsPost || p.supportsPost)
  
  if (availableProxies.length === 0) {
    throw new Error('No CORS proxy available for POST requests. Please configure Vercel API routes.')
  }
  
  // Use first available proxy
  const proxy = availableProxies[0]
  const proxiedUrl = proxy.format(url)
  
  try {
    const response = await fetch(proxiedUrl, {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
    if (!response.ok) {
      // Don't throw on 4xx errors from the target API, only on proxy errors
      if (response.status >= 500) {
        throw new Error(`Proxy returned ${response.status}`)
      }
    }
    
    // Reset failure count on success
    proxyFailures = 0
    return response
  } catch (error) {
    proxyFailures++
    console.warn(`CORS proxy ${proxy.name} failed (${proxyFailures}/${MAX_PROXY_FAILURES}):`, error.message)
    
    // Try next proxy if available
    if (proxyFailures < MAX_PROXY_FAILURES && availableProxies.length > 1) {
      rotateProxy()
      return fetchWithProxy(url, options)
    }
    
    throw new Error(`CORS proxy failed. Please configure Vercel API routes or enable CORS on the Canton participant. Original error: ${error.message}`)
  }
}

/**
 * Check if CORS proxy is available
 * @returns {boolean} True if proxy should be used
 */
export function shouldUseProxy() {
  return true // Always available as fallback
}

