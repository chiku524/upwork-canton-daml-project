// Vercel serverless function to proxy Canton JSON API queries
// This file is in frontend/api/ to match the root directory setting
export default async function handler(req, res) {
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
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const LEDGER_URL = process.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

  try {
    const response = await fetch(`${LEDGER_URL}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Query proxy error:', error)
    return res.status(500).json({ 
      error: 'Failed to query ledger',
      message: error.message 
    })
  }
}
