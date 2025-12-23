// Alternative format: API route as directory with index.js
// Some Vercel setups require this format
export default async function handler(req, res) {
  console.log('[api/query/index] Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
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
    console.log('[api/query/index] Handling OPTIONS preflight')
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[api/query/index] Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed', received: req.method })
  }

  const LEDGER_URL = process.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

  try {
    console.log('[api/query/index] Proxying to:', LEDGER_URL)
    const response = await fetch(`${LEDGER_URL}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    console.log('[api/query/index] Response status:', response.status)
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/query/index] Error:', error)
    return res.status(500).json({ 
      error: 'Failed to query ledger',
      message: error.message 
    })
  }
}

