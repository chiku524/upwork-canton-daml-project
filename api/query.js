// Vercel serverless function to proxy Canton JSON API queries
// Located at project root /api/ directory (Vercel requirement)
export default async function handler(req, res) {
  // CRITICAL: Log immediately to verify function is being called
  console.log('[api/query] ===== FUNCTION INVOKED =====')
  console.log('[api/query] Request received:', {
    method: req.method,
    url: req.url,
    path: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body,
  })
  console.log('[api/query] Environment:', {
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  })
  
  // IMPORTANT: Set CORS headers FIRST before any other operations
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('[api/query] Handling OPTIONS preflight')
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[api/query] Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed', received: req.method })
  }

  const LEDGER_URL = process.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

  try {
    // Ensure we're using HTTPS and the correct endpoint
    // Remove trailing slash from LEDGER_URL if present
    const baseUrl = LEDGER_URL.replace(/\/$/, '')
    const queryUrl = `${baseUrl}/v1/query`
    console.log('[api/query] Fetching from ledger:', queryUrl)
    console.log('[api/query] Request body:', JSON.stringify(req.body))
    
    // Ensure request body matches Canton JSON API format
    const requestBody = {
      templateIds: req.body.templateIds || [],
      query: req.body.query || {},
    }
    console.log('[api/query] Formatted request body:', JSON.stringify(requestBody))
    
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      body: JSON.stringify(requestBody),
      redirect: 'follow', // Follow redirects if any
    })
    
    console.log('[api/query] Response URL:', response.url) // Log final URL after redirects
    console.log('[api/query] Response status:', response.status)
    console.log('[api/query] Response headers:', Object.fromEntries(response.headers.entries()))

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    console.log('[api/query] Response content-type:', contentType)
    
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log('[api/query] Non-JSON response:', text.substring(0, 500))
      data = { error: 'Non-JSON response', text: text.substring(0, 500) }
    }
    
    console.log('[api/query] Ledger response data:', JSON.stringify(data).substring(0, 200))
    
    if (!response.ok) {
      console.log('[api/query] Ledger returned error, forwarding status:', response.status)
      
      // If 404, provide helpful error message
      if (response.status === 404) {
        console.error('[api/query] 404 Error - Canton endpoint may not be configured')
        console.error('[api/query] Error details:', JSON.stringify(data))
        
        // Return a more helpful error message
        return res.status(404).json({
          error: 'Canton endpoint not found',
          message: 'The Canton participant JSON API endpoint is not configured or accessible.',
          details: data,
          suggestion: 'Please verify that the Canton participant has the JSON API enabled and the endpoint path is correct.',
          endpoint: queryUrl
        })
      }
      
      return res.status(response.status).json(data)
    }

    console.log('[api/query] Sending successful response')
    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/query] Query proxy error:', error)
    console.error('[api/query] Error stack:', error.stack)
    return res.status(500).json({ 
      error: 'Failed to query ledger',
      message: error.message 
    })
  }
}
