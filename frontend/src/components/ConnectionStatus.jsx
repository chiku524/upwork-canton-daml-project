import { useState, useEffect } from 'react'
import { checkApiHealth } from '../utils/healthCheck'

/**
 * Component to show connection status
 */
export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking') // 'checking' | 'connected' | 'disconnected'
  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkApiHealth()
        setStatus(isHealthy ? 'connected' : 'disconnected')
        setLastCheck(new Date())
      } catch (error) {
        setStatus('disconnected')
        setLastCheck(new Date())
      }
    }

    // Check immediately
    checkConnection()

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  if (status === 'checking') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '1rem', 
        right: '1rem', 
        padding: '0.5rem 1rem',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        Checking connection...
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '1rem', 
      right: '1rem', 
      padding: '0.5rem 1rem',
      background: status === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      border: `1px solid ${status === 'connected' ? '#22c55e' : '#ef4444'}`,
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: status === 'connected' ? '#22c55e' : '#ef4444',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: status === 'connected' ? '#22c55e' : '#ef4444',
        animation: status === 'connected' ? 'pulse 2s infinite' : 'none'
      }} />
      <span>
        {status === 'connected' ? 'Connected' : 'Connection Issue'}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

