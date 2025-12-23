/**
 * CORS Proxy Service
 * Provides fallback CORS proxy when Vercel API routes aren't available
 */

// Note: Public CORS proxies are unreliable and often blocked
// The best solution is to configure Vercel API routes properly
// This is a temporary fallback that may not work

// Disable CORS proxy by default - it's too unreliable
const CORS_PROXY_ENABLED = false

const CORS_PROXIES = [
  {
    name: 'cors-anywhere',
    format: (url) => `https://cors-anywhere.herokuapp.com/${url}`,
    supportsPost: true,
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
  // CORS proxy is disabled by default due to reliability issues
  if (!CORS_PROXY_ENABLED) {
    throw new Error('CORS proxy is disabled. Please configure Vercel API routes. See docs/VERCEL_FIX.md for instructions.')
  }
  
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

