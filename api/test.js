// Simple test endpoint to verify API routes are working
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    success: true,
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      ledgerUrl: process.env.VITE_LEDGER_URL || 'not set',
    }
  })
}

