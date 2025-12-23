import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLedger } from '../hooks/useLedger'
import { useWallet } from '../hooks/useWallet'

export default function MarketsList() {
  const { ledger } = useLedger()
  const { wallet } = useWallet()
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!ledger || !wallet) return

      try {
        setLoading(true)
        // Query active markets from the ledger
        const markets = await ledger.query(['PredictionMarkets:Market'], {})
        setMarkets(markets)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching markets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [ledger, wallet])

  const getStatusClass = (status) => {
    const statusMap = {
      Active: 'status-active',
      Resolving: 'status-resolving',
      Settled: 'status-settled',
      PendingApproval: 'status-pending',
    }
    return statusMap[status] || 'status-pending'
  }

  if (loading) {
    return <div className="loading">Loading markets...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
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
          {markets.map((market) => (
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

