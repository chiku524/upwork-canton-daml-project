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
    console.log('[api/query] Fetching from ledger:', LEDGER_URL)
    const response = await fetch(`${LEDGER_URL}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      body: JSON.stringify(req.body),
    })

    console.log('[api/query] Ledger response status:', response.status)
    const data = await response.json()
    console.log('[api/query] Ledger response data:', JSON.stringify(data).substring(0, 200))
    
    if (!response.ok) {
      console.log('[api/query] Ledger returned error, forwarding status:', response.status)
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
