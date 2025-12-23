import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLedger } from '../hooks/useLedger'
import { useWallet } from '../hooks/useWallet'
import { useWebSocket } from '../hooks/useWebSocket'
import { debounce } from '../utils/performance'

export default function MarketsList() {
  const { ledger } = useLedger()
  const { wallet } = useWallet()
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // WebSocket disabled by default (falls back to polling)
  // Enable in useWebSocket.js if WebSocket support is needed
  const { data: wsMarkets, connected: wsConnected } = useWebSocket(
    ['PredictionMarkets:Market'],
    {},
    false // Disabled - using polling instead
  )

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!ledger || !wallet) return

      try {
        setLoading(true)
        // Query active markets from the ledger
        // Force refresh to get latest data
        const markets = await ledger.query(['PredictionMarkets:Market'], {}, { forceRefresh: true })
        setMarkets(markets)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching markets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()

    // Poll for updates every 15 seconds (reduced frequency to save resources)
    const pollInterval = setInterval(() => {
      if (ledger && wallet) {
        fetchMarkets()
      }
    }, 15000)

    return () => clearInterval(pollInterval)
  }, [ledger, wallet])

  // Update markets when WebSocket data arrives
  useEffect(() => {
    if (wsMarkets && wsMarkets.length > 0) {
      setMarkets(wsMarkets)
      setLoading(false)
    }
  }, [wsMarkets])

  const getStatusClass = useMemo(() => {
    const statusMap = {
      Active: 'status-active',
      Resolving: 'status-resolving',
      Settled: 'status-settled',
      PendingApproval: 'status-pending',
    }
    return (status) => statusMap[status] || 'status-pending'
  }, [])

  // Memoize filtered/sorted markets for performance
  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => {
      // Sort by status (Active first) then by volume
      const statusOrder = { Active: 0, Resolving: 1, PendingApproval: 2, Settled: 3 }
      const statusDiff = (statusOrder[a.payload.status] || 99) - (statusOrder[b.payload.status] || 99)
      if (statusDiff !== 0) return statusDiff
      return (b.payload.totalVolume || 0) - (a.payload.totalVolume || 0)
    })
  }, [markets])

  if (loading) {
    return (
      <div className="loading">
        <p>Loading markets...</p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
          Connecting to Canton ledger...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="error">
          <strong>Error loading markets:</strong> {error}
          <br />
          <small style={{ marginTop: '0.5rem', display: 'block' }}>
            Please check your connection and try again. If the problem persists, the ledger may be temporarily unavailable.
          </small>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Prediction Markets</h1>
      {markets.length === 0 ? (
        <div className="card">
          <p>No markets found. Create your first market to get started!</p>
          <Link to="/create">
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Create Market
            </button>
          </Link>
        </div>
      ) : (
        <div className="market-grid">
          {sortedMarkets.map((market) => (
            <Link
              key={market.contractId}
              to={`/market/${market.payload.marketId}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="market-card">
                <h3>{market.payload.title}</h3>
                <span className={`status ${getStatusClass(market.payload.status)}`}>
                  {market.payload.status}
                </span>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  {market.payload.description.substring(0, 100)}...
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Volume: {market.payload.totalVolume}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {market.payload.marketType === 'Binary' ? 'Binary' : 'Multi-Outcome'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

