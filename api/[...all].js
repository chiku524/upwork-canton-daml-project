// Catch-all route to debug routing issues
// This will help identify if requests are reaching the API directory
export default async function handler(req, res) {
  console.log('[api/[...all]] Catch-all route hit:', {
    method: req.method,
    url: req.url,
    query: req.query,
    path: req.url,
  })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    message: 'Catch-all route working',
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString(),
  })
}

