// Vercel serverless function to proxy Canton JSON API commands
// Located at project root /api/ directory (Vercel requirement)
export default async function handler(req, res) {
  // Log for debugging - this should appear in Vercel function logs if request reaches here
  console.log('[api/command] ===== FUNCTION INVOKED =====')
  console.log('[api/command] Request received:', {
    method: req.method,
    url: req.url,
    path: req.url,
    query: req.query,
    headers: req.headers,
    body: req.body,
  })
  console.log('[api/command] Environment:', {
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  })

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('[api/command] Handling OPTIONS preflight')
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[api/command] Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed', received: req.method })
  }

  const LEDGER_URL = process.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

  try {
    // Ensure we're using HTTPS and the correct endpoint
    // Remove trailing slash from LEDGER_URL if present
    const baseUrl = LEDGER_URL.replace(/\/$/, '')
    
    // Try multiple endpoint formats - Canton 3.4 may use different formats
    // v2 uses /v2/commands/submit-and-wait, v1 uses /v1/command
    const possibleEndpoints = [
      `${baseUrl}/v2/commands/submit-and-wait`,
      `${baseUrl}/v1/command`,
      `${baseUrl}/v2/command`,
      `${baseUrl}/command`,
    ]
    
    console.log('[api/command] Trying endpoints:', possibleEndpoints)
    console.log('[api/command] Request body:', JSON.stringify(req.body))
    
    // Extract commands object and party from request
    const commandsObj = req.body.commands || req.body
    const party = commandsObj.party || (Array.isArray(commandsObj.actAs) ? commandsObj.actAs[0] : null)
    
    // Format request body for different API versions
    // v1 expects: { commands: { party, applicationId, commandId, list } }
    const requestBodyV1 = req.body
    
    // v2 expects: { actAs: [party], commands: { party, applicationId, commandId, list } }
    // OR: { actAs: [party], party, applicationId, commandId, list } (unwrapped)
    const requestBodyV2 = {
      actAs: party ? [party] : [],
      ...commandsObj
    }
    
    // Try each endpoint until one works
    let lastError = null
    let response = null
    let usedEndpoint = null
    
    for (const commandUrl of possibleEndpoints) {
      try {
        console.log('[api/command] Trying endpoint:', commandUrl)
        
        // Use v2 format for v2 endpoints, v1 format for v1 endpoints
        const isV2Endpoint = commandUrl.includes('/v2/')
        const requestBody = isV2Endpoint ? requestBodyV2 : requestBodyV1
        
        console.log('[api/command] Using format:', isV2Endpoint ? 'v2' : 'v1')
        console.log('[api/command] Formatted request body:', JSON.stringify(requestBody).substring(0, 500))
        
        response = await fetch(commandUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(req.headers.authorization && { Authorization: req.headers.authorization }),
          },
          body: JSON.stringify(requestBody),
          redirect: 'follow', // Follow redirects if any
        })
        
        console.log('[api/command] Response status:', response.status)
        
        // If we get a non-404 response, this endpoint might work
        if (response.status !== 404) {
          console.log('[api/command] Endpoint responded (not 404):', commandUrl)
          usedEndpoint = commandUrl
          break
        }
        
        // If 404, try next endpoint
        const errorData = await response.json().catch(() => ({}))
        lastError = { endpoint: commandUrl, status: response.status, data: errorData }
        console.log('[api/command] Endpoint returned 404, trying next:', commandUrl)
        response = null
      } catch (error) {
        console.log('[api/command] Error with endpoint:', commandUrl, error.message)
        lastError = { endpoint: commandUrl, error: error.message }
        response = null
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed, return error
    if (!response) {
      console.error('[api/command] All endpoints failed. Last error:', lastError)
      return res.status(404).json({
        error: 'Canton endpoint not found',
        message: 'Tried multiple endpoint formats but none responded successfully.',
        triedEndpoints: possibleEndpoints,
        lastError: lastError,
        suggestion: 'Please verify the Canton participant JSON API is enabled and the endpoint path is correct. Check the OpenAPI docs at the base URL + /docs/openapi'
      })
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    console.log('[api/command] Response content-type:', contentType)
    console.log('[api/command] Response status:', response.status)
    console.log('[api/command] Successful response from:', usedEndpoint)
    
    let data
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.log('[api/command] Non-JSON response:', text.substring(0, 500))
        data = { error: 'Non-JSON response', text: text.substring(0, 500) }
      }
    } catch (parseError) {
      console.error('[api/command] Error parsing response:', parseError)
      data = { 
        error: 'Failed to parse response', 
        message: parseError.message,
        status: response.status 
      }
    }
    
    console.log('[api/command] Ledger response data:', JSON.stringify(data).substring(0, 200))
    
    if (!response.ok) {
      console.log('[api/command] Ledger returned error, forwarding status:', response.status)
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/command] Command proxy error:', error)
    console.error('[api/command] Error stack:', error.stack)
    return res.status(500).json({ 
      error: 'Failed to submit command',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
