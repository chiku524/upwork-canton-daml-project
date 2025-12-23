// Simple test endpoint to verify API routes are working
export default async function handler(req, res) {
  console.log('[api/test] Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
  })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    console.log('[api/test] Handling OPTIONS preflight')
    return res.status(200).end()
  }

  const response = {
    success: true,
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      ledgerUrl: process.env.VITE_LEDGER_URL || 'not set',
    },
    request: {
      method: req.method,
      url: req.url,
    }
  }

  console.log('[api/test] Sending response:', response)
  return res.status(200).json(response)
}

