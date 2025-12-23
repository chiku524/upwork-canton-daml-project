import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLedger } from '../hooks/useLedger'
import { useWallet } from '../hooks/useWallet'

export default function Portfolio() {
  const { ledger } = useLedger()
  const { wallet } = useWallet()
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPositions = async () => {
      if (!ledger || !wallet) return

      try {
        setLoading(true)
        // Query user's positions
        const positions = await ledger.query(['PredictionMarkets:Position'], { owner: wallet.party })
        setPositions(positions)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [ledger, wallet])

  if (loading) {
    return <div className="loading">Loading portfolio...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div>
      <h1>My Portfolio</h1>
      {positions.length === 0 ? (
        <div className="card">
          <p>You don't have any positions yet. Start trading to see your portfolio here!</p>
          <Link to="/">
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Browse Markets
            </button>
          </Link>
        </div>
      ) : (
        <div>
          {positions.map((position) => (
            <div key={position.contractId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>
                    Market: {position.payload.marketId}
                  </h3>
                  <p>
                    Type: {position.payload.positionType.tag === 'Yes' 
                      ? 'Yes' 
                      : position.payload.positionType.tag === 'No'
                      ? 'No'
                      : position.payload.positionType.value}
                  </p>
                  <p>Amount: {position.payload.amount}</p>
                  <p>Price: {position.payload.price}</p>
                </div>
                <Link to={`/market/${position.payload.marketId}`}>
                  <button className="btn-secondary">View Market</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

