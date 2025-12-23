import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLedger } from '../hooks/useLedger'
import { useWallet } from '../hooks/useWallet'

export default function MarketDetail() {
  const { marketId } = useParams()
  const navigate = useNavigate()
  const { ledger } = useLedger()
  const { wallet } = useWallet()
  const [market, setMarket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [positionAmount, setPositionAmount] = useState('')
  const [positionType, setPositionType] = useState('Yes')
  const [positionPrice, setPositionPrice] = useState('0.5')

  useEffect(() => {
    const fetchMarket = async () => {
      if (!ledger || !wallet) return

      try {
        setLoading(true)
        // Fetch market details
        const response = await fetch(`https://participant.dev.canton.wolfedgelabs.com/v1/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateIds: ['PredictionMarkets:Market'],
            query: { marketId: marketId },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch market')
        }

        const data = await response.json()
        if (data.result && data.result.length > 0) {
          setMarket(data.result[0])
        } else {
          setError('Market not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMarket()
  }, [marketId, ledger, wallet])

  const handleCreatePosition = async () => {
    if (!wallet || !market) return

    try {
      const response = await fetch('https://participant.dev.canton.wolfedgelabs.com/v1/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: {
            party: wallet.party,
            applicationId: 'prediction-markets',
            commandId: `create-position-${Date.now()}`,
            list: [
              {
                templateId: 'PredictionMarkets:Market',
                contractId: market.contractId,
                choice: 'CreatePosition',
                argument: {
                  positionId: `pos-${Date.now()}`,
                  owner: wallet.party,
                  positionType: positionType === 'Yes' ? { tag: 'Yes' } : { tag: 'No' },
                  amount: parseFloat(positionAmount),
                  price: parseFloat(positionPrice),
                },
              },
            ],
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create position')
      }

      alert('Position created successfully!')
      // Refresh market data
      window.location.reload()
    } catch (err) {
      alert('Error creating position: ' + err.message)
    }
  }

  if (loading) {
    return <div className="loading">Loading market...</div>
  }

  if (error || !market) {
    return (
      <div>
        <div className="error">{error || 'Market not found'}</div>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back to Markets
        </button>
      </div>
    )
  }

  const marketData = market.payload

  return (
    <div>
      <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '2rem' }}>
        ← Back to Markets
      </button>

      <div className="card">
        <h1>{marketData.title}</h1>
        <span className={`status status-${marketData.status.toLowerCase()}`}>
          {marketData.status}
        </span>
        <p style={{ marginTop: '1rem' }}>{marketData.description}</p>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Total Volume</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{marketData.totalVolume}</p>
          </div>
          <div>
            <h3>Yes Volume</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{marketData.yesVolume}</p>
          </div>
          <div>
            <h3>No Volume</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{marketData.noVolume}</p>
          </div>
        </div>
      </div>

      {marketData.status === 'Active' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Create Position</h2>
          <div className="form-group">
            <label>Position Type</label>
            <select
              value={positionType}
              onChange={(e) => setPositionType(e.target.value)}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={positionAmount}
              onChange={(e) => setPositionAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Price per Share (0.0 - 1.0)</label>
            <input
              type="number"
              value={positionPrice}
              onChange={(e) => setPositionPrice(e.target.value)}
              placeholder="0.5"
              min="0"
              max="1"
              step="0.01"
            />
          </div>
          <button className="btn-primary" onClick={handleCreatePosition}>
            Create Position
          </button>
        </div>
      )}
    </div>
  )
}

