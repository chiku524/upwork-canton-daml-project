import { useState, useEffect } from 'react'
import { DamlLedger } from '@digitalasset/daml-ledger'

const LEDGER_URL = import.meta.env.VITE_LEDGER_URL || 'https://participant.dev.canton.wolfedgelabs.com'

export function useLedger() {
  const [ledger, setLedger] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const connect = async () => {
      try {
        const newLedger = new DamlLedger({
          token: null, // Will be set when wallet connects
          httpBaseUrl: LEDGER_URL,
          wsBaseUrl: LEDGER_URL.replace('https://', 'wss://').replace('http://', 'ws://'),
        })
        setLedger(newLedger)
        setIsConnected(true)
      } catch (err) {
        setError(err.message)
        setIsConnected(false)
      }
    }

    connect()
  }, [])

  return { ledger, isConnected, error }
}

