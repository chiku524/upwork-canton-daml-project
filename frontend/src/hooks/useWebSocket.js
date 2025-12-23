import { useEffect, useRef, useState } from 'react'

const LEDGER_URL = import.meta.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

/**
 * Hook for WebSocket connection to Canton ledger
 * Provides real-time updates for contract changes
 */
export function useWebSocket(templateIds = [], query = {}, enabled = true) {
  const [data, setData] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  useEffect(() => {
    if (!enabled || templateIds.length === 0) {
      return
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = LEDGER_URL
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')
      .replace('/v1', '') + '/v1/stream/query'

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setConnected(true)
          setError(null)

          // Subscribe to contract updates
          ws.send(JSON.stringify({
            templateIds,
            query,
          }))
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            
            // Handle different message types
            if (message.result) {
              setData(message.result)
            } else if (message.event) {
              // Handle contract events (created, archived, etc.)
              console.log('Contract event:', message.event)
              // Trigger cache invalidation or data refresh
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }

        ws.onerror = (err) => {
          console.error('WebSocket error:', err)
          setError('WebSocket connection error')
          setConnected(false)
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setConnected(false)
          
          // Attempt to reconnect after delay
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled) {
              connect()
            }
          }, 3000)
        }
      } catch (err) {
        console.error('Failed to create WebSocket:', err)
        setError(err.message)
      }
    }

    connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [templateIds, JSON.stringify(query), enabled])

  return { data, connected, error }
}

